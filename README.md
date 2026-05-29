# 🌈 Flowmind — AI Workplace Productivity Assistant

> **Your team's all-in-one AI co-worker.** Flowmind helps professionals at fast-moving companies automate daily work tasks — emails, meeting notes, task planning, and research — all from a single, beautiful dark-mode dashboard.

---

![Flowmind Banner](https://via.placeholder.com/1200x400/0D0D0D/9B59B6?text=Flowmind+—+AI+Workplace+Assistant)

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-CC785C?style=flat-square)](https://anthropic.com)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API & Prompt Engineering](#-api--prompt-engineering)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Disclaimer](#-disclaimer)
- [License](#-license)

---

## 🧠 Overview

**Flowmind** is a modern, responsive AI productivity web application built for corporate teams and professionals. Whether you're drafting a high-stakes client email, summarising a two-hour strategy meeting, or planning your week under deadline pressure — Flowmind's AI-powered tools have you covered.

Designed with accessibility and simplicity in mind, Flowmind is intuitive enough for any employee to pick up on day one — no training required.

**Who is it for?**
- Corporate teams at scale (startups to enterprise)
- Project managers, executives, and operations leads
- Any professional who wants to reclaim hours lost to repetitive tasks

---

## ✨ Features

### 📧 Smart Email Generator
Generate polished, professional emails in seconds. Select your recipient type, tone, and key points — Flowmind handles the rest.

| Option | Choices |
|---|---|
| Recipient | Client, Manager, Team, Vendor, External Partner |
| Tone | Formal, Friendly, Assertive, Empathetic, Concise |
| Output | Full email with greeting, body, and call-to-action |

---

### 📝 Meeting Notes Summarizer
Paste raw meeting transcripts or notes and get back a structured breakdown instantly.

**Output includes:**
- ✅ Key discussion points
- 🎯 Action items with owners
- 📅 Deadlines mentioned
- ❓ Follow-up questions
- 📄 One-paragraph executive summary

---

### 📅 AI Task Planner
Turn a chaotic to-do list into a smart, time-blocked daily schedule.

**Input:** Task list + deadline + working hours + priority weight  
**Output:** Time-blocked schedule with priority color-coding and reasoning notes

---

### 🔍 AI Research Assistant
Get structured research summaries on any topic — fast.

**Output includes:**
- Headline summary
- 5–7 key insights (card format)
- Suggested next steps
- Questions to explore further

---

### 🏠 Dashboard
A unified home view showing:
- Personalised greeting
- Summary stats (emails, meetings, tasks, research generated)
- Quick action shortcuts
- Recent activity feed

---

## 📸 Screenshots

> _Screenshots will be added after initial deployment. To contribute screenshots, see [Contributing](#-contributing)._

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 |
| Styling | Tailwind CSS |
| AI Engine | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Routing | React Router v6 |
| State Management | React Context + useState/useReducer |
| Icons | Lucide React |
| Deployment | Vercel |
| Optional Backend | Supabase (for history persistence) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- An [Anthropic API key](https://console.anthropic.com/)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/flowmind.git
cd flowmind
```

**2. Install dependencies**

```bash
npm install
# or
yarn install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Then open `.env.local` and add your API key:

```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**4. Start the development server**

```bash
npm run dev
# or
yarn dev
```

**5. Open in browser**

```
http://localhost:5173
```

---

## 📁 Project Structure

```
flowmind/
│
├── public/                     # Static assets
│   └── favicon.ico
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── OutputPanel.jsx
│   │   └── shared/
│   │       ├── Disclaimer.jsx
│   │       └── EmptyState.jsx
│   │
│   ├── features/               # Feature modules
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── email/
│   │   │   └── EmailGenerator.jsx
│   │   ├── meeting/
│   │   │   └── MeetingSummarizer.jsx
│   │   ├── tasks/
│   │   │   └── TaskPlanner.jsx
│   │   └── research/
│   │       └── ResearchAssistant.jsx
│   │
│   ├── lib/
│   │   ├── anthropic.js        # Claude API client + prompt builders
│   │   └── prompts.js          # Structured prompt templates
│   │
│   ├── context/
│   │   └── AppContext.jsx      # Global state (history, settings)
│   │
│   ├── hooks/
│   │   └── useAI.js            # Custom hook for AI calls + loading state
│   │
│   ├── styles/
│   │   └── globals.css         # Tailwind base + custom dark theme vars
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example                # Environment variable template
├── .gitignore
├── index.html                  # Entry HTML
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic Claude API key |
| `VITE_SUPABASE_URL` | ❌ Optional | Supabase project URL (for history) |
| `VITE_SUPABASE_ANON_KEY` | ❌ Optional | Supabase anon key (for history) |

> ⚠️ **Never commit your `.env.local` file.** It is already included in `.gitignore`.

---

## 🤖 API & Prompt Engineering

Flowmind uses structured prompt engineering for every feature to ensure consistent, professional AI outputs. Each feature has a dedicated system prompt template located in `src/lib/prompts.js`.

**Example — Email Generator prompt structure:**

```js
export const buildEmailPrompt = ({ recipientType, tone, subject, keyPoints }) => ({
  system: `You are an expert business communication specialist.
           Generate a professional email for a ${recipientType}.
           Tone must be strictly ${tone}.
           Structure: greeting → body (2–3 paragraphs) → clear CTA → sign-off.
           Return only the email body. No explanations.`,
  user: `Subject: ${subject}\nKey points to include: ${keyPoints}`
});
```

All prompts follow the same pattern: a precise `system` role definition, explicit output format instructions, and a dynamic `user` message built from form inputs.

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set your environment variables in the Vercel dashboard under **Project Settings → Environment Variables**.

### Deploy to Netlify

```bash
npm run build
# Then drag the /dist folder into Netlify's deploy panel
```

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## ⚠️ Disclaimer

> **AI-generated content may require human review before use.**
> Flowmind uses Claude AI to generate content. While outputs are designed to be professional and accurate, they should always be reviewed by a qualified human before being sent, published, or acted upon. Flowmind and its contributors are not responsible for errors in AI-generated content.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for teams that move fast.</p>
  <p><strong>Flowmind</strong> — Think less. Flow more.</p>
</div>
