// app/api/inscription/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { genererMatricule } from '@/lib/matricule';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log("📝 Nouvelle inscription:", data.nom);
    
    // 1. Vérifier si l'élève existe déjà par email
    if (data.email) {
      const existingEleve = await prisma.eleve.findFirst({
        where: { email: data.email }
      });
      
      if (existingEleve) {
        return NextResponse.json({ 
          error: 'Un élève avec cet email existe déjà' 
        }, { status: 400 });
      }
    }
    
    // 2. Vérifier si la classe existe
    const classeExistante = await prisma.classe.findFirst({
      where: { nom: data.classe }
    });
    
    if (!classeExistante) {
      return NextResponse.json({ 
        error: 'Classe invalide' 
      }, { status: 400 });
    }
    
    // 3. Générer le matricule automatiquement
    const dateInscription = new Date();
    const matricule = await genererMatricule(data.classe, dateInscription);
    
    console.log(`📋 Matricule généré: ${matricule}`);
    
    // 4. Créer l'élève
    const eleve = await prisma.eleve.create({
      data: {
        nom: data.nom,
        classe: data.classe,
        matricule: matricule,
        statusColor: "bg-emerald-400",
        email: data.email,
        telephone: data.telephone,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        nationalite: data.nationalite || "Camerounaise",
        sexe: data.sexe,
        adresse: data.adresse,
        parentNom: data.parentNom,
        parentTelephone: data.parentTelephone,
        parentEmail: data.parentEmail,
        parentProfession: data.parentProfession,
        dateInscription: dateInscription.toISOString().slice(0, 10),
        ancienEtablissement: data.ancienEtablissement,
        redoublant: data.redoublant || false,
        situationFamiliale: data.situationFamiliale,
      }
    });
    
    // 5. Créer le compte parent automatiquement
    let parentPassword = null;
    
    if (data.parentEmail) {
      const existingUser = await prisma.utilisateur.findUnique({
        where: { email: data.parentEmail }
      });
      
      if (!existingUser) {
        // Générer le mot de passe: nom de l'enfant + "123"
        const motDePasseBase = data.nom
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z]/g, '');
        parentPassword = `${motDePasseBase}123`;
        
        const hashedPassword = await bcrypt.hash(parentPassword, 10);
        
        await prisma.utilisateur.create({
          data: {
            email: data.parentEmail,
            motDePasse: hashedPassword,
            nom: data.parentNom || `Parent de ${data.nom}`,
            role: 'parent',
            eleveId: eleve.id,
            actif: true,
          }
        });
        
        console.log(`✅ Compte parent créé: ${data.parentEmail} / ${parentPassword}`);
      }
    }
    
    // 6. Retourner les informations
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
      eleve: {
        id: eleve.id,
        nom: eleve.nom,
        classe: eleve.classe,
        matricule: eleve.matricule,
      },
      parentAccount: data.parentEmail ? {
        email: data.parentEmail,
        motDePasse: parentPassword,
        nom: data.parentNom || `Parent de ${data.nom}`
      } : null
    }, { status: 201 });
    
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}