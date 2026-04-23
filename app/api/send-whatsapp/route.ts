// app/api/send-whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { telephone, message } = await request.json();
    
    if (!telephone || !message) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
    // Nettoyer le numéro
    let numero = telephone.replace(/\s/g, '').replace(/^0+/, '');
    if (!numero.startsWith('237') && !numero.startsWith('+237')) {
      numero = '237' + numero;
    }
    if (!numero.startsWith('+')) {
      numero = '+' + numero;
    }
    
    // Pour l'instant, on retourne l'URL WhatsApp Web
    // En production, utilisez l'API WhatsApp Business
    const whatsappUrl = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
    
    return NextResponse.json({ 
      success: true, 
      url: whatsappUrl,
      message: 'WhatsApp Web ouvert avec le message pré-rempli'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}