import { z } from 'zod';

// Common schemas
export const idSchema = z.object({ id: z.number().int().positive() });

export const eleveCreateSchema = z.object({
  nom: z.string().min(1),
  classe: z.string().min(1),
  matricule: z.string().min(1),
  statusColor: z.string().optional(),
  img: z.string().url().optional(),
  photo: z.string().url().optional(),
  email: z.string().email(),
  telephone: z.string().optional(),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  nationalite: z.string().optional(),
  sexe: z.enum(['Masculin', 'Féminin']).optional(),
  adresse: z.string().optional(),
  parentNom: z.string().optional(),
  parentTelephone: z.string().optional(),
  parentEmail: z.string().email().optional(),
  parentProfession: z.string().optional(),
  dateInscription: z.string().optional(),
  ancienEtablissement: z.string().optional(),
  redoublant: z.boolean().optional(),
  situationFamiliale: z.string().optional(),
  nomComplet: z.string().optional(),
  selected: z.boolean().optional(),
  moyenne: z.number().optional(),
  noteColor: z.string().optional()
});

export const enseignantCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.literal('teacher'),
  // Additional fields can be added as needed
});

export const coursCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  classe: z.string().min(1)
});

export const transactionCreateSchema = z.object({
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
  description: z.string().optional()
});
