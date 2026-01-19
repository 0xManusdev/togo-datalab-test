# 🚗 Système de Gestion de Réservation de Véhicules

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)

> **Contexte et Objectif** : Ce projet, réalisé dans le cadre du test technique de recrutement pour le **Togo Data Lab**, est une application web de gestion de réservation de véhicules dont l'objectif est de permettre aux utilisateurs de réserver des véhicules en fonction de leurs disponibilités tout en empêchant les conflits d'usage ou chevauchement de réservations, garantissant ainsi la continuité des missions.



---

## 📋 Table des Matières

- [Démarrage Rapide](#-démarrage-rapide)
- [Architecture et Choix Techniques](#-architecture-et-choix-techniques)
- [Choix Fonctionnels et Algorithmiques](#-choix-fonctionnels-et-algorithmiques)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Installation et Lancement](#-installation-et-lancement)
- [Comptes de Démonstration](#-comptes-de-démonstration)
- [Structure du Code](#-structure-du-code)
- [Endpoints API](#-endpoints-api)
- [Perspectives d'Évolution](#-perspectives-dévolution)

---

### Schéma d'Architecture

```mermaid
flowchart LR
    subgraph Client
        A[🖥️ Next.js Frontend]
    end
    
    subgraph Serveur
        B[⚙️ Express API]
        C[🔐 JWT Auth]
    end
    
    subgraph Données
        D[(🗄️ PostgreSQL)]
    end
    
    A <-->|REST API| B
    B <--> C
    B <-->|Prisma ORM| D
```

---

## ⚡ Démarrage Rapide

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

> **Astuce** : La commande `npm run dev` à la racine lance les deux serveurs en parallèle avec des logs colorés (bleu pour le backend, magenta pour le frontend).

---

## 🏗️ Architecture et Choix Techniques

Le projet adopte une **architecture N-tiers** modulaire, assurant une séparation claire des responsabilités, une maintenabilité accrue et une facilité d'évolution.

### Frontend (Client)

Développé avec **Next.js 16** un framework React moderne, le frontend tire parti du **App Router** pour une gestion optimisée des routes et du rendu. L'interface a été pensée pour être épurée et réactive, minimisant le temps de prise en main par les agents.

| Technologie | Usage | Justification |
| :--- | :--- | :--- |
| **Next.js 16** | Framework React | Performance (SSR/SSG), Routing puissant, expérience développeur moderne. |
| **TypeScript** | Langage | Typage statique pour réduire les bugs et améliorer la robustesse du code. |
| **Tailwind CSS 4** | Styling | Développement rapide, maintenable et approche "Utility-first". |
| **Shadcn/ui** | Kit UI | Composants accessibles, personnalisables et professionnels. |
| **Zustand** | State Management | Gestion d'état global légère et performante. |
| **TanStack Query** | Data Fetching | Gestion du cache serveur, revalidation et états de chargement. |
| **React Hook Form** | Gestion de Formulaires | Performance et validation simplifiée côté client. |

### Backend (API)

L'API REST est construite avec **Node.js** et **Express**, structurée en couches logiques (**Controller** → **Service** → **Data Access Layer**) pour isoler la logique métier de la gestion des requêtes HTTP.

| Technologie | Usage | Justification |
| :--- | :--- | :--- |
| **Express.js** | Framework Web | Standard de l'industrie, robuste et flexible. |
| **Prisma ORM** | Accès Données | Sécurité du typage, migrations simplifiées et protection contre les injections SQL. |
| **PostgreSQL** | Base de Données | Fiabilité ACID, performance et gestion des contraintes relationnelles complexes. |
| **Zod** | Validation | Validation rigoureuse des entrées (Runtime type checking) avant traitement. |
| **JWT (HttpOnly)** | Authentification | Sécurité accrue contre les failles XSS par rapport au stockage local. |
| **Winston / Morgan** | Logging | Traçabilité des erreurs et débogage en production. |

---

## 🧠 Choix Fonctionnels et Algorithmiques

### 1. Modèle de Réservation : "Instant Booking"

Pour ce prototype, le choix s'est porté sur un système de **réservation directe** plutôt qu'un workflow de validation a posteriori.

- **Justification** : Ce modèle fluidifie l'expérience utilisateur pour les employés et réduit la charge administrative de validation, répondant au besoin de réactivité des missions.
- **Évolutivité** : La structure de la base de données intègre néanmoins un champ de statut (`PENDING`, `CONFIRMED`, `CANCELLED`), permettant d'activer un workflow de validation hiérarchique sans refonte majeure si les processus internes l'exigent ultérieurement.

### 2. Gestion Critique des Conflits (Algorithme)

Afin de respecter la contrainte stricte d'intégrité des données, le cœur du système repose sur un algorithme de vérification temporelle robuste implémenté dans la couche Service.

- **Logique Mathématique** : Vérification des intersections d'intervalles basée sur la logique : `(StartA < EndB) ET (EndA > StartB)`.
- **Sécurité de Concurrence** : Implémentation de **transactions SGBD** couplées à un verrouillage optimiste lors de la création d'une réservation. Cela garantit mathématiquement qu'il est impossible que deux utilisateurs réservent le même véhicule sur le même créneau simultanément (prévention des *Race Conditions*).

---

## ✨ Fonctionnalités Principales

### 🔐 Authentification et Sécurité

- **Inscription et Connexion** : Protocole sécurisé avec hachage fort des mots de passe (`bcryptjs`).
- **Gestion de Session** : Utilisation de **Cookies HttpOnly** pour sécuriser le transport des JWT.
- **Contrôle d'Accès (RBAC)** : Distinction stricte des droits entre les rôles `EMPLOYEE` et `ADMIN`.
- **Protection API** : Middleware `Helmet` pour la sécurisation des en-têtes HTTP et `Rate Limiting` contre les attaques par force brute.

### 🚙 Gestion de Flotte (Admin)

- Administration complète du parc automobile (Ajout, modification, suppression).
- Gestion des statuts de disponibilité technique (maintenance, hors service).

### 📅 Moteur de Réservation

- **Vérification de Disponibilité** : Moteur algorithmique anti-chevauchement.
- **Interface de Recherche** : Filtrage par dates et visualisation immédiate des véhicules disponibles.
- **Historique** : Suivi complet des réservations passées et à venir.

---

## 🛠️ Installation et Lancement

Pour installer et exécuter le projet localement, suivez ces instructions détaillées.

### Prérequis

- **Node.js** (v18 ou supérieur)
- **PostgreSQL** (v14 ou supérieur)
- **npm** ou **yarn**

### 1. Configuration du Backend

```bash
cd backend

# Installation des dépendances
npm install

# Configuration des variables d'environnement
# Copiez le fichier .env.example vers .env et remplissez les valeurs
cp .env.example .env
```

**Variables d'environnement requises** :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_booking"

# Secret JWT (générez une clé sécurisée)
JWT_SECRET="votre_secret_tres_securise_minimum_32_caracteres"

# Port du serveur (optionnel, défaut: 8000)
PORT=8000
```

```bash
# Synchronisation du schéma avec la base de données
npm run prisma:push

# (Optionnel) Peuplement de la base avec des données de test
npm run prisma:seed

# Lancement du serveur de développement
npm run dev
```

### 2. Configuration du Frontend

```bash
cd frontend

# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env
```

**Variables d'environnement requises** :

```env
# URL de l'API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
# Lancement du serveur de développement
npm run dev
```

### 3. Accès à l'Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000/api |

---

## 👤 Comptes de Démonstration

Après avoir exécuté le script de seed (`npm run prisma:seed`), les comptes suivants sont disponibles :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👑 **Administrateur** | `admin@example.com` | `Admin@123456` |

> **Note** : Les employés peuvent créer leur compte via la page d'inscription. L'administrateur peut ensuite gérer leurs accès depuis le tableau de bord.

### Véhicules de Démonstration

Le seed crée également 3 véhicules de test :

| Marque | Modèle | Immatriculation |
|--------|--------|-----------------|
| Toyota | Corolla 2023 | TG-1234-AB |
| Honda | Civic 2022 | TG-5678-CD |
| Hyundai | Tucson 2023 | TG-9012-EF |

---

## 📁 Structure du Code

Une structure claire a été adoptée pour faciliter la navigation et la maintenance.

### Backend (`/backend`)

```
src/
├── config/         # Configuration globale (Env, Logger, DB)
├── controllers/    # Points d'entrée des requêtes, validation des inputs
├── services/       # Logique métier pure (Algorithmes, Règles de gestion)
├── middleware/     # Auth, Gestion d'erreurs, Logging
├── routes/         # Définitions des endpoints API
├── dto/            # Data Transfer Objects (Schémas Zod)
└── utils/          # Fonctions utilitaires partagées
```

### Frontend (`/frontend`)

```
app/
├── (auth)/         # Routes d'authentification (Login/Register)
├── (dashboard)/    # Routes protégées (Tableau de bord, Réservations)
├── layout.tsx      # Layout racine de l'application
└── globals.css     # Styles globaux
components/
├── ui/             # Composants réutilisables (Design System)
└── ...             # Composants fonctionnels spécifiques
lib/                # Configuration des librairies (Axios, Utils)
stores/             # Stores Zustand (État global)
hooks/              # Hooks React personnalisés
```

---

## 🔌 Endpoints API

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/register` | Inscription d'un nouvel utilisateur |
| `POST` | `/api/auth/login` | Connexion et obtention du token JWT |
| `POST` | `/api/auth/logout` | Déconnexion (invalidation du cookie) |
| `GET` | `/api/auth/me` | Récupérer le profil de l'utilisateur connecté |

### Véhicules

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/vehicles` | Liste tous les véhicules | 🔓 Authentifié |
| `GET` | `/api/vehicles/available` | Véhicules disponibles sur une période | 🔓 Authentifié |
| `POST` | `/api/vehicles` | Ajouter un nouveau véhicule | 👑 Admin |
| `PUT` | `/api/vehicles/:id` | Modifier un véhicule | 👑 Admin |
| `DELETE` | `/api/vehicles/:id` | Supprimer un véhicule | 👑 Admin |

### Réservations

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/bookings` | Liste des réservations | 🔓 Authentifié |
| `GET` | `/api/bookings/my` | Mes réservations | 🔓 Authentifié |
| `POST` | `/api/bookings` | Créer une réservation | 🔓 Authentifié |
| `PUT` | `/api/bookings/:id` | Modifier une réservation | 🔓 Propriétaire |
| `DELETE` | `/api/bookings/:id` | Annuler une réservation | 🔓 Propriétaire |

### Utilisateurs (Admin)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/users` | Liste des utilisateurs | 👑 Admin |
| `PUT` | `/api/users/:id` | Modifier un utilisateur | 👑 Admin |
| `DELETE` | `/api/users/:id` | Supprimer un utilisateur | 👑 Admin |

---

## 🚀 Perspectives d'Évolution

Pour une mise en production à l'échelle institutionnelle, les axes d'amélioration suivants sont identifiés :

- **Containerisation (Docker)** : Mise en place de Docker et Docker Compose pour faciliter le déploiement CI/CD sur les infrastructures de l'entreprise.
- **Système de Notifications** : Intégration d'un service d'envoi d'emails (SMTP/SendGrid) pour les confirmations de réservation et les rappels.
- **Module Analytique** : Développement d'un tableau de bord statistique pour suivre le taux d'utilisation des véhicules et optimiser la taille du parc.
- **Application Mobile** : Développement d'une application React Native pour permettre les réservations en mobilité.
- **Intégration Calendrier** : Synchronisation avec Google Calendar ou Outlook pour une meilleure visibilité des réservations.
