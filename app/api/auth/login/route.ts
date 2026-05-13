// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;
    const motDePasse = body.motDePasse || body.password;
    
    console.log("🔐 Tentative de connexion:", { email });
    
    if (!email || !motDePasse) {
      return NextResponse.json({ 
        error: 'Email et mot de passe requis' 
      }, { status: 400 });
    }
    
    // Rechercher l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { eleve: true, enseignant: true }
    });
    
    if (!utilisateur) {
      console.log("❌ Utilisateur non trouvé:", email);
      return NextResponse.json({ 
        error: 'Email ou mot de passe incorrect' 
      }, { status: 401 });
    }
    
    if (!utilisateur.actif) {
      console.log("❌ Compte inactif");
      return NextResponse.json({ 
        error: 'Compte désactivé' 
      }, { status: 401 });
    }
    
    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    
    if (!isValid) {
      console.log("❌ Mot de passe invalide");
      return NextResponse.json({ 
        error: 'Email ou mot de passe incorrect' 
      }, { status: 401 });
    }
    
    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: utilisateur.id, 
        email: utilisateur.email, 
        role: utilisateur.role,
        enseignantId: utilisateur.enseignantId,
        eleveId: utilisateur.eleveId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Sauvegarder la session
    try {
      await prisma.session.create({
        data: {
          token,
          utilisateurId: utilisateur.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    } catch (sessionError) {
      console.warn("⚠️ Erreur sauvegarde session (non bloquante):", sessionError);
    }
    
    console.log("✅ Connexion réussie pour:", email);
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
        enseignantId: utilisateur.enseignantId,
        eleveId: utilisateur.eleveId
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur login:", error);
    return NextResponse.json({ 
      error: 'Erreur serveur. Veuillez réessayer.' 
    }, { status: 500 });
  }
}