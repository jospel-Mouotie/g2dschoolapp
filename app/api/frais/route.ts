import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    let frais = await prisma.fraisNiveau.findMany();
    
    if (frais.length === 0) {
      const fraisParDefaut = [
        { niveau: "6ème", montant: 150000, description: "Frais de scolarité annuel - 6ème" },
        { niveau: "5ème", montant: 150000, description: "Frais de scolarité annuel - 5ème" },
        { niveau: "4ème", montant: 160000, description: "Frais de scolarité annuel - 4ème" },
        { niveau: "3ème", montant: 160000, description: "Frais de scolarité annuel - 3ème" },
        { niveau: "Seconde", montant: 170000, description: "Frais de scolarité annuel - Seconde" },
        { niveau: "Première", montant: 170000, description: "Frais de scolarité annuel - Première" },
        { niveau: "Terminale", montant: 180000, description: "Frais de scolarité annuel - Terminale" },
      ];
      
      for (const f of fraisParDefaut) {
        await prisma.fraisNiveau.create({ data: f });
      }
      
      frais = await prisma.fraisNiveau.findMany();
    }
    
    return NextResponse.json(frais);
  } catch (error) {
    console.error("Erreur GET /api/frais:", error);
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
    const frais = await prisma.fraisNiveau.create({
      data: {
        niveau: data.niveau,
        montant: data.montant,
        description: data.description || `Frais de scolarité - ${data.niveau}`
      }
    });
    return NextResponse.json(frais);
  } catch (error) {
    console.error("Erreur POST /api/frais:", error);
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
    const frais = await prisma.fraisNiveau.update({
      where: { id },
      data: {
        niveau: data.niveau,
        montant: data.montant,
        description: data.description
      }
    });
    return NextResponse.json(frais);
  } catch (error) {
    console.error("Erreur PUT /api/frais:", error);
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
    
    await prisma.fraisNiveau.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/frais:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}