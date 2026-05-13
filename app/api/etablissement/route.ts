import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    let etablissement = await prisma.etablissement.findFirst();
    
    if (!etablissement) {
      etablissement = await prisma.etablissement.create({
        data: {
          nom: "Lycée de Deido",
          adresse: "BP : 6500 Douala",
          telephone: "65268234 / 695789136",
          email: "contact@lyceedeido.cm",
          anneeScolaire: "2026/2027",
          devise: "FCFA",
          region: "Littoral",
          delegation: "DOUALA 5ÈME",
          departement: "WOURI"
        }
      });
    }
    
    return NextResponse.json(etablissement);
  } catch (error) {
    console.error("Erreur GET /api/etablissement:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    let etablissement = await prisma.etablissement.findFirst();
    
    if (etablissement) {
      etablissement = await prisma.etablissement.update({
        where: { id: etablissement.id },
        data
      });
    } else {
      etablissement = await prisma.etablissement.create({ data });
    }
    
    return NextResponse.json(etablissement);
  } catch (error) {
    console.error("Erreur PUT /api/etablissement:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}