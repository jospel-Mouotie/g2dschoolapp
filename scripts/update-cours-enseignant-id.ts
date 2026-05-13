// scripts/update-cours-enseignant-id.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Mise à jour des cours avec enseignantId...');
  
  // Récupérer tous les enseignants
  const enseignants = await prisma.enseignant.findMany();
  console.log(`📋 ${enseignants.length} enseignants trouvés`);
  
  // Pour chaque enseignant, mettre à jour ses cours
  for (const enseignant of enseignants) {
    console.log(`\n👨‍🏫 Traitement de: ${enseignant.name}`);
    
    // Mettre à jour les cours où le professeur correspond au nom
    const updatedCours = await prisma.cours.updateMany({
      where: {
        professeur: enseignant.name,
        enseignantId: null
      },
      data: {
        enseignantId: enseignant.id
      }
    });
    
    console.log(`   ✅ ${updatedCours.count} cours mis à jour pour ${enseignant.name}`);
  }
  
  // Vérifier les cours qui n'ont toujours pas d'enseignantId
  const coursSansEnseignant = await prisma.cours.findMany({
    where: { enseignantId: null }
  });
  
  if (coursSansEnseignant.length > 0) {
    console.log(`\n⚠️ ${coursSansEnseignant.length} cours n'ont toujours pas d'enseignantId:`);
    for (const cours of coursSansEnseignant) {
      console.log(`   - ${cours.matiere} (${cours.classe}) - Professeur: ${cours.professeur}`);
    }
  } else {
    console.log('\n✅ Tous les cours ont un enseignantId');
  }
}

main()
  .catch(e => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });