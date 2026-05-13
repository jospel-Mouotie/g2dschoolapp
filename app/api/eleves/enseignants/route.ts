// app/api/enseignants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const enseignants = await prisma.enseignant.findMany();
    return NextResponse.json(enseignants);
  } catch (error) {
    console.error('Erreur GET /api/enseignants:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const enseignant = await prisma.enseignant.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        matieres: body.matieres,
        classes: body.classes,
        status: body.status,
        photo: body.photo || null,
      },
    });
    
    // Créer l'utilisateur associé
    const prenom = body.name.split(' ')[0].toLowerCase();
    const motDePasse = `${prenom}123`;
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    
    await prisma.utilisateur.create({
      data: {
        email: body.email,
        motDePasse: hashedPassword,
        nom: body.name,
        role: "enseignant",
        enseignantId: enseignant.id,
        actif: true,
      },
    });
    
    return NextResponse.json(enseignant, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/enseignants:', error);
    return NextResponse.json({ error: 'Erreur création enseignant' }, { status: 500 });
  }
}