// app/api/notes/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'enseignant')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { notes } = await request.json();
    
    const savedNotes = [];
    for (const noteData of notes) {
      const existingNote = await prisma.note.findFirst({
        where: {
          eleveId: noteData.eleveId,
          matiereId: noteData.matiereId,
          periode: noteData.periode
        }
      });
      
      let note;
      if (existingNote) {
        note = await prisma.note.update({
          where: { id: existingNote.id },
          data: {
            eval1: noteData.eval1,
            eval2: noteData.eval2,
            moyenne: noteData.moyenne,
            appreciation: noteData.appreciation
          }
        });
      } else {
        note = await prisma.note.create({
          data: {
            eleveId: noteData.eleveId,
            matiereId: noteData.matiereId,
            periode: noteData.periode,
            eval1: noteData.eval1,
            eval2: noteData.eval2,
            moyenne: noteData.moyenne,
            appreciation: noteData.appreciation
          }
        });
      }
      savedNotes.push(note);
    }
    
    return NextResponse.json(savedNotes);
  } catch (error) {
    console.error("Erreur POST /api/notes/batch:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}