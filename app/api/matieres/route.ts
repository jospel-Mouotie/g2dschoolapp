import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    let matieres = await prisma.matiere.findMany();
    
    if (matieres.length === 0) {
      const matieresParDefaut = [
        { id: "maths", nom: "MATHÉMATIQUES", coefficient: 4, description: "Mathématiques générales" },
        { id: "francais", nom: "FRANÇAIS", coefficient: 3, description: "Langue française" },
        { id: "anglais", nom: "ANGLAIS", coefficient: 2, description: "Langue anglaise" },
        { id: "histgeo", nom: "HISTOIRE-GÉOGRAPHIE", coefficient: 3, description: "Histoire et Géographie" },
        { id: "physique", nom: "PHYSIQUE-CHIMIE", coefficient: 5, description: "Sciences physiques" },
        { id: "info", nom: "INFORMATIQUE", coefficient: 2, description: "Informatique" },
        { id: "eps", nom: "EPS", coefficient: 2, description: "Éducation physique" },
        { id: "education", nom: "ÉDUCATION CIVIQUE", coefficient: 1, description: "Éducation civique" },
      ];
      
      for (const m of matieresParDefaut) {
        await prisma.matiere.create({ data: m });
      }
      
      matieres = await prisma.matiere.findMany();
    }
    
    return NextResponse.json(matieres);
  } catch (error) {
    console.error("Erreur GET /api/matieres:", error);
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
    const newId = data.id || Math.random().toString(36).substr(2, 9);
    const matiere = await prisma.matiere.create({
      data: {
        id: newId,
        nom: data.nom,
        coefficient: data.coefficient,
        description: data.description
      }
    });
    return NextResponse.json(matiere);
  } catch (error) {
    console.error("Erreur POST /api/matieres:", error);
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
    const matiere = await prisma.matiere.update({
      where: { id },
      data: {
        nom: data.nom,
        coefficient: data.coefficient,
        description: data.description
      }
    });
    return NextResponse.json(matiere);
  } catch (error) {
    console.error("Erreur PUT /api/matieres:", error);
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
    
    await prisma.matiere.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/matieres:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}