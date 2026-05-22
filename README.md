# GCP Cost Monitor — Envaedha

AI-powered GCP cost monitoring and optimisation dashboard. Analyses Cloud Run, Cloud Storage, and BigQuery usage data using Claude to generate prioritised cost-saving recommendations.

## Quick Start

### 1. Clone and install
```bash
git clone <your-repo>
cd gcp-cost-monitor
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### 3. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Use the dashboard
- Dashboard loads with mock GCP data by default
- Click **Run AI analysis** to call Claude and get recommendations
- Click any recommendation card to expand the action details

---

## Project Structure

```
gcp-cost-monitor/
├── data/
│   └── mock/
│       └── gcp-data.ts          # Mock GCP data (swap for real API in Phase 2)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── recommendations/
│   │   │       └── route.ts     # Claude API integration
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard page
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Redirects to /dashboard
│   │   └── globals.css
│   ├── components/
│   │   └── DashboardClient.tsx  # Main UI component
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── .env.example
└── README.md
```

---

## Phase 2 — Connecting Real GCP APIs

Replace the mock data import in `src/app/api/recommendations/route.ts`:

```ts
// Phase 1 (current)
const gcpData = mockGCPData

// Phase 2 — replace with:
const gcpData = await fetchRealGCPData(process.env.GCP_PROJECT_ID!)
```

### Required GCP APIs to enable
- **Cloud Billing API** — cost data by service/SKU
- **Cloud Run Admin API** — list services, revisions, traffic
- **Cloud Storage JSON API** — bucket metadata, object counts
- **BigQuery API** — dataset/table metadata, job history

### Required IAM permissions for service account
- `billing.accounts.getSpendingInformation`
- `run.services.list`, `run.revisions.list`
- `storage.buckets.list`, `storage.objects.list`
- `bigquery.datasets.get`, `bigquery.jobs.list`

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# ANTHROPIC_API_KEY = sk-ant-...
```

---

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** — charts
- **Anthropic Claude SDK** — AI recommendations
- **Lucide React** — icons
