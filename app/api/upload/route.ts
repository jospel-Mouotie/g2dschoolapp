// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Créer le dossier s'il n'existe pas
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  await mkdir(uploadDir, { recursive: true });
  
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);
  
  return NextResponse.json({ 
    success: true, 
    url: `/uploads/${filename}`,
    filename 
  });
}