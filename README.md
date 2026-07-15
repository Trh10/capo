# CAPO — Plateforme de cours créatifs

Plateforme type Domestika/Netflix pour l'apprentissage de l'artisanat et de la créativité en ligne.

## Fonctionnalités

- **Catalogue de cours** avec recherche par titre, catégorie et professeur
- **Comptes utilisateurs** — 1 email = 1 compte
- **Limite de 2 appareils** par compte (téléphone, PC, navigateur)
- **Téléchargement offline** (app mobile — à venir)
- **Paiement Stripe** (à venir)
- **Lecteur vidéo** avec reprise de progression (à venir)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 + React 19 + Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Base de données | PostgreSQL + Prisma |
| Auth | JWT (cookies httpOnly) |
| Paiements | Stripe (prévu) |
| Vidéo | Mux / Cloudflare Stream (prévu) |

## Démarrage rapide

### Prérequis

- Node.js 20+
- PostgreSQL 15+

### Installation

```bash
# Cloner et installer
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec votre DATABASE_URL

# Créer les tables
npm run db:push

# Peupler avec des données de démo
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Professeur | julie.robert@capo.fr | password123 |
| Élève | eleve@capo.fr | password123 |

## Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── api/                # Routes API
│   │   ├── auth/           # Inscription, connexion, déconnexion
│   │   ├── courses/        # Catalogue de cours
│   │   ├── devices/        # Gestion des appareils
│   │   └── teachers/       # Liste des professeurs
│   ├── courses/            # Pages cours
│   ├── teachers/           # Pages professeurs
│   ├── account/            # Mon compte + appareils
│   ├── login/              # Connexion
│   └── register/           # Inscription
├── components/             # Composants React
│   ├── auth/               # Formulaires auth
│   ├── courses/            # Cartes et recherche
│   ├── account/            # Gestion appareils
│   └── layout/             # Header, Footer
└── lib/                    # Logique métier
    ├── auth.ts             # Sessions JWT
    ├── devices.ts          # Limite 2 appareils
    ├── prisma.ts           # Client base de données
    └── validations.ts      # Schémas Zod
```

## Règles métier

### Comptes
- Un seul compte par adresse email
- Vérification email (à implémenter)
- Rôles : STUDENT, TEACHER, ADMIN

### Appareils
- Maximum **2 appareils** par compte
- Chaque appareil identifié par un fingerprint unique
- L'élève peut retirer un appareil depuis son compte
- Les téléchargements offline sont liés à l'appareil

### Cours
- Prix en centimes (1499 = 14,99 €)
- Accès permanent après achat
- Leçons ordonnées avec progression sauvegardée

## Prochaines étapes

1. [ ] Intégration Stripe (achat de cours)
2. [ ] Lecteur vidéo avec reprise
3. [ ] Upload vidéo (Mux/Cloudflare Stream)
4. [ ] Téléchargement offline (app mobile React Native)
5. [ ] Espace professeur (création/gestion de cours)
6. [ ] Vérification email
7. [ ] DRM pour les téléchargements

## Scripts

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma en base
npm run db:studio    # Interface Prisma Studio
npm run db:seed      # Données de démo
```
