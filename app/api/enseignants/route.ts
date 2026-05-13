// app/api/enseignants/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const enseignants = await prisma.enseignant.findMany({
      include: { 
        enseignements: true,
        utilisateur: true // Inclure l'utilisateur pour voir si un compte existe
      }
    });
    
    return NextResponse.json(enseignants);
  } catch (error) {
    console.error("Erreur GET /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    console.log("Création enseignant - données reçues:", data);
    
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
        status: data.status,
        photo: data.photo || null,
        matieres: data.matieres || "[]",
        classes: data.classes || "[]"
      }
    });
    
    // Générer le mot de passe: prenom123 (en minuscules, sans accents)
    let motDePasseBase = data.name.split(' ')[0].toLowerCase();
    // Supprimer les accents
    motDePasseBase = motDePasseBase
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');
    const motDePasse = `${motDePasseBase}123`;
    
    // Hasher le mot de passe
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
    
    console.log("✅ Enseignant créé avec succès:", enseignant);
    console.log(`✅ Compte utilisateur créé - Email: ${data.email} / Mot de passe: ${motDePasse}`);
    
    // Retourner l'enseignant avec les infos du compte
    return NextResponse.json({ 
      ...enseignant,
      compte: {
        email: utilisateur.email,
        motDePasse: motDePasse
      }
    });
  } catch (error) {
    console.error("Erreur POST /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id, ...data } = await request.json();
    
    // Mettre à jour l'enseignant
    const enseignant = await prisma.enseignant.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        photo: data.photo,
        matieres: data.matieres,
        classes: data.classes
      }
    });
    
    // Si l'email a changé, mettre à jour aussi l'utilisateur associé
    if (data.email && data.email !== enseignant.email) {
      const existingUtilisateur = await prisma.utilisateur.findFirst({
        where: { enseignantId: enseignant.id }
      });
      
      if (existingUtilisateur) {
        await prisma.utilisateur.update({
          where: { id: existingUtilisateur.id },
          data: { email: data.email, nom: data.name }
        });
      }
    } else {
      // Mettre à jour le nom de l'utilisateur si nécessaire
      const existingUtilisateur = await prisma.utilisateur.findFirst({
        where: { enseignantId: enseignant.id }
      });
      
      if (existingUtilisateur && existingUtilisateur.nom !== data.name) {
        await prisma.utilisateur.update({
          where: { id: existingUtilisateur.id },
          data: { nom: data.name }
        });
      }
    }
    
    return NextResponse.json(enseignant);
  } catch (error) {
    console.error("Erreur PUT /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    
    // Supprimer d'abord l'utilisateur associé
    await prisma.utilisateur.deleteMany({
      where: { enseignantId: enseignantId }
    });
    
    // Puis supprimer l'enseignant
    await prisma.enseignant.delete({ where: { id: enseignantId } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/enseignants:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}