# 🚗 Application de Réservation de Véhicules

Application web full-stack permettant aux employés d'une organisation de réserver des véhicules pour leurs déplacements professionnels.

## 📋 Contexte

Une organisation disposant d'un parc de véhicules souhaite éviter les conflits d'usage et les indisponibilités non anticipées. Cette application permet :
- Aux employés de consulter les véhicules disponibles et effectuer des réservations
- Aux administrateurs de gérer le parc automobile
- D'empêcher les conflits de réservation sur des périodes qui se chevauchent

## 🛠️ Stack Technique

### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 5.x | Framework web |
| **TypeScript** | 5.9 | Typage statique |
| **Prisma** | 7.x | ORM pour PostgreSQL |
| **PostgreSQL** | 14+ | Base de données |
| **JWT** | - | Authentification (cookies HttpOnly) |
| **Zod** | 4.x | Validation des données |
| **bcryptjs** | - | Hashage des mots de passe |
| **Winston** | - | Logging |
| **Helmet** | - | Sécurité HTTP |

### Frontend
- Next.js / React (voir dossier `frontend/`)

## 🔐 Sécurité

- **Authentification JWT** via cookies HttpOnly sécurisés
- **Rate limiting** sur les endpoints d'authentification (anti-brute-force)
- **Helmet** pour les headers de sécurité
- **CORS** configuré
- **Validation Zod** de toutes les entrées utilisateur
- **Transactions avec verrous** pour prévenir les conflits de réservation

## 📚 Fonctionnalités

### Authentification
- ✅ Inscription utilisateur
- ✅ Connexion / Déconnexion
- ✅ Gestion des rôles (EMPLOYEE / ADMIN)

### Gestion des Véhicules (Admin)
- ✅ Ajouter un véhicule
- ✅ Modifier un véhicule
- ✅ Supprimer un véhicule (si pas de réservation active)
- ✅ Activer/Désactiver la disponibilité

### Réservations
- ✅ Consulter les véhicules disponibles sur une période
- ✅ Créer une réservation
- ✅ Annuler une réservation
- ✅ Voir ses réservations (employé) / toutes les réservations (admin)
- ✅ **Prévention des conflits** : impossible de réserver un véhicule déjà réservé

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Configuration

1. **Cloner le dépôt**
```bash
git clone <url-du-depot>
cd togo-datalab-test
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**

Créer un fichier `.env` dans le dossier `backend/` :
```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/vehicle_booking

# Authentification
JWT_SECRET=votre-secret-jwt-tres-long-et-securise

# Serveur
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100

# Admin initial (optionnel, pour le seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

4. **Initialiser la base de données**
```bash
cd backend
npm run prisma:push
npm run prisma:seed
```

### Lancement

**Développement** (backend + frontend)
```bash
npm run dev
```

**Backend uniquement**
```bash
npm run dev:backend
```

**Frontend uniquement**
```bash
npm run dev:frontend
```

L'API sera disponible sur `http://localhost:8000/api/health`

## 📡 API Endpoints

### Authentification
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register/user` | Inscription utilisateur | ❌ |
| POST | `/api/auth/register/admin` | Ajouter un admin | 🔒 Admin |
| POST | `/api/auth/login` | Connexion | ❌ |
| POST | `/api/auth/logout` | Déconnexion | ❌ |
| GET | `/api/auth/me` | Profil utilisateur | 🔒 |

### Véhicules
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/vehicles` | Lister tous les véhicules | 🔒 |
| GET | `/api/vehicles/available?startDate=...&endDate=...` | Véhicules disponibles | 🔒 |
| GET | `/api/vehicles/:id` | Détails d'un véhicule | 🔒 |
| POST | `/api/vehicles` | Créer un véhicule | 🔒 Admin |
| PUT | `/api/vehicles/:id` | Modifier un véhicule | 🔒 Admin |
| DELETE | `/api/vehicles/:id` | Supprimer un véhicule | 🔒 Admin |

### Réservations
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/bookings` | Mes réservations (admin: toutes) | 🔒 |
| GET | `/api/bookings/:id` | Détails d'une réservation | 🔒 |
| POST | `/api/bookings` | Créer une réservation | 🔒 |
| PATCH | `/api/bookings/:id/cancel` | Annuler une réservation | 🔒 |
| GET | `/api/bookings/vehicle/:vehicleId` | Réservations d'un véhicule | 🔒 |

## 📁 Structure du Projet

```
backend/
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   ├── migrations/        # Migrations SQL
│   └── seed.ts            # Script d'initialisation
├── src/
│   ├── config/            # Configuration (env, logger)
│   ├── controllers/       # Contrôleurs HTTP
│   ├── dto/               # Schémas de validation Zod
│   ├── errors/            # Classes d'erreurs personnalisées
│   ├── middleware/        # Auth, validation, rate limiting
│   ├── routes/            # Définition des routes
│   ├── services/          # Logique métier
│   ├── utils/             # Utilitaires
│   ├── app.ts             # Configuration Express
│   └── server.ts          # Point d'entrée
└── package.json
```

## 🧪 Tests

Collection Postman disponible dans `backend/postman/` pour tester les endpoints.

## 📝 Licence

ISC
