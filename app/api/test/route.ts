// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const elevesCount = await prisma.eleve.count();
    const enseignantsCount = await prisma.enseignant.count();
    const coursCount = await prisma.cours.count();
    
    return NextResponse.json({
      status: 'ok',
      eleves: elevesCount,
      enseignants: enseignantsCount,
      cours: coursCount,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur de connexion à la base' }, { status: 500 });
  }
}