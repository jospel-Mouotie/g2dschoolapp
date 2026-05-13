// app/api/classes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET public - pas besoin d'authentification pour récupérer les classes
export async function GET(request: Request) {
  try {
    // Récupérer toutes les classes
    const classes = await prisma.classe.findMany({
      orderBy: { nom: 'asc' }
    });
    
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Erreur GET /api/classes:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST, PUT, DELETE restent protégés
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Vérification admin (à implémenter selon votre logique)
    const data = await request.json();
    const classe = await prisma.classe.create({
      data: {
        nom: data.nom,
        niveauId: data.niveauId,
        effectif: data.effectif || 0
      }
    });
    return NextResponse.json(classe);
  } catch (error) {
    console.error("Erreur POST /api/classes:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id, ...data } = await request.json();
    const classe = await prisma.classe.update({
      where: { id },
      data: {
        nom: data.nom,
        niveauId: data.niveauId,
        effectif: data.effectif
      }
    });
    return NextResponse.json(classe);
  } catch (error) {
    console.error("Erreur PUT /api/classes:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    
    await prisma.classe.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/classes:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}