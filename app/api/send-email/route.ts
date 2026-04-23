// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { envoyerEmail, testerConnexionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();
    
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
    const result = await envoyerEmail(to, subject, html, text);
    
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint de test
export async function GET(request: NextRequest) {
  const isConnected = await testerConnexionEmail();
  return NextResponse.json({ connected: isConnected });
}