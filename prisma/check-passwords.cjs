const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification des mots de passe...\n');

  const users = await prisma.utilisateur.findMany();
  
  for (const user of users) {
    console.log(`📧 ${user.email} (${user.role})`);
    console.log(`   Hash stocké: ${user.motDePasse.substring(0, 30)}...`);
    
    // Vérifier si le hash semble valide (commence par $2a$ ou $2b$)
    const isValidHash = user.motDePasse.startsWith('$2');
    console.log(`   Format hash valide: ${isValidHash ? '✅' : '❌'}`);
    
    // Si le mot de passe est en clair, le hasher
    if (!isValidHash && user.motDePasse.length < 60) {
      console.log(`   ⚠️ Mot de passe en clair détecté: "${user.motDePasse}"`);
      
      let plainPassword = user.motDePasse;
      // Si c'est l'admin ou un compte connu
      if (user.email === 'admin@lyceedeido.cm') plainPassword = 'admin123';
      if (user.email === 'kanga@lyceedeido.cm') plainPassword = 'teacher123';
      if (user.email.includes('parent')) plainPassword = user.nom?.split(' ')[1]?.toLowerCase() + '123' || 'parent123';
      
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      await prisma.utilisateur.update({
        where: { id: user.id },
        data: { motDePasse: hashedPassword }
      });
      
      console.log(`   ✅ Mot de passe mis à jour avec hash: ${hashedPassword.substring(0, 30)}...`);
      console.log(`   🔑 Nouveau mot de passe: ${plainPassword}`);
    } else if (isValidHash) {
      // Tester quelques mots de passe courants
      const tests = [];
      if (user.email === 'admin@lyceedeido.cm') tests.push('admin123');
      if (user.email === 'kanga@lyceedeido.cm') tests.push('teacher123');
      if (user.email.includes('parent')) {
        tests.push('parent123');
        const prenom = user.nom?.split(' ')[1]?.toLowerCase() || user.nom?.split(' ')[0].toLowerCase();
        if (prenom) tests.push(`${prenom}123`);
      }
      
      for (const testPwd of tests) {
        const isValid = await bcrypt.compare(testPwd, user.motDePasse);
        if (isValid) {
          console.log(`   ✅ Mot de passe fonctionne avec: "${testPwd}"`);
        }
      }
    }
    console.log('');
  }
  
  console.log('🎉 Vérification terminée !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());