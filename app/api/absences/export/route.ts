// app/api/absences/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'enseignant')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    const { format, classe, periode, semestre, stats, absencesParEleve } = data;
    
    // Générer le HTML pour le PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relevé d'absences - ${classe}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1e40af; text-align: center; }
          .header { text-align: center; margin-bottom: 30px; }
          .header p { color: #64748b; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .stats { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 10px; }
          .stat-item { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 12px; color: #64748b; }
          .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relevé d'absences</h1>
          <p>Classe : ${classe}</p>
          <p>Période : ${periode || 'Année scolaire complète'}</p>
          <p>Semestre : ${semestre || 'Tous'}</p>
          <p>Date d'édition : ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
    `;
    
    if (format === 'recap') {
      htmlContent += `
        <div class="stats">
          <div class="stat-item"><div class="stat-value">${stats.totalHeures}h</div><div class="stat-label">Total heures</div></div>
          <div class="stat-item"><div class="stat-value">${stats.totalAbsences}</div><div class="stat-label">Total absences</div></div>
          <div class="stat-item"><div class="stat-value">${stats.absencesJustifiees}</div><div class="stat-label">Justifiées</div></div>
          <div class="stat-item"><div class="stat-value">${stats.absencesNonJustifiees}</div><div class="stat-label">Non justifiées</div></div>
          <div class="stat-item"><div class="stat-value">${stats.moyenneParEleve.toFixed(1)}h</div><div class="stat-label">Moyenne/élève</div></div>
        </div>
        <table>
          <thead>
            <tr><th>N°</th><th>Élève</th><th>Total heures</th><th>Nb absences</th><th>Justifiées</th><th>Non justifiées</th></tr>
          </thead>
          <tbody>
      `;
      
      absencesParEleve.forEach((item: any, index: number) => {
        const justifiees = item.absences.filter((a: any) => a.justifiee).length;
        const nonJustifiees = item.absences.length - justifiees;
        htmlContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.eleve.nom}</td>
            <td><strong>${item.totalHeures}h</strong></td>
            <td>${item.absences.length}</td>
            <td>${justifiees}</td>
            <td>${nonJustifiees}</td>
          </tr>
        `;
      });
      
      htmlContent += `</tbody></table>`;
    } else {
      // Format détaillé
      htmlContent += `<table><thead><tr><th>Élève</th><th>Date</th><th>Horaire</th><th>Matière</th><th>Durée</th><th>Justifiée</th><th>Motif</th></tr></thead><tbody>`;
      
      absencesParEleve.forEach((item: any) => {
        item.absences.forEach((absence: any) => {
          htmlContent += `
            <tr>
              <td>${item.eleve.nom}</td>
              <td>${new Date(absence.date).toLocaleDateString('fr-FR')}</td>
              <td>${absence.heureDebut} - ${absence.heureFin}</td>
              <td>${absence.cours?.matiere || '-'}</td>
              <td>${absence.heuresAbsence || absence.duree}h</td>
              <td>${absence.justifiee ? 'OUI' : 'NON'}</td>
              <td>${absence.motif || '-'}</td>
            </tr>
          `;
        });
      });
      
      htmlContent += `</tbody></table>`;
    }
    
    htmlContent += `
        <div class="footer">
          <p>Document généré automatiquement - ${new Date().toLocaleString('fr-FR')}</p>
          <p>Enseignant : ${auth.nom || auth.email}</p>
        </div>
      </body>
      </html>
    `;
    
    // Utiliser une bibliothèque comme puppeteer ou html-pdf pour générer le PDF
    // Pour simplifier, on retourne le HTML qui peut être imprimé
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="absences_${classe}.html"`
      }
    });
  } catch (error) {
    console.error("Erreur export:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}