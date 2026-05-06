# Naan & Curry – Order List Organizer

Paste a chef's raw order list and it automatically organizes items by store layout (Restaurant Depot, Indian Store, Main Kitchen, Disposables).

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Deploy — Railway auto-detects Node.js and runs `npm start`

## Run Locally

```bash
npm install
ANTHROPIC_API_KEY=your_key_here node server.js
```

Then open http://localhost:3000
