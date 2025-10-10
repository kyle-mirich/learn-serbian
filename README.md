# Serbian Flash 🇷🇸

A modern flashcard application for learning Serbian vocabulary, built with Next.js and Firebase.

## Features

- **Interactive Flashcards**: Study Serbian words with AI-powered translations
- **Multiple Categories**: Nouns, verbs, adjectives, adverbs, prepositions, pronouns, conjunctions, and numbers
- **Study Modes**: Sequential (frequency-based) or random order
- **Customizable Sessions**: Choose 10, 20, 50, or 100 words per session
- **Keyboard Navigation**: Use A/D, arrow keys, or spacebar for easy navigation
- **Example Sentences**: Get contextual examples for better understanding
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Firebase Firestore
- **AI**: Google Generative AI (Gemini) for translations
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- Firebase project
- Google AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kyle-mirich/learn-serbian.git
cd learn-serbian
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Set up Firestore rules:
Deploy the included `firestore.rules` to allow public read access to the words collection.

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── actions.ts         # Server actions for AI translations
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── flashcard.tsx     # Flashcard component
│   ├── main-app.tsx      # Main application logic
│   └── study-session.tsx # Study session interface
├── lib/                  # Utilities and services
│   ├── firebase.ts       # Firebase configuration
│   ├── firestore-service.ts # Firestore operations
│   └── utils.ts          # Helper functions
└── hooks/                # Custom React hooks
```

## Usage

1. **Select Category**: Choose from 8 different word categories
2. **Configure Session**: Pick study mode (sequential/random) and word count
3. **Study**: Click cards to flip, use keyboard shortcuts for navigation
4. **Examples**: View contextual examples for better understanding

### Keyboard Shortcuts

- **A** or **←**: Previous card
- **D** or **→**: Next card
- **Space** or **F**: Flip card
- **E**: Show examples (when available)
- **Esc**: Exit session

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Kyle Mirich**
- Portfolio: [kyle-mirich.vercel.app](https://kyle-mirich.vercel.app/)
- GitHub: [@kyle-mirich](https://github.com/kyle-mirich)

---

*Учимо српски! (Let's learn Serbian!)*