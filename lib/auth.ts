// lib/auth.ts
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("No Bearer token found");
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Vérifier si la session existe encore
    const session = await prisma.session.findUnique({
      where: { token },
      include: { utilisateur: true }
    });
    
    if (!session || session.expiresAt < new Date()) {
      console.log("Session expirée ou inexistante");
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("Token verified for user:", decoded.email);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}