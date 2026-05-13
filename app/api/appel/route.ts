// app/api/appel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'enseignant')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const body = await request.json();
    const { coursId, date, heure, duree, eleves } = body;
    
    console.log("📋 Données reçues pour l'appel:", { coursId, date, heure, duree, nbEleves: eleves?.length });
    
    if (!coursId) {
      return NextResponse.json({ error: 'coursId est requis' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'date est requise' }, { status: 400 });
    }
    if (!eleves || !Array.isArray(eleves)) {
      return NextResponse.json({ error: 'La liste des élèves est requise' }, { status: 400 });
    }
    
    // Vérifier si le cours existe
    const cours = await prisma.cours.findUnique({
      where: { id: coursId }
    });
    
    if (!cours) {
      console.error("❌ Cours non trouvé:", coursId);
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }
    
    console.log("✅ Cours trouvé:", cours.matiere);
    
    // Extraire heure début et fin
    const [heureDebut, heureFin] = heure.split('-');
    const dureeCours = duree || cours.duree || 2;
    
    // Créer l'appel
    const appel = await prisma.appel.create({
      data: {
        coursId: coursId,
        date: new Date(date),
        heure: heure,
        effectuePar: auth.enseignantId || auth.id
      }
    });
    
    console.log("✅ Appel créé:", appel.id);
    
    // Créer les détails de l'appel et les absences
    let absentsCount = 0;
    
    for (const eleve of eleves) {
      // Créer le détail de l'appel
      await prisma.appelDetail.create({
        data: {
          appelId: appel.id,
          eleveId: eleve.id,
          present: eleve.present,
          justifiee: eleve.justifiee || false,
          motif: eleve.motif
        }
      });
      
      // Si absent, créer une absence
      if (!eleve.present) {
        absentsCount++;
        
        await prisma.absence.create({
          data: {
            eleveId: eleve.id,
            coursId: coursId,
            date: new Date(date),
            heureDebut: heureDebut,
            heureFin: heureFin,
            duree: dureeCours,
            heuresAbsence: dureeCours,
            justifiee: eleve.justifiee || false,
            motif: eleve.motif || null,
            enseignantId: auth.enseignantId || auth.id
          }
        });
      }
    }
    
    console.log(`✅ Appel enregistré: ${eleves.length} élèves, ${absentsCount} absents`);
    
    return NextResponse.json({ 
      success: true, 
      appel,
      stats: {
        total: eleves.length,
        absents: absentsCount,
        presents: eleves.length - absentsCount
      }
    });
  } catch (error) {
    console.error("❌ Erreur POST /api/appel:", error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'enregistrement de l\'appel',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    const date = searchParams.get('date');
    const eleveId = searchParams.get('eleveId');
    
    const where: any = {};
    if (coursId) where.coursId = coursId;
    if (date) where.date = new Date(date);
    if (eleveId) where.eleveId = parseInt(eleveId);
    
    const appels = await prisma.appel.findMany({
      where,
      include: {
        appelsDetails: {
          include: { eleve: true }
        },
        cours: true
      },
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(appels);
  } catch (error) {
    console.error("Erreur GET /api/appel:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}