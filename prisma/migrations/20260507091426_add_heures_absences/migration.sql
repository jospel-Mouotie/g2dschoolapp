-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Absence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eleveId" INTEGER NOT NULL,
    "coursId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "duree" REAL NOT NULL,
    "justifiee" BOOLEAN NOT NULL DEFAULT false,
    "motif" TEXT,
    "enseignantId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heuresAbsence" REAL NOT NULL DEFAULT 0,
    "semestre" TEXT,
    "mois" TEXT,
    "anneeScolaire" TEXT,
    CONSTRAINT "Absence_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Absence_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Absence_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Absence" ("coursId", "createdAt", "date", "duree", "eleveId", "enseignantId", "heureDebut", "heureFin", "id", "justifiee", "motif") SELECT "coursId", "createdAt", "date", "duree", "eleveId", "enseignantId", "heureDebut", "heureFin", "id", "justifiee", "motif" FROM "Absence";
DROP TABLE "Absence";
ALTER TABLE "new_Absence" RENAME TO "Absence";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
