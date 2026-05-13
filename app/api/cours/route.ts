// app/api/cours/route.ts
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
    const enseignantId = searchParams.get('enseignantId');
    
    // Construction de la condition where
    const where: any = {};
    
    // Filtrage par classe
    if (classe) {
      where.classe = classe;
    }
    
    // Filtrage par enseignantId si spécifié
    if (enseignantId) {
      where.enseignantId = parseInt(enseignantId);
    }
    
    // Si c'est un enseignant (non admin) et qu'aucun enseignantId n'est spécifié en paramètre
    if (auth.role !== 'admin' && auth.enseignantId && !enseignantId) {
      where.enseignantId = auth.enseignantId;
      console.log("👨‍🏫 Enseignant connecté - ID:", auth.enseignantId);
    }
    
    console.log("🔍 Filtre cours - where:", where);
    
    const cours = await prisma.cours.findMany({
      where,
      include: {
        enseignant: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📋 ${cours.length} cours trouvés`);
    
    // Formater les données
    const formattedCours = cours.map(c => ({
      id: c.id,
      matiere: c.matiere,
      professeur: c.enseignant?.name || c.professeur || 'Non assigné',
      professeurId: c.enseignantId,
      salle: c.salle,
      classe: c.classe,
      jour: c.jour,
      heure: c.heure,
      duree: c.duree || 2,
      status: c.status,
      coefficient: c.coefficient,
      students: c.students || 0,
      progress: c.progress || 0,
      enseignantId: c.enseignantId
    }));
    
    return NextResponse.json(formattedCours);
  } catch (error) {
    console.error("Erreur GET /api/cours:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    console.log("📝 Création cours - données reçues:", data);
    
    // Validation des données
    if (!data.matiere || !data.classe || !data.jour || !data.heure) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }
    
    const cours = await prisma.cours.create({
      data: {
        matiere: data.matiere,
        professeur: data.professeur || data.professeurNom || 'Non assigné',
        salle: data.salle || 'Salle à définir',
        classe: data.classe,
        jour: data.jour,
        heure: data.heure,
        duree: data.duree || 2,
        status: data.status || 'En cours',
        coefficient: data.coefficient || 1,
        students: data.students || 0,
        progress: data.progress || 0,
        enseignantId: data.enseignantId || null
      },
      include: {
        enseignant: true,
      }
    });
    
    console.log("✅ Cours créé:", cours.id);
    
    const formattedCours = {
      id: cours.id,
      matiere: cours.matiere,
      professeur: cours.enseignant?.name || cours.professeur,
      professeurId: cours.enseignantId,
      salle: cours.salle,
      classe: cours.classe,
      jour: cours.jour,
      heure: cours.heure,
      duree: cours.duree,
      status: cours.status,
      coefficient: cours.coefficient,
      students: cours.students,
      progress: cours.progress,
      enseignantId: cours.enseignantId
    };
    
    return NextResponse.json(formattedCours);
  } catch (error) {
    console.error("❌ Erreur POST /api/cours:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    console.log("📝 Modification cours - données reçues:", data);
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    
    const cours = await prisma.cours.update({
      where: { id: data.id },
      data: {
        matiere: data.matiere,
        professeur: data.professeur,
        salle: data.salle,
        classe: data.classe,
        jour: data.jour,
        heure: data.heure,
        duree: data.duree,
        status: data.status,
        coefficient: data.coefficient,
        students: data.students,
        progress: data.progress,
        enseignantId: data.enseignantId
      },
      include: {
        enseignant: true,
      }
    });
    
    console.log("✅ Cours modifié:", cours.id);
    
    const formattedCours = {
      id: cours.id,
      matiere: cours.matiere,
      professeur: cours.enseignant?.name || cours.professeur,
      professeurId: cours.enseignantId,
      salle: cours.salle,
      classe: cours.classe,
      jour: cours.jour,
      heure: cours.heure,
      duree: cours.duree,
      status: cours.status,
      coefficient: cours.coefficient,
      students: cours.students,
      progress: cours.progress,
      enseignantId: cours.enseignantId
    };
    
    return NextResponse.json(formattedCours);
  } catch (error) {
    console.error("❌ Erreur PUT /api/cours:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    
    console.log("🗑️ Suppression cours:", id);
    
    await prisma.cours.delete({ where: { id } });
    
    console.log("✅ Cours supprimé");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur DELETE /api/cours:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}