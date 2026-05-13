// app/api/absences/route.ts
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
    const eleveId = searchParams.get('eleveId');
    const classe = searchParams.get('classe');
    
    // Construire la condition where
    const where: any = {};
    if (eleveId) {
      where.eleveId = parseInt(eleveId);
    }
    if (classe) {
      where.eleve = { classe: classe };
    }
    
    const absences = await prisma.absence.findMany({
      where,
      include: {
        eleve: true,
        cours: true,
        enseignant: true
      },
      orderBy: { date: 'desc' }
    });
    
    // Formater les données
    const formattedAbsences = absences.map(absence => ({
      id: absence.id,
      eleveId: absence.eleveId,
      coursId: absence.coursId,
      date: absence.date.toISOString(),
      heureDebut: absence.heureDebut,
      heureFin: absence.heureFin,
      duree: absence.duree,
      heuresAbsence: absence.heuresAbsence,
      justifiee: absence.justifiee,
      motif: absence.motif,
      enseignantId: absence.enseignantId,
      cours: absence.cours ? {
        matiere: absence.cours.matiere,
        salle: absence.cours.salle
      } : null,
      eleve: absence.eleve ? {
        nom: absence.eleve.nom,
        classe: absence.eleve.classe
      } : null
    }));
    
    return NextResponse.json(formattedAbsences);
  } catch (error) {
    console.error("Erreur GET /api/absences:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}