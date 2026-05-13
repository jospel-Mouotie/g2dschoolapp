// app/api/enseignants/[id]/attributions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enseignantId = parseInt(id, 10);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID enseignant invalide' }, { status: 400 });
    }
    
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { matiere, classe, estPrincipal } = await request.json();
    
    const enseignant = await prisma.enseignant.findUnique({
      where: { id: enseignantId },
    });
    
    if (!enseignant) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 });
    }
    
    let matieresList: string[] = [];
    let classesList: string[] = [];
    
    try {
      matieresList = enseignant.matieres ? JSON.parse(enseignant.matieres) : [];
      classesList = enseignant.classes ? JSON.parse(enseignant.classes) : [];
    } catch (e) {
      matieresList = [];
      classesList = [];
    }
    
    if (matiere && !matieresList.includes(matiere)) {
      matieresList.push(matiere);
    }
    if (classe && !classesList.includes(classe)) {
      classesList.push(classe);
    }
    
    const updatedEnseignant = await prisma.enseignant.update({
      where: { id: enseignantId },
      data: {
        matieres: JSON.stringify(matieresList),
        classes: JSON.stringify(classesList)
      }
    });
    
    return NextResponse.json(updatedEnseignant);
  } catch (error) {
    console.error('Erreur POST:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enseignantId = parseInt(id, 10);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID enseignant invalide' }, { status: 400 });
    }
    
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { matiere, classe } = await request.json();
    
    const enseignant = await prisma.enseignant.findUnique({
      where: { id: enseignantId },
    });
    
    if (!enseignant) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 });
    }
    
    let matieresList: string[] = [];
    let classesList: string[] = [];
    
    try {
      matieresList = enseignant.matieres ? JSON.parse(enseignant.matieres) : [];
      classesList = enseignant.classes ? JSON.parse(enseignant.classes) : [];
    } catch (e) {
      matieresList = [];
      classesList = [];
    }
    
    if (matiere) {
      matieresList = matieresList.filter(m => m !== matiere);
    }
    if (classe) {
      classesList = classesList.filter(c => c !== classe);
    }
    
    const updatedEnseignant = await prisma.enseignant.update({
      where: { id: enseignantId },
      data: {
        matieres: JSON.stringify(matieresList),
        classes: JSON.stringify(classesList)
      }
    });
    
    return NextResponse.json(updatedEnseignant);
  } catch (error) {
    console.error('Erreur DELETE:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// CORRECTION IMPORTANTE DE LA METHODE PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🔵 API PUT appelée pour attribution");
    
    const { id } = await params;
    const enseignantId = parseInt(id, 10);
    
    if (isNaN(enseignantId)) {
      return NextResponse.json({ error: 'ID enseignant invalide' }, { status: 400 });
    }
    
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const body = await request.json();
    console.log("🔵 Body reçu:", body);
    
    const { matieres, classes } = body;
    
    // Vérifier que les données sont valides
    if (!matieres && !classes) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    
    // Mettre à jour l'enseignant
    const updatedEnseignant = await prisma.enseignant.update({
      where: { id: enseignantId },
      data: {
        matieres: JSON.stringify(matieres || []),
        classes: JSON.stringify(classes || [])
      }
    });
    
    console.log("🟢 Enseignant mis à jour avec succès:", {
      id: updatedEnseignant.id,
      name: updatedEnseignant.name,
      matieres: updatedEnseignant.matieres,
      classes: updatedEnseignant.classes
    });
    
    // Retourner l'enseignant mis à jour
    return NextResponse.json(updatedEnseignant);
  } catch (error) {
    console.error("🔴 Erreur API PUT:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}