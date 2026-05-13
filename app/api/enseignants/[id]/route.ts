// app/api/enseignants/[id]/route.ts (version avec params async)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id } = await params;
    const enseignantId = parseInt(id);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    const enseignant = await prisma.enseignant.findUnique({
      where: { id: enseignantId },
    });
    
    if (!enseignant) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(enseignant);
  } catch (error) {
    console.error("Erreur GET /api/enseignants/[id]:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id } = await params;
    const enseignantId = parseInt(id);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    const data = await request.json();
    
    const enseignant = await prisma.enseignant.update({
      where: { id: enseignantId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        photo: data.photo,
        matieres: data.matieres,
        classes: data.classes
      }
    });
    
    return NextResponse.json(enseignant);
  } catch (error) {
    console.error("Erreur PUT /api/enseignants/[id]:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id } = await params;
    const enseignantId = parseInt(id);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    await prisma.enseignant.delete({ where: { id: enseignantId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/enseignants/[id]:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}