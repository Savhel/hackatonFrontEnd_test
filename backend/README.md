# Backend de l'Application de Gestion d'Organisations Académiques

Ce projet est le backend de l'application de gestion d'organisations académiques, développé avec Spring Boot et Spring Security, utilisant une base de données MySQL.

## Structure du Projet

Le backend est organisé selon l'architecture suivante :

```
src/main/java/com/hackaton/backend/
├── config/           # Configuration Spring (Security, CORS, etc.)
├── controller/       # Contrôleurs REST API
├── dto/              # Objets de transfert de données
├── exception/        # Gestion des exceptions
├── model/            # Entités JPA
├── repository/       # Repositories JPA
├── security/         # Configuration de sécurité et JWT
├── service/          # Services métier
└── BackendApplication.java  # Point d'entrée de l'application
```

## Fonctionnalités Implémentées

- Authentification et autorisation avec JWT
- Gestion des utilisateurs (CRUD)
- Gestion des événements (CRUD)
- Gestion des projets (CRUD)
- Gestion des tâches (CRUD)
- Gestion des transactions financières (CRUD)
- Gestion des contributions (CRUD)

## Prérequis

- Java 17 ou supérieur
- Maven
- MySQL

## Installation et Démarrage

1. Assurez-vous que MySQL est installé et en cours d'exécution
2. Configurez les paramètres de base de données dans `src/main/resources/application.properties` si nécessaire
3. Exécutez les commandes suivantes :

```bash
# Compiler le projet
mvn clean install

# Démarrer l'application
mvn spring-boot:run
```

L'API sera accessible à l'adresse : http://localhost:8080/api

## Intégration avec le Frontend

Le frontend communique avec ce backend via des appels API REST. Les services frontend ont été modifiés pour utiliser ces endpoints API au lieu des données JSON statiques.

## Documentation API

Les principaux endpoints API sont :

- `/api/auth/**` - Authentification (login, register)
- `/api/users/**` - Gestion des utilisateurs
- `/api/events/**` - Gestion des événements
- `/api/projects/**` - Gestion des projets
- `/api/tasks/**` - Gestion des tâches
- `/api/transactions/**` - Gestion des transactions
- `/api/contributions/**` - Gestion des contributions

## Sécurité

L'application utilise Spring Security avec JWT pour l'authentification. Tous les endpoints (sauf login et register) nécessitent un token JWT valide.