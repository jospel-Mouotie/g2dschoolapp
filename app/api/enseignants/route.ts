// app/api/enseignants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    let enseignants;
    if (id) {
      // Récupérer un seul enseignant
      enseignants = await prisma.enseignant.findUnique({
        where: { id: parseInt(id) },
        include: { 
          enseignements: true,
          utilisateur: true,
          cours: true
        }
      });
      return NextResponse.json(enseignants);
    } else {
      // Récupérer tous les enseignants
      enseignants = await prisma.enseignant.findMany({
        include: { 
          enseignements: true,
          utilisateur: true,
          cours: true
        },
        orderBy: { name: 'asc' }
      });
      
      // Formater les données pour le frontend
      const formattedEnseignants = enseignants.map(ens => ({
        id: ens.id,
        name: ens.name,
        email: ens.email,
        phone: ens.phone,
        status: ens.status,
        photo: ens.photo,
        matieres: ens.matieres,
        classes: ens.classes,
        bureau: ens.bureau,
        horaires: ens.horaires,
        enseignements: ens.enseignements,
        utilisateur: ens.utilisateur
      }));
      
      return NextResponse.json(formattedEnseignants);
    }
  } catch (error) {
    console.error("Erreur GET /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    console.log("📝 Création enseignant - données reçues:", data);
    
    // Vérifier si l'email existe déjà dans la table Enseignant
    const existingEnseignant = await prisma.enseignant.findUnique({
      where: { email: data.email }
    });
    
    if (existingEnseignant) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }
    
    // Vérifier si l'email existe déjà dans la table Utilisateur
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé par un compte utilisateur' }, { status: 400 });
    }
    
    // Créer l'enseignant
    const enseignant = await prisma.enseignant.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'Titulaire',
        photo: data.photo || null,
        matieres: data.matieres || "[]",
        classes: data.classes || "[]",
        bureau: data.bureau || null,
        horaires: data.horaires || null
      }
    });
    
    // Générer le mot de passe: prenom123
    let motDePasseBase = data.name.split(' ')[0].toLowerCase();
    motDePasseBase = motDePasseBase
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');
    const motDePasse = `${motDePasseBase}123`;
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    
    // Créer le compte utilisateur pour l'enseignant
    const utilisateur = await prisma.utilisateur.create({
      data: {
        email: data.email,
        motDePasse: hashedPassword,
        nom: data.name,
        role: 'enseignant',
        enseignantId: enseignant.id,
        actif: true
      }
    });
    
    console.log("✅ Enseignant créé:", enseignant.name);
    console.log("✅ Compte utilisateur créé - Email:", data.email, "/ Mot de passe:", motDePasse);
    
    return NextResponse.json({ 
      ...enseignant,
      compte: {
        email: utilisateur.email,
        motDePasse: motDePasse
      }
    }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    const enseignantId = parseInt(data.id);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    // Mettre à jour l'enseignant
    const enseignant = await prisma.enseignant.update({
      where: { id: enseignantId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        photo: data.photo,
        matieres: data.matieres,
        classes: data.classes,
        bureau: data.bureau,
        horaires: data.horaires
      }
    });
    
    // Mettre à jour l'utilisateur associé
    const existingUtilisateur = await prisma.utilisateur.findFirst({
      where: { enseignantId: enseignantId }
    });
    
    if (existingUtilisateur) {
      await prisma.utilisateur.update({
        where: { id: existingUtilisateur.id },
        data: { 
          email: data.email, 
          nom: data.name 
        }
      });
    }
    
    console.log("✅ Enseignant mis à jour:", enseignant.name);
    
    return NextResponse.json(enseignant);
  } catch (error) {
    console.error("❌ Erreur PUT /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    
    const enseignantId = parseInt(id);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    // Supprimer d'abord l'utilisateur associé
    await prisma.utilisateur.deleteMany({
      where: { enseignantId: enseignantId }
    });
    
    // Supprimer les enseignements
    await prisma.enseignement.deleteMany({
      where: { enseignantId: enseignantId }
    });
    
    // Puis supprimer l'enseignant
    await prisma.enseignant.delete({ 
      where: { id: enseignantId } 
    });
    
    console.log("✅ Enseignant supprimé, ID:", enseignantId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur DELETE /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}