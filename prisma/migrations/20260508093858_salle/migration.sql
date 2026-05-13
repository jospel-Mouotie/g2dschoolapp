-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matiere" TEXT NOT NULL,
    "professeur" TEXT NOT NULL,
    "salle" TEXT,
    "classe" TEXT NOT NULL,
    "jour" TEXT NOT NULL,
    "heure" TEXT NOT NULL,
    "duree" REAL NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'En cours',
    "students" INTEGER NOT NULL DEFAULT 0,
    "coefficient" INTEGER NOT NULL DEFAULT 1,
    "hoursPerWeek" INTEGER NOT NULL DEFAULT 1,
    "image" TEXT,
    "enseignantId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cours_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Cours" ("classe", "coefficient", "createdAt", "duree", "enseignantId", "heure", "hoursPerWeek", "id", "image", "jour", "matiere", "professeur", "progress", "salle", "status", "students", "updatedAt") SELECT "classe", "coefficient", "createdAt", "duree", "enseignantId", "heure", "hoursPerWeek", "id", "image", "jour", "matiere", "professeur", "progress", "salle", "status", "students", "updatedAt" FROM "Cours";
DROP TABLE "Cours";
ALTER TABLE "new_Cours" RENAME TO "Cours";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
