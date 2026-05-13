// app/api/eleves/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eleve = await prisma.eleve.findUnique({
      where: { id: parseInt(id) },
      include: { utilisateur: true, notes: true },
    });
    return NextResponse.json(eleve);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const eleveId = parseInt(id);

    const eleve = await prisma.eleve.update({
      where: { id: eleveId },
      data: {
        nom: body.nom,
        classe: body.classe,
        matricule: body.matricule,
        img: body.img,
        email: body.email,
        telephone: body.telephone,
        dateNaissance: body.dateNaissance,
        lieuNaissance: body.lieuNaissance,
        nationalite: body.nationalite,
        sexe: body.sexe,
        adresse: body.adresse,
        parentNom: body.parentNom,
        parentTelephone: body.parentTelephone,
        parentEmail: body.parentEmail,
        parentProfession: body.parentProfession,
      },
    });

    // Mettre à jour ou créer le compte parent
    if (body.parentNom && body.parentEmail) {
      const existingParent = await prisma.utilisateur.findFirst({
        where: { eleveId, role: "parent" },
      });

      const prenom = body.parentNom.split(' ')[0].toLowerCase();
      const motDePasse = `${prenom}123`;
      const hashedPassword = await bcrypt.hash(motDePasse, 10);

      if (existingParent) {
        await prisma.utilisateur.update({
          where: { id: existingParent.id },
          data: {
            email: body.parentEmail,
            motDePasse: hashedPassword,
            nom: body.parentNom,
          },
        });
      } else {
        await prisma.utilisateur.create({
          data: {
            email: body.parentEmail,
            motDePasse: hashedPassword,
            nom: body.parentNom,
            role: "parent",
            eleveId,
            actif: true,
          },
        });
      }
    }

    return NextResponse.json(eleve);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eleveId = parseInt(id);

    // Supprimer le compte parent associé
    await prisma.utilisateur.deleteMany({
      where: { eleveId, role: "parent" },
    });

    // Supprimer l'élève
    await prisma.eleve.delete({
      where: { id: eleveId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}