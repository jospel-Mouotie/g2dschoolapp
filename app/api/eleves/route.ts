// app/api/eleves/route.ts
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
    
    const eleves = await prisma.eleve.findMany();
    return NextResponse.json(eleves);
  } catch (error) {
    console.error("Erreur GET /api/eleves:", error);
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
    
    console.log("📝 Création élève - données reçues:", data);
    
    // 1. Créer l'élève
    const eleve = await prisma.eleve.create({
      data: {
        nom: data.nom,
        classe: data.classe,
        matricule: data.matricule,
        statusColor: data.statusColor || "bg-emerald-400",
        img: data.img,
        photo: data.photo,
        email: data.email,
        telephone: data.telephone,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        nationalite: data.nationalite || "Camerounaise",
        sexe: data.sexe || "Masculin",
        adresse: data.adresse,
        parentNom: data.parentNom,
        parentTelephone: data.parentTelephone,
        parentEmail: data.parentEmail,
        parentProfession: data.parentProfession,
        dateInscription: data.dateInscription || new Date().toISOString().slice(0, 10),
        ancienEtablissement: data.ancienEtablissement,
        redoublant: data.redoublant || false,
        situationFamiliale: data.situationFamiliale,
        nomComplet: data.nomComplet,
        selected: data.selected || false,
        moyenne: data.moyenne,
        noteColor: data.noteColor,
      }
    });
    
    console.log("✅ Élève créé:", eleve.id, eleve.nom);
    
    // 2. Créer automatiquement le compte parent si parentEmail est fourni
    if (data.parentEmail && data.parentNom) {
      // Vérifier si un utilisateur existe déjà avec cet email
      const existingUser = await prisma.utilisateur.findUnique({
        where: { email: data.parentEmail }
      });
      
      if (!existingUser) {
        // Générer le mot de passe: prenom + "123" (en minuscules, sans accents)
        let motDePasseBase = data.parentNom.split(' ')[0].toLowerCase();
        // Supprimer les accents
        motDePasseBase = motDePasseBase
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z]/g, '');
        const motDePasse = `${motDePasseBase}123`;
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, 10);
        
        // Créer l'utilisateur parent
        const parentUser = await prisma.utilisateur.create({
          data: {
            email: data.parentEmail,
            motDePasse: hashedPassword,
            nom: data.parentNom,
            role: 'parent',
            eleveId: eleve.id,
            actif: true,
          }
        });
        
        console.log(`✅ Compte parent créé pour ${data.parentEmail} avec mot de passe: ${motDePasse}`);
      } else {
        console.log(`⚠️ Un compte existe déjà avec l'email ${data.parentEmail}`);
      }
    } else {
      console.log("⚠️ Pas d'email parent fourni, compte parent non créé");
    }
    
    return NextResponse.json(eleve, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST /api/eleves:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}