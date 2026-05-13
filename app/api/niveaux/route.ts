import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    let niveaux = await prisma.niveau.findMany({
      orderBy: { ordre: 'asc' }
    });
    
    if (niveaux.length === 0) {
      const niveauxParDefaut = [
        { nom: "6ème", ordre: 1, description: "Cycle d'orientation" },
        { nom: "5ème", ordre: 2, description: "Cycle d'orientation" },
        { nom: "4ème", ordre: 3, description: "Cycle d'observation" },
        { nom: "3ème", ordre: 4, description: "Cycle d'observation" },
        { nom: "Seconde", ordre: 5, description: "Cycle déterminant" },
        { nom: "Première", ordre: 6, description: "Cycle terminal" },
        { nom: "Terminale", ordre: 7, description: "Cycle terminal" },
      ];
      
      for (const n of niveauxParDefaut) {
        await prisma.niveau.create({ data: n });
      }
      
      niveaux = await prisma.niveau.findMany({ orderBy: { ordre: 'asc' } });
    }
    
    return NextResponse.json(niveaux);
  } catch (error) {
    console.error("Erreur GET /api/niveaux:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    const niveau = await prisma.niveau.create({
      data: {
        nom: data.nom,
        ordre: data.ordre || 0,
        description: data.description
      }
    });
    return NextResponse.json(niveau);
  } catch (error) {
    console.error("Erreur POST /api/niveaux:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id, ...data } = await request.json();
    const niveau = await prisma.niveau.update({
      where: { id },
      data: {
        nom: data.nom,
        ordre: data.ordre,
        description: data.description
      }
    });
    return NextResponse.json(niveau);
  } catch (error) {
    console.error("Erreur PUT /api/niveaux:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    
    await prisma.niveau.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/niveaux:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}