// app/api/modules/route.ts
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
    const coursId = searchParams.get('coursId');
    
    const modules = await prisma.module.findMany({
      where: coursId ? { coursId: coursId } : undefined,
      include: {
        chapitres: true
      }
    });
    
    return NextResponse.json(modules);
  } catch (error) {
    console.error("Erreur GET /api/modules:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    console.log("Création module - données reçues:", data);
    
    if (!data.titre || !data.coursId) {
      return NextResponse.json({ error: 'Titre et coursId requis' }, { status: 400 });
    }
    
    const module = await prisma.module.create({
      data: {
        titre: data.titre,
        description: data.description || null,
        coursId: data.coursId
      }
    });
    
    console.log("Module créé:", module);
    return NextResponse.json(module);
  } catch (error) {
    console.error("Erreur POST /api/modules:", error);
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
    
    console.log("Suppression module - ID reçu:", id);
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    
    // Ne pas convertir en nombre - garder comme string
    const moduleId = id;
    
    // Vérifier si le module existe
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId }
    });
    
    if (!existingModule) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });
    }
    
    // Supprimer d'abord les chapitres associés
    await prisma.chapitre.deleteMany({
      where: { moduleId: moduleId }
    });
    
    // Puis supprimer le module
    await prisma.module.delete({
      where: { id: moduleId }
    });
    
    console.log("Module supprimé avec succès");
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Erreur DELETE /api/modules:", error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}