# Gemini Project Plan: Kiroween Hackathon - Dark Productivity Suite

## 1. Project Overview

This document outlines the structure, features, and potential development plan for the **Dark Productivity Suite**, a project for the Kiroween Hackathon.

The application is a web-based, feature-rich productivity application built with a dark, gothic, and Halloween-inspired aesthetic. It integrates several modules aimed at writers, developers, and anyone looking for a more atmospheric workspace. The backend is powered by Firebase, and it includes AI-powered features.

## 2. Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend & Database:** Firebase (Firestore, Firebase Auth, Cloud Storage)
- **Styling:** CSS Modules with dynamic theming support.
- **State Management:** React Context API
- **AI Integration:** Google Gemini (via `aiService.ts`)
- **Testing:** Vitest

## 3. Core Features & Modules

The project is structured around several key features:

| Feature | Folder Location | Description |
| :--- | :--- | :--- |
| **Authentication** | `src/components/auth` | Handles user registration, login, password reset, and social auth. |
| **Necronomicon Notes** | `src/components/necronomicon-notes`| A themed note-taking section. Likely a core part of the suite. |
| **Ghost Writer** | `src/components/ghost-writer` | An AI-powered writing assistant, featuring a modal and editor. |
| **Terminal Tarot** | `src/components/terminal-tarot`| An interactive tarot card reading feature with a unique interface. |
| **Forest Hub** | `src/components/forest-hub` | A potential focus or gamification feature, possibly a "digital garden" that grows with user productivity. |
| **Graveyard Dashboard**| `src/components/graveyard-dashboard`| A central dashboard. Currently a placeholder, but intended to give an overview of user activity. |
| **Theming** | `src/themes` | A system for applying different visual themes, like `bloodMoon` and `midnightForest`. |
| **Common Components** | `src/components/common` | Contains shared UI elements like modals, navigation, notifications, and loading states. |

## 4. Project Structure Highlights

- **`src/components`**: Feature-specific React components are modularized here.
- **`src/contexts`**: Global state management for Auth, Theme, Notes, Tasks, etc.
- **`src/services`**: Contains the business logic for interacting with external APIs like Firebase (`firebaseService.ts`) and AI models (`aiService.ts`).
- **`src/hooks`**: Reusable custom React hooks for shared logic (e.g., `usePomodoro`, `useKeyboardShortcuts`).
- **`firebase.json`**: Configuration for Firebase hosting and Firestore rules.

## 5. Proposed Hackathon Goals

Based on the current structure, here are some potential tasks for the hackathon:

1.  **Flesh out the `graveyard-dashboard`**: Implement a functional dashboard to visualize user stats, recent notes, and active tasks.
2.  **Enhance `forest-hub` Interactivity**: Make the "Forest Hub" dynamic. For example, have trees grow as Pomodoro timers or tasks are completed.
3.  **Create a New "Cursed Calendar" Module**: Add a new calendar/agenda feature that aligns with the application's dark theme.
4.  **Refine UI/UX**: Polish the UI for existing features, ensuring a consistent and immersive user experience across the suite.
5.  **Expand AI Capabilities**: Integrate the `aiService` into other areas, such as summarizing notes from the Necronomicon or generating creative writing prompts.
