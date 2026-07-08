# WorkWise AI

**Your intelligent workplace productivity assistant, powered by Nova.**

WorkWise AI is a single, integrated SaaS-style productivity platform that helps
professionals automate everyday workplace tasks — writing emails, researching
topics, planning tasks, summarising meetings, and chatting with an AI assistant
— all inside one polished, responsive workspace.

---

## Project overview

WorkWise AI centralises the small productivity tools that a modern
knowledge-worker uses every day into a single, unified interface. Instead of
jumping between browser tabs and disconnected AI tools, users interact with
**Nova**, a friendly AI assistant, from within a clean sidebar-driven layout.

Everything Nova generates can be saved into the **AI Workspace**, organised in
folders, tagged, favourited, pinned, and revisited later — turning WorkWise AI
from a collection of AI tools into a real productivity platform.

---

## Features

### AI features
- **Smart Email Generator** — polished business emails from a short brief
- **AI Research Assistant** — structured research reports (summary, pros/cons,
  recommendations, follow-up questions)
- **Meeting Notes Summariser** — decisions, action items, owners, deadlines
- **AI Task Planner** — turns a goal into a prioritised, checkable plan
- **AI Chatbot (Nova)** — threaded conversations with persistent history

### Productivity & UX
- 🔥 **Daily Productivity Streak** with badges (🥉 3d, 🥈 7d, 🥇 30d, 🏆 100d)
  and motivational messages
- 💡 **AI Tip of the Day** widget with a "Next tip" button
- 📋 **Prompt Templates** library (search, category filters, favourites,
  one-click "Use template" that prefills the target tool)
- 📂 **AI Workspace** — pinned docs, favourites, custom folders, tags, global
  search, filter by feature/date, rename / delete
- 🤖 **Polished AI thinking animation** — rotating status messages, animated
  Nova avatar, success toast on completion
- 📊 **Productivity Score**, activity feed, and per-feature stats

### Design system
- ☀️ **Light mode**
- 🌙 **Dark mode**
- 🌅 **Dynamic mode** — automatically switches between a warm **Sunrise**
  palette (6 AM – 6 PM) and a cosy **Sunset** palette (6 PM – 6 AM), with a
  smooth transition
- Theme toggle in the top navigation and in Settings, remembered across the
  session
- Fully responsive layout for desktop, tablet and mobile
- Consistent semantic tokens; every card, form and modal adapts to the
  current theme

### Responsible AI
A dedicated **Responsible AI** page explains how Nova is designed to be a
helpful assistant, not a replacement for human judgement — plus practical
tips (don't share confidential data, verify important outputs, iterate on
prompts, etc.).

---

## Tools used

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7,
  file-based routing, SSR-ready)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS-first, `@theme` design tokens)
- **UI components:** [shadcn/ui](https://ui.shadcn.com/) + [lucide-react](https://lucide.dev/) icons
- **AI:** Vercel AI SDK via the Lovable AI Gateway (`gpt-5.5`)
- **Chat UI:** [AI Elements](https://elements.ai-sdk.dev/) primitives with a
  custom Nova identity
- **State / persistence:** browser `localStorage` (profile, settings, chat
  threads, workspace, streaks, activity)
- **Runtime:** deployed on Cloudflare Workers via Lovable
- **Notifications:** [sonner](https://sonner.emilkowal.ski/)

---

## Setup instructions

### Prerequisites
- Node.js 20+ or [Bun](https://bun.sh/) 1.1+

### Install dependencies
```bash
bun install
```

### Run the dev server
```bash
bun run dev
```
The app is served at `http://localhost:8080`.

### Build for production
```bash
bun run build
```

### Environment
On Lovable, the AI Gateway is configured automatically. If self-hosting, set
the gateway credentials expected by `src/lib/ai-gateway.server.ts` in your
`.env`.

---

## Project structure

```
src/
  routes/              # File-based routes (Dashboard, Email, Research, Chat,
                       # Meetings, Tasks, Templates, Workspace, Settings,…)
  components/          # AppSidebar, AiOutputCard, NovaAvatar, ThemeToggle, ui/
  hooks/               # use-storage, use-mobile
  lib/                 # storage, templates, ai.functions, ai-gateway.server
  styles.css           # Tailwind v4 theme tokens (light / dark / sunrise / sunset)
```

---

## Team members

_Built as an academic project. Add team member names here, e.g.:_

- Your Name — Product & UX
- Team Member — Frontend
- Team Member — AI Integration

---

## Responsible AI notice

WorkWise AI is designed to _assist_ workplace tasks. Always review AI-generated
content before sharing, avoid entering confidential company data, and treat AI
output as a starting point — not the final word.