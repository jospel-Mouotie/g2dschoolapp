// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const classe = searchParams.get('classe');
    const matiereId = searchParams.get('matiere');
    const periode = searchParams.get('periode');
    
    // Construire la condition where
    const where: any = {};
    if (classe) where.classe = classe;
    if (matiereId) where.matiereId = matiereId;
    if (periode) where.periode = periode;
    
    const notes = await prisma.note.findMany({
      where,
      include: {
        eleve: true,
        matiere: true
      }
    });
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Erreur GET /api/notes:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'enseignant')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Vérifier si une note existe déjà
    const existingNote = await prisma.note.findFirst({
      where: {
        eleveId: data.eleveId,
        matiereId: data.matiereId,
        periode: data.periode
      }
    });
    
    let note;
    if (existingNote) {
      note = await prisma.note.update({
        where: { id: existingNote.id },
        data: {
          eval1: data.eval1,
          eval2: data.eval2,
          moyenne: data.moyenne,
          appreciation: data.appreciation
        }
      });
    } else {
      note = await prisma.note.create({
        data: {
          eleveId: data.eleveId,
          matiereId: data.matiereId,
          periode: data.periode,
          eval1: data.eval1,
          eval2: data.eval2,
          moyenne: data.moyenne,
          appreciation: data.appreciation
        }
      });
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error("Erreur POST /api/notes:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}