# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Serbian Flash** is a Serbian language learning flashcard application built with Next.js, Firebase, and AI-powered translation. The app helps users learn Serbian vocabulary through interactive flashcards that translate Serbian words to English using Google's Gemini AI.

## Architecture

### Core Components
- **Frontend**: Next.js 15 with React 18, TypeScript, and Tailwind CSS
- **UI Library**: Radix UI primitives with shadcn/ui components  
- **AI Integration**: Firebase Genkit with Google AI (Gemini 2.0 Flash)
- **Deployment**: Firebase App Hosting
- **Styling**: Custom design system with Serbian cultural theme colors

### Key Directories
- `src/app/` - Next.js App Router pages and server actions
- `src/components/` - React components including flashcard UI and shadcn/ui components
- `src/ai/` - AI flows and Genkit configuration for translation
- `most-used/` - CSV files containing frequency-ranked Serbian words by part of speech

### Data Structure
The `most-used/` directory contains linguistic corpus data from srWaC12 (Serbian Web Corpus):
- Organized by parts of speech: `adj/`, `adv/`, `conjunction/`, `noun/`, `numbers/`, `preposition/`, `pronoun/`, `verb/`, `word/`
- CSV format with columns: Item, Frequency, Relative frequency
- Used to provide authentic, frequency-based Serbian vocabulary for learning

## Development Commands

```bash
# Start development server (port 9002)
pnpm dev

# Start Genkit development environment  
pnpm genkit:dev

# Watch mode for Genkit development
pnpm genkit:watch

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type checking
pnpm typecheck
```

## AI Translation System

The app uses a structured AI flow:
1. `src/ai/flows/translate-serbian-word.ts` - Defines translation flow with Zod schemas
2. `src/app/actions.ts` - Server action with Next.js caching (1 hour TTL)
3. `src/ai/genkit.ts` - Genkit configuration with Gemini 2.0 Flash model

Translation requests are cached to reduce API calls and improve performance.

## Design System

Color scheme based on Serbian cultural aesthetics:
- Primary: Vivid red (#E63946) 
- Background: Light pink (#F1FAEE)
- Accent: Deep purple (#A8DADC)
- Fonts: 'Belleza' (headlines), 'Alegreya' (body text)

## Package Manager

This project uses **pnpm** as the package manager. Always use `pnpm` commands instead of `npm` or `yarn`.