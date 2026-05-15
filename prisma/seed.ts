// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...\n');

  // ========== 1. ADMIN ==========
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@lyceedeido.cm' },
    update: {},
    create: {
      email: 'admin@lyceedeido.cm',
      motDePasse: adminPassword,
      nom: 'Administrateur',
      role: 'admin',
      actif: true,
    },
  });
  console.log('✅ Admin créé:', admin.email);

  // ========== 2. ENSEIGNANT ==========
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  
  const teacherUser = await prisma.utilisateur.upsert({
    where: { email: 'kanga@lyceedeido.cm' },
    update: {},
    create: {
      email: 'kanga@lyceedeido.cm',
      motDePasse: teacherPassword,
      nom: 'Dr. Kanga Martin',
      role: 'enseignant',
      actif: true,
    },
  });
  console.log('✅ Utilisateur enseignant créé:', teacherUser.email);

  const enseignant = await prisma.enseignant.upsert({
    where: { email: 'kanga@lyceedeido.cm' },
    update: {
      name: 'Dr. Kanga Martin',
      phone: '+237 670 00 00 01',
      matieres: JSON.stringify(['Maths', 'Algorithmique']),
      classes: JSON.stringify(['6A', '5B']),
      status: 'Titulaire',
    },
    create: {
      name: 'Dr. Kanga Martin',
      email: 'kanga@lyceedeido.cm',
      phone: '+237 670 00 00 01',
      matieres: JSON.stringify(['Maths', 'Algorithmique']),
      classes: JSON.stringify(['6A', '5B']),
      status: 'Titulaire',
      photo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop',
    },
  });
  console.log('✅ Enseignant créé:', enseignant.name);

  await prisma.utilisateur.update({
    where: { id: teacherUser.id },
    data: { enseignantId: enseignant.id },
  });

  // ========== 3. ÉLÈVES ET PARENTS ==========
  const elevesData = [
    {
      nom: 'Jean Mbélé',
      classe: '6A',
      matricule: '9/02 410',
      statusColor: 'bg-emerald-400',
      parentNom: 'Jean Mbélé',
      parentTelephone: '+237 612345678',
      parentEmail: 'jean.mbele@example.com',
      dateNaissance: '2012-05-15',
      lieuNaissance: 'Douala',
      sexe: 'M',
    },
    {
      nom: 'Elise Nend',
      classe: '5B',
      matricule: '5/22,000',
      statusColor: 'bg-teal-400',
      parentNom: 'Elise Nend',
      parentTelephone: '+237 623456789',
      parentEmail: 'elise.nend@example.com',
      dateNaissance: '2011-08-22',
      lieuNaissance: 'Yaoundé',
      sexe: 'F',
    },
    {
      nom: 'Dider Fongang',
      classe: '4A',
      matricule: '8/163 410',
      statusColor: 'bg-sky-400',
      parentNom: 'Dider Fongang',
      parentTelephone: '+237 634567890',
      parentEmail: 'dider.fongang@example.com',
      dateNaissance: '2010-03-10',
      lieuNaissance: 'Bafoussam',
      sexe: 'M',
    },
    {
      nom: 'Émile Tamko',
      classe: '6A',
      matricule: '5/02,003',
      statusColor: 'bg-indigo-400',
      parentNom: 'Émile Tamko',
      parentTelephone: '+237 645678901',
      parentEmail: 'emile.tamko@example.com',
      dateNaissance: '2012-11-30',
      lieuNaissance: 'Douala',
      sexe: 'M',
    },
    {
      nom: 'Nadia Ebwelle',
      classe: 'Terminale A',
      matricule: '5/07/223',
      statusColor: 'bg-amber-400',
      parentNom: 'Nadia Ebwelle',
      parentTelephone: '+237 656789012',
      parentEmail: 'nadia.ebwelle@example.com',
      dateNaissance: '2006-07-18',
      lieuNaissance: 'Yaoundé',
      sexe: 'F',
    },
  ];

  for (const eleveData of elevesData) {
    const eleve = await prisma.eleve.upsert({
      where: { matricule: eleveData.matricule },
      update: {
        nom: eleveData.nom,
        classe: eleveData.classe,
        statusColor: eleveData.statusColor,
        parentNom: eleveData.parentNom,
        parentTelephone: eleveData.parentTelephone,
        parentEmail: eleveData.parentEmail,
        dateNaissance: eleveData.dateNaissance,
        lieuNaissance: eleveData.lieuNaissance,
        sexe: eleveData.sexe,
        nationalite: 'Camerounaise',
        dateInscription: new Date().toISOString().split('T')[0],
      },
      create: {
        nom: eleveData.nom,
        classe: eleveData.classe,
        matricule: eleveData.matricule,
        statusColor: eleveData.statusColor,
        img: `https://ui-avatars.com/api/?name=${encodeURIComponent(eleveData.nom)}&background=random&color=fff&size=128&rounded=true&bold=true`,
        parentNom: eleveData.parentNom,
        parentTelephone: eleveData.parentTelephone,
        parentEmail: eleveData.parentEmail,
        dateNaissance: eleveData.dateNaissance,
        lieuNaissance: eleveData.lieuNaissance,
        nationalite: 'Camerounaise',
        sexe: eleveData.sexe,
        dateInscription: new Date().toISOString().split('T')[0],
      },
    });

    // Créer le compte parent
    const prenom = eleveData.parentNom.split(' ')[0].toLowerCase();
    const motDePasse = `${prenom}123`;
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const parentUser = await prisma.utilisateur.upsert({
      where: { email: eleveData.parentEmail },
      update: {
        nom: eleveData.parentNom,
        eleveId: eleve.id,
      },
      create: {
        email: eleveData.parentEmail,
        motDePasse: hashedPassword,
        nom: eleveData.parentNom,
        role: 'parent',
        eleveId: eleve.id,
        actif: true,
      },
    });
    
    console.log(`✅ Élève: ${eleve.nom} (${eleve.classe})`);
    console.log(`   📧 Parent: ${parentUser.email} / 🔑 ${motDePasse}`);
  }

  // ========== 4. MATIÈRES ==========
  const matieres = [
    { id: 'maths', nom: 'MATHÉMATIQUES', coefficient: 4, description: 'Mathématiques générales' },
    { id: 'francais', nom: 'FRANÇAIS', coefficient: 3, description: 'Langue française' },
    { id: 'anglais', nom: 'ANGLAIS', coefficient: 2, description: 'Langue anglaise' },
    { id: 'histgeo', nom: 'HISTOIRE-GÉOGRAPHIE', coefficient: 3, description: 'Histoire et Géographie' },
    { id: 'physique', nom: 'PHYSIQUE-CHIMIE', coefficient: 5, description: 'Sciences physiques' },
    { id: 'info', nom: 'INFORMATIQUE', coefficient: 2, description: 'Informatique' },
    { id: 'eps', nom: 'EPS', coefficient: 2, description: 'Éducation physique' },
    { id: 'education', nom: 'ÉDUCATION CIVIQUE', coefficient: 1, description: 'Éducation civique' },
  ];

  for (const matiere of matieres) {
    await prisma.matiere.upsert({
      where: { id: matiere.id },
      update: {},
      create: matiere,
    });
  }
  console.log('✅ Matières créées');

  // ========== 5. COURS ==========
  const coursData = [
    { matiere: 'Maths', professeur: 'Dr. Kanga Martin', salle: 'Salle 101', classe: '6A', jour: 'Lundi', heure: '08:00-10:00', duree: 2, enseignantId: enseignant.id },
    { matiere: 'Français', professeur: 'Dr. Kanga Martin', salle: 'Salle 102', classe: '6A', jour: 'Mardi', heure: '10:00-12:00', duree: 2, enseignantId: enseignant.id },
    { matiere: 'Anglais', professeur: 'Dr. Kanga Martin', salle: 'Salle 103', classe: '5B', jour: 'Mercredi', heure: '08:00-10:00', duree: 2, enseignantId: enseignant.id },
  ];

  for (const cours of coursData) {
    await prisma.cours.upsert({
      where: { id: `cours_${cours.matiere}_${cours.classe}` },
      update: {},
      create: {
        id: `cours_${cours.matiere}_${cours.classe}`,
        matiere: cours.matiere,
        professeur: cours.professeur,
        salle: cours.salle,
        classe: cours.classe,
        jour: cours.jour,
        heure: cours.heure,
        duree: cours.duree,
        enseignantId: cours.enseignantId,
        progress: 0,
        status: 'En cours',
        students: 25,
        coefficient: 1,
      },
    });
  }
  console.log('✅ Cours créés');

  // ========== 6. SALLE ==========
  const existingSalle = await prisma.salle.findUnique({
    where: { id: 'salle1' }
  });
  
  if (!existingSalle) {
    await prisma.salle.create({
      data: {
        id: 'salle1',
        nom: 'Salle 12',
        capacite: 32,
        batiment: 'A',
        equipements: JSON.stringify(['tableau', 'vidéoprojecteur']),
      },
    });
    console.log('✅ Salle créée');
  }

  // ========== 7. ÉTABLISSEMENT ==========
  const existingEtab = await prisma.etablissement.findFirst();
  if (!existingEtab) {
    await prisma.etablissement.create({
      data: {
        id: 'etab1',
        nom: 'LYCEE DE DEIDO',
        adresse: 'BP : 6500 Douala',
        telephone: '65268234 / 695789136',
        email: 'contact@lyceedeido.cm',
        anneeScolaire: '2024/2025',
        region: 'LITTORAL',
        delegation: 'DOUALA 5ÈME',
        devise: 'FCFA',
      },
    });
    console.log('✅ Établissement créé');
  }

  // ========== 8. PAUSES ==========
  const existingPauses = await prisma.pause.findMany();
  if (existingPauses.length === 0) {
    await prisma.pause.createMany({
      data: [
        { id: 'pause1', heureDebut: '12:00', heureFin: '13:00', description: 'Pause déjeuner' },
        { id: 'pause2', heureDebut: '15:00', heureFin: '15:15', description: 'Pause café' },
      ],
    });
    console.log('✅ Pauses créées');
  }

  // ========== 9. MESSAGE ==========
  const existingMessage = await prisma.message.findFirst({
    where: { contenu: { contains: 'Réunion parents-professeurs' } }
  });
  
  if (!existingMessage) {
    await prisma.message.create({
      data: {
        expediteur: 'Direction',
        expediteurRole: 'admin',
        expediteurAvatar: 'https://ui-avatars.com/api/?name=Direction&background=3b82f6&color=fff',
        destinataireClasse: 'all',
        contenu: '📢 Réunion parents-professeurs le 15 avril à 15h en salle polyvalente.',
        date: new Date(),
        lu: false,
      },
    });
    console.log('✅ Message de test créé');
  }

  // ========== RÉCAPITULATIF ==========
  console.log('\n🎉 Seed terminé avec succès !');
  console.log('\n📋 RÉCAPITULATIF DES COMPTES :');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 ADMIN :');
  console.log('   Email: admin@lyceedeido.cm');
  console.log('   Mot de passe: admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍🏫 ENSEIGNANT :');
  console.log('   Email: kanga@lyceedeido.cm');
  console.log('   Mot de passe: teacher123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍👩‍👧 PARENTS :');
  
  const parents = await prisma.utilisateur.findMany({
    where: { role: 'parent' },
    include: { eleve: true },
  });
  
  for (const parent of parents) {
    const prenom = parent.nom?.split(' ')[0]?.toLowerCase() || 'parent';
    const motDePasse = `${prenom}123`;
    console.log(`   👤 ${parent.nom}:`);
    console.log(`      Email: ${parent.email}`);
    console.log(`      Mot de passe: ${motDePasse}`);
    console.log(`      Enfant: ${parent.eleve?.nom || 'Non associé'}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });