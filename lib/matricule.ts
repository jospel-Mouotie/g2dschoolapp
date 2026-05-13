// lib/matricule.ts

/**
 * Génère un matricule unique pour un élève
 * Format: ANNEE/CLASSE/NUMERO
 * Exemple: 2025/6A/001
 */
export async function genererMatricule(classe: string, dateInscription: Date = new Date()): Promise<string> {
  const annee = dateInscription.getFullYear();
  const anneeScolaire = `${annee}-${annee + 1}`;
  
  // Récupérer le dernier numéro pour cette classe cette année
  // Cette fonction sera appelée côté serveur
  const { prisma } = await import('@/lib/prisma');
  
  // Compter les élèves déjà inscrits dans cette classe cette année
  const dateDebut = new Date(annee, 0, 1);
  const dateFin = new Date(annee, 11, 31);
  
  const count = await prisma.eleve.count({
    where: {
      classe: classe,
      dateInscription: {
        gte: dateDebut.toISOString().slice(0, 10),
        lte: dateFin.toISOString().slice(0, 10)
      }
    }
  });
  
  const numero = (count + 1).toString().padStart(3, '0');
  
  return `${annee}/${classe}/${numero}`;
}

/**
 * Génère un matricule simple au format: ANNEE + NUMERO_ALEATOIRE
 */
export function genererMatriculeSimple(): string {
  const annee = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${annee}${random}`;
}

/**
 * Génère un matricule formaté avec la date
 * Format: JJMMAA-XXX
 */
export function genererMatriculeDate(): string {
  const now = new Date();
  const jour = now.getDate().toString().padStart(2, '0');
  const mois = (now.getMonth() + 1).toString().padStart(2, '0');
  const annee = now.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${jour}${mois}${annee}-${random}`;
}