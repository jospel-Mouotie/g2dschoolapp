import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const pauses = await prisma.pause.findMany();
    return NextResponse.json(pauses);
  } catch (error) {
    console.error("Erreur GET /api/pauses:", error);
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
    const pause = await prisma.pause.create({
      data: {
        heureDebut: data.heureDebut,
        heureFin: data.heureFin,
        description: data.description
      }
    });
    return NextResponse.json(pause);
  } catch (error) {
    console.error("Erreur POST /api/pauses:", error);
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
    const pause = await prisma.pause.update({
      where: { id },
      data: {
        heureDebut: data.heureDebut,
        heureFin: data.heureFin,
        description: data.description
      }
    });
    return NextResponse.json(pause);
  } catch (error) {
    console.error("Erreur PUT /api/pauses:", error);
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
    
    await prisma.pause.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/pauses:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}