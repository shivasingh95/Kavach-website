# Kavach — College Cybersecurity Club Platform

Welcome to the Kavach Platform repository! This is a multi-portal web platform built with Next.js 14, Express, and Firebase Firestore.

## Prerequisites
- Node.js (v18+)
- Firebase Project (with Firestore enabled)
- Redis (optional for local dev, needed for prod/leaderboard)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` in the root folder and fill in the values:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup**
   Ensure you have a Firebase project created and Firestore enabled.
   Download your Firebase Admin SDK service account key, and fill in the following variables in `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   This will start both the frontend (localhost:3000) and backend (localhost:5000).

## Branch Strategy
- `main`: Production branch. Protected.
- `dev`: Integration branch for new features.
- Feature branches should stem from `dev` and be prefixed with `feature/` or `fix/`.

## Conventional Commits
We use commitlint to enforce conventional commits. Format your commits as:
`feat: add auth routes` or `fix: resolve login bug`
