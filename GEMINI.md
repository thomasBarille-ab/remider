# 🧠 Reminder & Smart Planner

## 📝 Présentation du Projet
Application de gestion de tâches et d'emploi du temps intelligent conçue pour améliorer la productivité et l'organisation personnelle. Elle combine des fonctionnalités classiques de gestion de tâches avec des algorithmes prédictifs et une interface moderne.

## 🛠 Tech Stack
- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS v4 (Support Dark Mode)
- **State Management** : Zustand (Persistance locale via localStorage)
- **UI Components** : Lucide React (Icônes)
- **Date Handling** : date-fns
- **Charts** : Recharts
- **NLP (Langage Naturel)** : chrono-node
- **Calendar Import** : ical.js

## 🚀 Fonctionnalités Implémentées

### 1. Gestion des Tâches (Core)
- **CRUD Complet** : Création, Lecture, Modification (via Modal), Suppression.
- **Détails Avancés** :
  - Titre, Date, Heure, Durée (presets ou custom).
  - **Catégories** : Système dynamique (Ajout/Modif/Suppr de catégories avec couleurs).
  - **Priorités** : Low, Medium, High.
  - **Sous-tâches** : Checklists intégrées dans chaque tâche.
  - **Routines** : Création de tâches récurrentes (Quotidien, Hebdomadaire, Intervalle personnalisé).

### 2. Vues Multiples
- **Vue Calendrier** :
  - Affichage mensuel.
  - **Drag & Drop** : Déplacer une tâche change sa date.
- **Vue Liste** :
  - Liste chronologique groupée par jour.
  - **Auto-scroll** : Défilement automatique vers la date du jour à l'ouverture.
- **Vue Kanban** :
  - Colonnes par priorité (High, Medium, Low).
  - **Drag & Drop** : Changer la priorité d'une tâche en la glissant d'une colonne à l'autre.

### 3. Intelligence & UX
- **Magic Add (NLP)** : Saisie rapide en langage naturel (ex: *"Dentiste mardi prochain à 14h"*). Support Français & Anglais.
- **Smart Suggestions** :
  - Algorithme proposant des tâches basées sur l'historique (fréquence), des rituels (bilan hebdo, clean-up) et le contexte (week-end, santé).
- **Statistiques** :
  - Graphiques de productivité (Taux de complétion, Répartition par catégorie, Activité hebdo).
- **Mode Focus (Pomodoro)** : Minuteur de 25min intégré à chaque tâche pour la concentration.
- **Dark Mode** : Thème sombre complet supporté sur toute l'application.
- **Recherche Globale** : Filtrage en temps réel des tâches sur toutes les vues.

### 4. Intégrations
- **Import Calendrier** : Support des fichiers `.ics` / iCal.
- **Connecteurs** : Google Calendar, Outlook, Runna (App de running), et liens génériques.
- **Proxy API** : Route API interne pour contourner les problèmes de CORS lors des fetchs externes.

## 📂 Structure du Projet (Clé)

```
/app
  /api/calendar-proxy  # Proxy pour import iCal
  globals.css          # Config Tailwind & Dark Mode
  page.tsx             # Layout principal & View Switcher
/components
  CalendarManager.tsx  # Modal d'import calendrier
  CalendarView.tsx     # Vue Calendrier
  CategoryManager.tsx  # Gestion des catégories
  DeleteConfirmationModal.tsx # Suppression sécurisée (Routine vs Unique)
  KanbanView.tsx       # Vue Kanban
  ListView.tsx         # Vue Liste
  SmartReview.tsx      # Barre d'outils intelligente (Stats, Suggestions, Add)
  Statistics.tsx       # Graphiques Recharts
  TaskCreationModal.tsx # Création avec NLP & Routines
  TaskDetailModal.tsx  # Édition, Focus Mode, Sous-tâches
  TaskForm.tsx         # (Legacy/Refactored into Modal)
/lib
  calendarImporter.ts  # Parsing ICS
  routineLogic.ts      # Génération des récurrences
  smartScheduler.ts    # Algorithme de suggestion
/store
  useStore.ts          # État global (Zustand)
/types
  index.ts             # Définitions TypeScript (Task, Category, etc.)
```

## 🔮 Roadmap (Idées futures)
- **Social** : Tâches partagées.
- **Matrice d'Eisenhower** : Vue automatique Urgent/Important.
- **Gamification** : Système de streaks et XP.
- **Export Data** : Sauvegarde JSON des données locales.