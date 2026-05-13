// app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const messages = await prisma.message.findMany({
      orderBy: { date: 'asc' }
    });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur GET /api/messages:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    const message = await prisma.message.create({
      data: {
        expediteur: data.expediteur,
        expediteurRole: data.expediteurRole,
        expediteurAvatar: data.expediteurAvatar,
        destinataireClasse: data.destinataireClasse,
        contenu: data.contenu,
        date: new Date(data.date),
        lu: data.lu || false,
        pieceJointe: data.pieceJointe
      }
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error("Erreur POST /api/messages:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id, lu } = await request.json();
    
    const message = await prisma.message.update({
      where: { id },
      data: { lu }
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error("Erreur PUT /api/messages:", error);
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
    
    await prisma.message.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/messages:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}