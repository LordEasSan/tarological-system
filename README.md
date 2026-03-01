# MTPS — Meta-Tarological Positivist System

> A formal framework for parameterised tarot-deck generation, narrative synthesis, and temporal-logic verification.

[![CI](https://github.com/LordEasSan/tarot-webapp/actions/workflows/ci.yml/badge.svg)](https://github.com/LordEasSan/tarot-webapp/actions/workflows/ci.yml)
[![Deploy](https://github.com/LordEasSan/tarot-webapp/actions/workflows/deploy.yml/badge.svg)](https://github.com/LordEasSan/tarot-webapp/actions/workflows/deploy.yml)

---

## 🌟 Overview

The MTPS webapp provides an interactive interface for:

- **Configuring** tarot parameters (θ ∈ Θ): archetype family, deck size, spread layout, meaning weights
- **Generating** parameterised tarot decks with interactive card-flip visualisations
- **Visualising** spreads, narrative readings, and meaning-weight radar charts
- **Verifying** readings with formal LTL model checking (safety, cosafety, liveness, coliveness)

**Live:** [https://lordeassan.github.io/tarot-webapp/](https://lordeassan.github.io/tarot-webapp/)

---

## 🏗 Architecture

```
├── src/                    # React + TypeScript frontend
│   ├── api/                # API client + mock data
│   ├── components/         # Reusable UI components
│   │   ├── cards/          # TarotCardView, SpreadVisualizer
│   │   ├── charts/         # MeaningRadar (Chart.js)
│   │   ├── layout/         # Header, Footer, Layout, ThemeToggle
│   │   └── verify/         # LTLVerifier
│   ├── context/            # React context (Theme, App state)
│   ├── pages/              # Route pages
│   ├── test/               # Vitest tests
│   └── types/              # TypeScript interfaces
├── cloudflare-worker/      # Serverless API (Cloudflare Workers)
│   ├── handler.js          # API route handler
│   └── wrangler.toml       # Wrangler config
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # Lint, typecheck, test, build
│   │   └── deploy.yml      # Deploy frontend + worker
│   └── ISSUE_TEMPLATE/     # Bug report & feature request templates
└── public/                 # Static assets
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Styling** | Tailwind CSS 4, custom MTPS theme |
| **Animations** | Framer Motion |
| **Charts** | Chart.js + react-chartjs-2 |
| **UI Primitives** | Radix UI, Lucide Icons |
| **Routing** | React Router v7 |
| **Testing** | Vitest, Testing Library |
| **Backend** | Cloudflare Workers (edge serverless) |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

### Setup

```bash
# Clone the repository
git clone https://github.com/LordEasSan/tarot-webapp.git
cd tarot-webapp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173/tarot-webapp/](http://localhost:5173/tarot-webapp/) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Run tests in watch mode |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `/api` (relative) |

### GitHub Secrets (for CI/CD)

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

To add secrets:
1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add each secret with the appropriate value

---

## 🔧 Backend API (Cloudflare Workers)

The serverless API runs on Cloudflare's edge network for low-latency responses globally.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/generate` | Generate parameterised deck & spread |
| `POST` | `/api/verify` | Run LTL model checking on a reading |
| `GET` | `/api/archetypes` | Get predefined archetype families |
| `POST` | `/api/readings` | Generate narrative reading |
| `GET` | `/api/health` | Health check |

### Local Worker Development

```bash
cd cloudflare-worker
npx wrangler dev
```

### Deploy Worker

```bash
cd cloudflare-worker
npx wrangler deploy
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

Tests are written with **Vitest** and **Testing Library**. Test files are located in `src/test/`.

---

## 📦 Deployment

### Frontend (GitHub Pages)

The frontend is automatically deployed to GitHub Pages on every push to `main` via the `deploy.yml` workflow.

**URL:** `https://lordeassan.github.io/tarot-webapp/`

### Backend (Cloudflare Workers)

The Cloudflare Worker is deployed automatically on push to `main` using the official `cloudflare/wrangler-action@v3`.

### Preview Environments

Pull requests automatically trigger a preview build. The build artifact is available for review in the Actions tab.

---

## 🎨 Theme & Design

The UI uses a custom MTPS theme with:

- **Dark mode** (default): Deep purple/void background with gold accents
- **Light mode**: Soft pearl/lavender with purple accents
- **Typography**: Cinzel (display/headings) + Inter (body)
- **Animations**: Smooth card flips, floating effects, glassmorphism
- **Mobile-first**: Fully responsive design

Toggle between themes using the sun/moon button in the header.

---

## 🧠 Formal Foundation

The MTPS defines a tarot deck as a parameterised structure:

```
D(θ) = ⟨ C, Σ, μ, ρ, A ⟩  where θ ∈ Θ
```

- **C** — set of cards
- **Σ** — suits partition
- **μ** — meaning function (weighted across 5 dimensions)
- **ρ** — spread layout function
- **A** — archetype mapping

Every reading undergoes LTL verification:

| Class | Formula | Description |
|-------|---------|-------------|
| Safety | G(φ) | Invariants that always hold |
| Co-safety | F(φ) | Properties eventually achieved |
| Liveness | GF(φ) | Recurring progress |
| Co-liveness | FG(φ) | Eventual stability |

---

## 📋 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request using the PR template

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## � API Token & Security

MTPS uses the **GitHub Models** inference API for AI-powered narrative generation.
Each user provides their own token via the in-app settings modal.

### How it works

1. Click the **Key** icon in the header (or the banner) to open the token modal.
2. Enter a GitHub Personal Access Token (`ghp_…` or `github_pat_…`).
3. The token is saved in your browser's `localStorage` (`mtps_user_token`).
4. It is **only** transmitted to `https://models.inference.ai.azure.com` — the GitHub Models endpoint.

### Security guarantees

- **No server** — this is a fully static site; your token never leaves your browser except to the GitHub API.
- **Not in source code** — no tokens are embedded in the build.
- **Not logged** — the token is never printed to the console.
- **No source maps** — production builds have source maps disabled.
- **LocalStorage only** — clear it anytime via the modal or your browser settings.

### Recommended token scope

Create a **fine-grained personal access token** with the minimum scope required
for GitHub Models. See [GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for details.

---

## 🚀 Deployment (GitHub Pages)

The app is deployed to GitHub Pages at:
**https://lordeassan.github.io/tarological-system/**

### Deploy steps

```bash
# 1. Install gh-pages if not already present
npm install --save-dev gh-pages

# 2. Build + deploy
npm run deploy
```

This runs `npm run build` (which includes `tsc -b && vite build`) then pushes the
`dist/` folder to the `gh-pages` branch.

### GitHub Pages configuration

1. Go to **Settings → Pages** in the repository.
2. Set **Source** to "Deploy from a branch".
3. Set **Branch** to `gh-pages` / `/ (root)`.
4. The site will be available at `https://lordeassan.github.io/tarological-system/`.

### SPA routing

A `404.html` (copy of `index.html`) is automatically generated during build
so that GitHub Pages routes all paths back to the SPA entry point.

### Linking from the main site

In the `lordeassan.github.io` repository, add a link:

```html
<a href="/tarological-system/">MTPS — Tarological System</a>
```

---

## �📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <em>Where ancient symbolism meets mathematical rigour.</em><br/>
  Built with ❤️ by <a href="https://lordeassan.github.io">LordEasSan</a>
</p>
