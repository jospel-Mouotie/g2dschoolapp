// app/api/cours/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== DEBUG GET /api/cours/[id] ===");
    
    const auth = await verifyAuth(request);
    if (!auth) {
      console.log("Auth failed");
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id } = await params;
    console.log("Cours ID:", id);
    
    // Récupérer le cours avec les bonnes relations
    const cours = await prisma.cours.findUnique({
      where: { id: id },
      include: {
        enseignant: true,  // Relation avec l'enseignant
        // classe: true,   // ❌ Ce champ n'existe pas
        // Utilise plutôt:
      }
    });
    
    console.log("Cours trouvé:", cours ? "Oui" : "Non");
    
    if (!cours) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }
    
    // Récupérer le nom de la classe (le champ est 'classe' et non 'classeId')
    let classeNom = cours.classe || 'Non assignée';
    
    // Transformer les données pour le frontend
    const formattedCours = {
      id: cours.id,
      matiere: cours.matiere,
      professeur: cours.enseignant?.name || 'Non assigné',
      professeurId: cours.enseignantId,
      classe: classeNom,
      salle: cours.salle,
      jour: cours.jour,
      heure: cours.heure,
      students: cours.students || 0,
      image: `https://source.unsplash.com/featured/400x200?${encodeURIComponent(cours.matiere)}`,
      status: cours.status,
      coefficient: cours.coefficient,
      duree: cours.duree,
      progress: cours.progress || 0
    };
    
    console.log("Réponse envoyée");
    return NextResponse.json(formattedCours);
    
  } catch (error) {
    console.error("Erreur GET /api/cours/[id]:", error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id } = await params;
    const data = await request.json();
    
    const cours = await prisma.cours.update({
      where: { id: id },
      data: {
        matiere: data.matiere,
        salle: data.salle,
        jour: data.jour,
        heure: data.heure,
        status: data.status,
        coefficient: data.coefficient,
        enseignantId: data.enseignantId,
        classe: data.classe
      }
    });
    
    return NextResponse.json(cours);
  } catch (error) {
    console.error("Erreur PUT /api/cours/[id]:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Supprimer d'abord les chapitres via les modules
    const modules = await prisma.module.findMany({
      where: { coursId: id },
      select: { id: true }
    });
    
    for (const module of modules) {
      await prisma.chapitre.deleteMany({
        where: { moduleId: module.id }
      });
    }
    
    await prisma.module.deleteMany({
      where: { coursId: id }
    });
    
    await prisma.cours.delete({
      where: { id: id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/cours/[id]:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}