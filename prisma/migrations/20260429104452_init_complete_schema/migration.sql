-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" TEXT NOT NULL,
    "eleveId" INTEGER,
    "enseignantId" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniereConnexion" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Utilisateur_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Utilisateur_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "utilisateurId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "matieres" TEXT NOT NULL,
    "classes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Titulaire',
    "photo" TEXT,
    "bureau" TEXT,
    "horaires" TEXT
);

-- CreateTable
CREATE TABLE "Enseignement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matiere" TEXT NOT NULL,
    "classe" TEXT NOT NULL,
    "estPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "enseignantId" INTEGER NOT NULL,
    CONSTRAINT "Enseignement_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Eleve" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "classe" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "statusColor" TEXT NOT NULL DEFAULT 'bg-emerald-400',
    "img" TEXT,
    "photo" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "dateNaissance" TEXT,
    "lieuNaissance" TEXT,
    "nationalite" TEXT DEFAULT 'Camerounaise',
    "sexe" TEXT DEFAULT 'M',
    "adresse" TEXT,
    "parentNom" TEXT,
    "parentTelephone" TEXT,
    "parentEmail" TEXT,
    "parentProfession" TEXT,
    "dateInscription" TEXT,
    "ancienEtablissement" TEXT,
    "redoublant" BOOLEAN DEFAULT false,
    "situationFamiliale" TEXT,
    "nomComplet" TEXT,
    "selected" BOOLEAN DEFAULT false,
    "moyenne" TEXT,
    "noteColor" TEXT
);

-- CreateTable
CREATE TABLE "Cours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matiere" TEXT NOT NULL,
    "professeur" TEXT NOT NULL,
    "salle" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "coursId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Module_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chapitre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "estFait" BOOLEAN NOT NULL DEFAULT false,
    "duree" INTEGER,
    "moduleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chapitre_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eleveId" INTEGER NOT NULL,
    "matiereId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "eval1" REAL,
    "eval2" REAL,
    "moyenne" REAL,
    "appreciation" TEXT,
    CONSTRAINT "Note_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Note_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Matiere" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "coefficient" INTEGER NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Absence" (
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
    CONSTRAINT "Absence_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Absence_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Absence_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coursId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heure" TEXT NOT NULL,
    "effectuePar" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appel_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppelDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appelId" INTEGER NOT NULL,
    "eleveId" INTEGER NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "justifiee" BOOLEAN NOT NULL DEFAULT false,
    "motif" TEXT,
    CONSTRAINT "AppelDetail_appelId_fkey" FOREIGN KEY ("appelId") REFERENCES "Appel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppelDetail_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eleve" TEXT NOT NULL,
    "classe" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'impayé',
    "methode" TEXT NOT NULL,
    "reference" TEXT,
    "eleveId" INTEGER,
    CONSTRAINT "Transaction_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FraisNiveau" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "niveau" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "classe" TEXT NOT NULL,
    "matiere" TEXT,
    "taille" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "auteurId" INTEGER,
    "approuve" BOOLEAN NOT NULL DEFAULT false,
    "telechargements" INTEGER NOT NULL DEFAULT 0,
    "favori" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "expediteur" TEXT NOT NULL,
    "expediteurRole" TEXT NOT NULL,
    "expediteurAvatar" TEXT NOT NULL,
    "destinataireClasse" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "pieceJointe" TEXT
);

-- CreateTable
CREATE TABLE "Salle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "batiment" TEXT NOT NULL,
    "equipements" TEXT,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Niveau" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Classe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "niveauId" TEXT NOT NULL,
    "effectif" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Classe_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "logo" TEXT,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "devise" TEXT DEFAULT 'FCFA',
    "anneeScolaire" TEXT NOT NULL,
    "region" TEXT,
    "delegation" TEXT,
    "departement" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pause" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_eleveId_key" ON "Utilisateur"("eleveId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_enseignantId_key" ON "Utilisateur"("enseignantId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_email_key" ON "Enseignant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Eleve_matricule_key" ON "Eleve"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Matiere_nom_key" ON "Matiere"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "FraisNiveau_niveau_key" ON "FraisNiveau"("niveau");

-- CreateIndex
CREATE UNIQUE INDEX "Salle_nom_key" ON "Salle"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Niveau_nom_key" ON "Niveau"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Classe_nom_key" ON "Classe"("nom");
