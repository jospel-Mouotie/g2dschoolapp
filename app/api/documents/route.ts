// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const documents = await prisma.document.findMany({
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Erreur GET /api/documents:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'enseignant')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    const document = await prisma.document.create({
      data: {
        nom: data.nom,
        type: data.type,
        categorie: data.categorie,
        classe: data.classe,
        matiere: data.matiere,
        taille: data.taille,
        date: data.date,
        url: data.url,
        auteur: data.auteur,
        auteurId: auth.id,
        approuve: auth.role === 'admin' ? true : false,
        telechargements: 0,
        favori: false
      }
    });
    
    return NextResponse.json(document);
  } catch (error) {
    console.error("Erreur POST /api/documents:", error);
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
    
    await prisma.document.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/documents:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}