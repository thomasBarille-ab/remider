# 🧠 Reminder & Smart Planner

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)

**Reminder & Smart Planner** est une application de gestion de tâches intelligente et moderne, conçue pour optimiser votre productivité personnelle. Elle va au-delà de la simple "To-Do List" en intégrant des fonctionnalités de planification prédictive, des outils de concentration et une flexibilité totale d'organisation.

---

## ✨ Fonctionnalités Clés

### 🎯 Gestion Avancée des Tâches
- **Organisation Complète** : Créez des tâches avec titre, date, heure, durée et rappels.
- **Routines & Récurrences** : Configurez des tâches répétitives (quotidiennes, hebdomadaires ou personnalisées).
- **Catégories Dynamiques** : Créez et gérez vos propres catégories avec des codes couleurs personnalisés.
- **Priorités & Sous-tâches** : Définissez l'importance (Low, Medium, High) et divisez les tâches complexes en checklists.

### 👁️ Vues Multiples & Intuitives
- **📅 Vue Calendrier** : Planifiez votre mois avec support du **Drag & Drop** pour réorganiser vos journées.
- **📝 Vue Liste** : Une liste chronologique claire qui défile automatiquement vers la date du jour.
- **Kanban Board** : Gérez vos priorités visuellement en glissant vos tâches entre les colonnes (High, Medium, Low).

### 🧠 Intelligence & Productivité
- **🪄 Magic Add (NLP)** : Tapez simplement *"Dentiste mardi prochain à 14h"* et l'IA remplit tout pour vous.
- **🤖 Smart Suggestions** : L'algorithme analyse vos habitudes pour vous suggérer des tâches pertinentes (bilans hebdos, sport, tâches oubliées...).
- **⏱️ Mode Focus (Pomodoro)** : Un minuteur intégré de 25 minutes pour booster votre concentration sur une tâche précise.
- **📊 Statistiques** : Visualisez votre productivité avec des graphiques clairs (taux de complétion, répartition par catégorie).

### 🔗 Connectivité & UX
- **📅 Import Calendrier** : Synchronisez vos événements Google Calendar, Outlook ou Runna (via lien iCal/.ics).
- **🌗 Dark Mode** : Une interface soignée, confortable de jour comme de nuit.
- **🔍 Recherche Globale** : Filtrez instantanément vos tâches, quelle que soit la vue active.

---

## 🛠️ Stack Technique

Ce projet est construit avec les dernières technologies du web moderne :

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Langage** : [TypeScript](https://www.typescriptlang.org/) pour la robustesse.
- **Styles** : [Tailwind CSS v4](https://tailwindcss.com/) pour un design rapide et réactif.
- **État Global** : [Zustand](https://github.com/pmndrs/zustand) avec persistance locale (localStorage).
- **Composants UI** : [Lucide React](https://lucide.dev/) pour les icônes vectorielles.
- **Traitement de Dates** : [date-fns](https://date-fns.org/) et [chrono-node](https://github.com/wanasit/chrono) (NLP).
- **Graphiques** : [Recharts](https://recharts.org/).
- **Calendrier** : [ical.js](https://github.com/mozilla-comm/ical.js) pour le parsing.

---

## 🚀 Installation & Démarrage

1.  **Cloner le dépôt :**
    ```bash
    git clone https://github.com/votre-username/reminder-smart-planner.git
    cd reminder-smart-planner
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Lancer le serveur de développement :**
    ```bash
    npm run dev
    ```

4.  Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.