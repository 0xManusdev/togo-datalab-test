# Système de Gestion de Réservation de Véhicules

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-86%20passed-brightgreen)

> **Contexte et Objectif** : Ce projet, réalisé dans le cadre du test technique de recrutement pour le **Togo Data Lab**, est une application web de gestion de réservation de véhicules dont l'objectif est de permettre aux utilisateurs de réserver des véhicules en fonction de leurs disponibilités tout en empêchant les conflits d'usage ou chevauchement de réservations, garantissant ainsi la continuité des missions.

---

## Table des Matières

- [Démarrage Rapide](#démarrage-rapide)
- [Architecture et Choix Techniques](#architecture-et-choix-techniques)
- [Choix Fonctionnels et Algorithmiques](#choix-fonctionnels-et-algorithmiques)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Installation et Lancement](#installation-et-lancement)
- [Comptes de Démonstration](#comptes-de-démonstration)
- [Structure du Code](#structure-du-code)
- [Endpoints API](#endpoints-api)
- [Perspectives d'Évolution](#perspectives-dévolution)

---

### Schéma d'Architecture

```mermaid
flowchart TB
    subgraph Frontend ["Frontend (Next.js 16)"]
        direction TB
        UI[UI Components]
        State["State Management (Zustand)"]
        Fetch["Data Fetching (TanStack Query)"]
        Router[App Router]
    end

    subgraph Backend ["Backend (Node.js / Express)"]
        direction TB
        MW["Middleware (Auth, RateLimit, Helmet)"]
        
        subgraph Logic ["Business Logic Layer"]
            Ctrl["Controllers (Zod Validation)"]
            Svc["Services (Algorithms & Rules)"]
        end
        
        ORM["Data Access (Prisma ORM)"]
    end

    subgraph Data ["Infrastructure"]
        DB[("PostgreSQL Database")]
        Bucket[("Supabase Storage")]
    end

    %% Relationships
    UI --> State
    UI --> Fetch
    Router --> Fetch
    
    Fetch == "REST API (HTTPS/JSON)" ==> MW
    
    MW --> Ctrl
    Ctrl --> Svc
    Svc --> ORM
    
    ORM == "SQL Queries" ==> DB
    Svc -. "Image Upload" .-> Bucket
```

---

## Démarrage Rapide

> **Le frontend en ligne est disponible à l'adresse :** https://togo-datalab-test-frontend.vercel.app/

```bash
# 1. Cloner le dépôt
git clone https://github.com/0xManusdev/togo-datalab-test.git
cd togo-datalab-test

# 2. Installer toutes les dépendances (racine + backend + frontend)
npm run install:all

# 3. Configurer les variables d'environnement
cp backend/.env.example backend/.env    # Configurer DATABASE_URL et JWT_SECRET
cp frontend/.env.example frontend/.env  # Configurer NEXT_PUBLIC_API_URL

# 4. Initialiser la base de données
npm run prisma:push -w backend
npm run prisma:seed -w backend  # Créer les données de test

# 5. Lancer l'application (Backend + Frontend simultanément)
npm run dev

# Accéder à l'application : http://localhost:3000
```

> **Astuce** : La commande `npm run dev` à la racine lance les deux serveurs en parallèle avec des logs colorés.

---

## Architecture et Choix Techniques

Le projet adopte une **architecture N-tiers** modulaire, assurant une séparation claire des responsabilités, une maintenabilité accrue et une facilité d'évolution.

### Frontend (Client)

Développé avec **Next.js 16** (App Router), le frontend offre une interface réactive et moderne.

| Technologie | Usage | Justification |
| :--- | :--- | :--- |
| **Next.js 16.1** | Framework React | Performance (SSR/SSG/RSC), Routing app router. |
| **TypeScript 5** | Langage | Typage strict pour la robustesse du code. |
| **Tailwind CSS 4** | Styling | Moteur de styles haute performance et utility-first. |
| **Shadcn/ui** | Kit UI | Composants accessibles et personnalisables (basé sur Radix UI). |
| **Zustand** | State Management | Gestion d'état global légère. |
| **TanStack Query v5** | Data Fetching | Gestion du cache serveur, loading states et mutations. |
| **React Hook Form** | Formulaires | Gestion performante des formulaires. |
| **Zod** | Validation | Schémas de validation partagés avec le backend. |

### Backend (API)

L'API REST est construite avec **Node.js** et **Express**, structurée en couches logiques (**Controller** → **Service** → **Data Access Layer**) pour isoler la logique métier de la gestion des requêtes HTTP.

| Technologie | Usage | Justification |
| :--- | :--- | :--- |
| **Express.js** | Framework Web | Standard de l'industrie du web, robuste et flexible. |
| **Prisma ORM** | Accès Données | Sécurité du typage, migrations simplifiées et la protection contre les injections SQL. |
| **PostgreSQL** | Base de Données | Fiabilité ACID, performance et gestion des contraintes relationnelles complexes. |
| **Zod** | Validation | Validation rigoureuse des entrées (Runtime type checking) avant tout traitement. |
| **JWT (HttpOnly)** | Authentification | Sécurité accrue contre les failles XSS par rapport au stockage local. |
| **Winston / Morgan** | Logging | Traçabilité des erreurs et débogage en production. |

---

## Choix Fonctionnels et Algorithmiques

### 1. Modèle de Réservation : "Instant Booking"

Pour ce prototype, le choix s'est porté sur un système de **réservation directe** plutôt qu'un workflow de validation a posteriori.

- **Justification** : Ce modèle fluidifie l'expérience utilisateur pour les employés et réduit la charge administrative, répondant au besoin de réactivité des missions.
- **Évolutivité** : La structure de la base de données intègre un champ de statut (`PENDING`, `CONFIRMED`, `CANCELLED`), permettant d'activer un workflow de validation sans refonte majeure.

### 2. Gestion Critique des Conflits (Algorithme)

Afin de respecter la contrainte stricte d'intégrité des données, le cœur du système repose sur un algorithme de vérification temporelle robuste.

- **Logique** : Vérification des intersections d'intervalles basée sur la logique `(StartA < EndB) ET (EndA > StartB)`.
- **Sécurité de Concurrence** : Implémentation de **transactions SGBD** pour garantir qu'il est impossible que deux utilisateurs réservent le même véhicule sur le même créneau simultanément.

### 3. Harmonisation des Fuseaux Horaires (UTC)

Pour éviter les incohérences liées aux décalages horaires (ex: réservation commençant à 00:00 mais enregistrée à 23:00 la veille), l'application applique une politique **UTC Stricte** :
- Le Frontend convertit toutes les sélections locales en UTC avant l'envoi.
- Le Backend stocke et traite exclusivement des dates UTC.
- L'affichage est reconverti dans le fuseau horaire de l'utilisateur final.

---

## Fonctionnalités Principales

### Authentification et Sécurité

- **Connexion Sécurisée** : Protocole sécurisé avec hachage fort des mots de passe (`bcryptjs`).
- **Gestion Centralisée des Utilisateurs** : Création de comptes réservée aux administrateurs.
- **Gestion de Session** : Utilisation de **Cookies HttpOnly**.
- **Contrôle d'Accès (RBAC)** : Distinction stricte des droits entre les rôles `EMPLOYEE` et `ADMIN`.
- **Protection API** : Middleware `Helmet` et `Rate Limiting`.

### Gestion de Flotte (Admin)

- Administration complète du parc automobile (Ajout, modification, suppression).
- **Upload d'images** : Stockage via Supabase Storage.

### Moteur de Réservation

- **Vérification de Disponibilité** : Moteur algorithmique anti-chevauchement.
- **Interface de Recherche** : Filtrage par dates et visualisation des véhicules disponibles.
- **Modification/Annulation** : Les utilisateurs peuvent modifier ou annuler leurs réservations futures.
- **Historique** : Suivi complet des réservations avec motif et destination.
- **Suppression (Admin)** : Les administrateurs peuvent supprimer définitivement des réservations.

### Gestion des Utilisateurs (Admin)

- Liste complète des utilisateurs avec leurs rôles.
- **CRUD complet** : Création, modification et suppression de comptes.
- Attribution des rôles (Admin/Employé).

---

## Installation et Lancement

### Prérequis

- **Node.js** (v18 ou supérieur)
- **PostgreSQL** (v14 ou supérieur)
- **npm** ou **yarn**

### 1. Configuration du Backend

> Les variables necessaires pour le backend ont été mis en pièce jointe dans le mail de soumission du projet pour des raisons de sécurité.

```bash
cd backend
npm install
cp .env.example .env
```

**Variables d'environnement requises** :
> 
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_booking"
JWT_SECRET="votre_secret_tres_securise"
PORT=8000
SUPABASE_URL="votre_url_supabase"
SUPABASE_SERVICE_KEY="cle_service_supabase"
BUCKET_NAME="vehicle-images"
```

```bash
npm run prisma:push
npm run prisma:seed
npm run dev
```

### 2. Configuration du Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

**Variables d'environnement requises** :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

### 3. Accès à l'Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000/api |

---

## Comptes de Démonstration

Après l'exécution du script de seed :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Administrateur** | `admin@test.com` | `admin@123456` |

> **Note** : Les employés ne peuvent pas créer leur propre compte. Seul l'administrateur peut créer des comptes utilisateurs.

---

## Structure du Code

### Backend (`/backend`)

```
src/
├── config/         # Configuration globale
├── controllers/    # Points d'entrée des requêtes
├── services/       # Logique métier pure
├── middleware/     # Auth, Gestion d'erreurs
├── routes/         # Définitions des endpoints API
├── dto/            # Data Transfer Objects (Schémas Zod)
└── utils/          # Fonctions utilitaires
```

### Frontend (`/frontend`)

```
app/
├── (auth)/         # Routes d'authentification
├── (dashboard)/    # Routes protégées
├── layout.tsx      # Layout racine
└── globals.css     # Styles globaux
components/
├── ui/             # Composants réutilisables
└── ...             # Composants fonctionnels
lib/                # Configuration (Axios, Utils)
stores/             # Stores Zustand
hooks/              # Hooks React personnalisés
```

---

## Endpoints API

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/logout` | Déconnexion |
| `GET` | `/api/auth/me` | Profil utilisateur |

### Véhicules

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/vehicles` | Liste des véhicules (paginée) | Admin |
| `GET` | `/api/vehicles/:id` | Détails d'un véhicule | Authentifié |
| `GET` | `/api/vehicles/available` | Véhicules disponibles (par période) | Authentifié |
| `POST` | `/api/vehicles` | Ajouter un véhicule (multipart/form-data) | Admin |
| `PUT` | `/api/vehicles/:id` | Modifier un véhicule (multipart/form-data) | Admin |
| `DELETE` | `/api/vehicles/:id` | Supprimer un véhicule | Admin |

### Réservations

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/bookings` | Liste des réservations | Authentifié |
| `GET` | `/api/bookings/my` | Mes réservations | Authentifié |
| `POST` | `/api/bookings` | Créer une réservation | Authentifié |
| `PATCH` | `/api/bookings/:id` | Modifier une réservation | Propriétaire |
| `PATCH` | `/api/bookings/:id/cancel` | Annuler une réservation | Propriétaire |
| `DELETE` | `/api/bookings/:id` | Supprimer une réservation | Admin |

### Utilisateurs (Admin)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/users` | Liste des utilisateurs | Admin |
| `GET` | `/api/users/:id` | Détails d'un utilisateur | Admin |
| `POST` | `/api/users` | Créer un utilisateur | Admin |
| `PUT` | `/api/users/:id` | Modifier un utilisateur | Admin |
| `DELETE` | `/api/users/:id` | Supprimer un utilisateur | Admin |

---

## Tests

Le projet inclut une suite de tests unitaires complète pour le backend :

```bash
cd backend
npm test
```

| Suite | Tests |
|-------|-------|
| **BookingService** | 24 tests (création, dates, chevauchement, annulation, modification, suppression) |
| **VehicleService** | 12 tests (CRUD, disponibilité, suppression avec réservations, status bookings) |
| **UserService** | 9 tests (CRUD Admin, pagination, gestion des conflits) |
| **UploadService** | 5 tests (Upload/Delete images, mocks Supabase) |
| **AuthService** | 7 tests (login, getUserById, messages d'erreur unifiés) |
| **AuthMiddleware** | 7 tests (authentification, autorisation admin) |
| **SchémasZod** | 23 tests (validation entrées + fix multipart boolean) |
| **Total** | **87 tests** |

### Collection Postman

Une collection Postman est disponible dans `backend/postman/collection.json` avec :
- Tous les endpoints documentés
- Variables d'environnement préconfigurées
- Tests automatisés intégrés

---

## Perspectives d'Évolution

- **Containerisation (Docker)** : Faciliter le déploiement CI/CD.
- **Système de Notifications** : Emails de confirmation et rappels.
- **Module Analytique** : Tableau de bord statistique.
- **Application Mobile** : React Native.
- **Intégration Calendrier** : Synchronisation externe.
