// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // 1. Créer l'administrateur
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
  console.log('✅ Admin créé/mis à jour:', admin.email);

  // 2. Créer l'utilisateur enseignant
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
  console.log('✅ Utilisateur enseignant créé/mis à jour:', teacherUser.email);

  // 3. Créer ou mettre à jour l'enseignant
  const enseignant = await prisma.enseignant.upsert({
    where: { email: 'kanga@lyceedeido.cm' },
    update: {
      name: 'Dr. Kanga Martin',
      phone: '+237 670 00 00 01',
      matieres: JSON.stringify(['Maths', 'Algorithmique']),
      classes: JSON.stringify(['6A', '5B']),
      status: 'Titulaire',
      photo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop',
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
  console.log('✅ Enseignant créé/mis à jour:', enseignant.name);

  // 4. Mettre à jour l'utilisateur avec l'enseignantId
  await prisma.utilisateur.update({
    where: { id: teacherUser.id },
    data: { enseignantId: enseignant.id },
  });
  console.log('✅ Relation utilisateur-enseignant établie');

  // 5. Créer les élèves et leurs comptes parents
  const elevesData = [
    {
      nom: 'Jean Mbélé',
      classe: '6A',
      matricule: '9/02 410',
      statusColor: 'bg-emerald-400',
      parentNom: 'Parent Jean Mbélé',
      parentTelephone: '+237 612345678',
      parentEmail: 'parent.jean@example.com',
      dateNaissance: '2012-05-15',
      lieuNaissance: 'Douala',
      sexe: 'M',
    },
    {
      nom: 'Elise Nend',
      classe: '5B',
      matricule: '5/22,000',
      statusColor: 'bg-teal-400',
      parentNom: 'Parent Elise Nend',
      parentTelephone: '+237 623456789',
      parentEmail: 'parent.elise@example.com',
      dateNaissance: '2011-08-22',
      lieuNaissance: 'Yaoundé',
      sexe: 'F',
    },
    {
      nom: 'Dider Fongang',
      classe: '4A',
      matricule: '8/163 410',
      statusColor: 'bg-sky-400',
      parentNom: 'Parent Dider Fongang',
      parentTelephone: '+237 634567890',
      parentEmail: 'parent.dider@example.com',
      dateNaissance: '2010-03-10',
      lieuNaissance: 'Bafoussam',
      sexe: 'M',
    },
    {
      nom: 'Émile Tamko',
      classe: '6A',
      matricule: '5/02,003',
      statusColor: 'bg-indigo-400',
      parentNom: 'Parent Émile Tamko',
      parentTelephone: '+237 645678901',
      parentEmail: 'parent.emile@example.com',
      dateNaissance: '2012-11-30',
      lieuNaissance: 'Douala',
      sexe: 'M',
    },
    {
      nom: 'Nadia Ebwelle',
      classe: 'Terminale A',
      matricule: '5/07/223',
      statusColor: 'bg-amber-400',
      parentNom: 'Parent Nadia Ebwelle',
      parentTelephone: '+237 656789012',
      parentEmail: 'parent.nadia@example.com',
      dateNaissance: '2006-07-18',
      lieuNaissance: 'Yaoundé',
      sexe: 'F',
    },
  ];

  for (const eleveData of elevesData) {
    // Créer ou mettre à jour l'élève
    const eleve = await prisma.eleve.upsert({
      where: { matricule: eleveData.matricule },
      update: {
        nom: eleveData.nom,
        classe: eleveData.classe,
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

    // Créer ou mettre à jour le compte parent associé
    const prenom = eleveData.parentNom.split(' ')[1]?.toLowerCase() || eleveData.parentNom.split(' ')[0].toLowerCase();
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
    
    console.log(`✅ Élève créé/mis à jour: ${eleve.nom} (${eleve.classe})`);
    console.log(`   👨‍👩‍👧 Compte parent: ${parentUser.email} / ${motDePasse}`);
  }

  // 6. Créer les matières
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
  console.log('✅ Matières créées/mises à jour');

  // 7. Créer un message de test (si non existant)
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
  } else {
    console.log('⚠️ Message de test existe déjà');
  }

  // 8. Créer une salle (si non existante)
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
  } else {
    console.log('⚠️ Salle existe déjà');
  }

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
    const prenom = parent.nom?.split(' ')[1]?.toLowerCase() || parent.nom?.split(' ')[0].toLowerCase();
    console.log(`   ${parent.nom}:`);
    console.log(`      Email: ${parent.email}`);
    console.log(`      Mot de passe: ${prenom}123`);
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