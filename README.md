# Dash: An Educational Game

## Overview

**Dash** is an interactive endless runner game designed to educate players about the risks and consequences of underage drinking in an engaging and non-intrusive way. The player controls a running character, and the objective is to achieve the highest score possible by avoiding harmful items (beer cans) while collecting healthy ones (water bottles).

## Gameplay

The core mechanic of the game is simple yet challenging:

- **Objective:** Survive for as long as you can to maximize your score.
- **Controls:**
  - **Desktop:** Press the `Spacebar` to jump.
  - **Mobile:** Tap the screen or swipe up to jump.
- **Obstacles:** Avoid the beer cans. Colliding with a beer can will decrease your health.
- **Power-ups:** Collect water bottles to restore a small amount of health.
- **Health:** The game ends when your health bar is fully depleted.
- **Pause/Stop:** Players can pause or stop the game at any time during gameplay.

## Features

- **Progressive Difficulty:** The game becomes more challenging as your score increases. The running speed accelerates, and obstacles appear more frequently, sometimes in tricky patterns like pairs or even flying.
- **Educational Pop-ups:** As you reach certain score milestones, educational facts about the dangers of underage drinking are displayed as toast notifications without interrupting the game.
- **Responsive Design:** The game is fully responsive and optimized for both desktop and mobile devices.
- **High Score Tracking:** Your highest score is saved locally, so you can always try to beat your personal best.
- **AI-Powered Feedback:** At the end of each game, an AI-powered message provides personalized, encouraging feedback based on your performance, suggesting healthy habits and choices.

## Technology Stack

This project is built with a modern web development stack:

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI Library:** [React](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration:** [Genkit (by Firebase)](https://firebase.google.com/docs/genkit)

## Getting Started

To run the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
