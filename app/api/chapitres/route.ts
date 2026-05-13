// app/api/chapitres/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG POST /api/chapitres ===");
    
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    console.log("Données reçues:", JSON.stringify(data, null, 2));
    
    if (!data.titre || data.titre.trim() === '') {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }
    
    if (!data.moduleId) {
      return NextResponse.json({ error: 'moduleId est requis' }, { status: 400 });
    }
    
    // moduleId est déjà une string (CUID)
    const moduleId = String(data.moduleId);
    console.log("ModuleId (string):", moduleId);
    
    // Vérifier si le module existe
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId }
    });
    
    if (!existingModule) {
      console.log("Module non trouvé pour l'ID:", moduleId);
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });
    }
    
    // Créer le chapitre
    const chapitre = await prisma.chapitre.create({
      data: {
        titre: data.titre.trim(),
        description: data.description?.trim() || null,
        duree: data.duree ? parseInt(data.duree.toString()) : 60,
        estFait: data.estFait === true || data.estFait === 'true',
        moduleId: moduleId
      }
    });
    
    console.log("Chapitre créé avec succès:", chapitre);
    return NextResponse.json(chapitre, { status: 201 });
    
  } catch (error) {
    console.error("Erreur POST /api/chapitres:", error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    console.log("PUT données reçues:", data);
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    // L'ID du chapitre est un nombre (auto-incrémenté)
    const chapitreId = parseInt(data.id.toString());
    if (isNaN(chapitreId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    const chapitre = await prisma.chapitre.update({
      where: { id: chapitreId },
      data: {
        estFait: data.estFait === true || data.estFait === 'true'
      }
    });
    
    console.log("Chapitre mis à jour:", chapitre);
    return NextResponse.json(chapitre);
    
  } catch (error) {
    console.error("Erreur PUT /api/chapitres:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log("Suppression chapitre - ID reçu:", id);
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    
    // L'ID du chapitre est un nombre
    const chapitreId = parseInt(id);
    if (isNaN(chapitreId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    await prisma.chapitre.delete({
      where: { id: chapitreId }
    });
    
    console.log("Chapitre supprimé avec succès");
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Erreur DELETE /api/chapitres:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}