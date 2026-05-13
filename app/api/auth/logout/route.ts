import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    
    if (auth) {
      const token = request.headers.get('authorization')?.split(' ')[1];
      if (token) {
        await prisma.session.deleteMany({
          where: { token }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur logout:", error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}