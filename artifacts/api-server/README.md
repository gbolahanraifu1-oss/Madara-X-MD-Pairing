# ᴍᴀᴅᴀʀᴀ x-ᴍᴅ API

This package can be deployed as a separate Vercel serverless API project.

## Vercel project settings

Create a new Vercel project from the same repository and set its **Root Directory** to:

```text
artifacts/api-server
```

The included `vercel.json` installs the workspace dependencies from the repository root, builds the API package, and routes `/api/*` requests to the Express serverless function.

Required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — a long random session secret
- `NODE_ENV=production`

The public API URL will be:

```text
https://your-api-project.vercel.app/api
```

## Frontend connection

In the separate frontend Vercel project, set:

```text
VITE_API_URL=https://your-api-project.vercel.app
```

The frontend keeps using the `/api/...` route paths and the client prepends this origin automatically. CORS is enabled by the API server for cross-origin frontend requests.

## Serverless behavior

Vercel Functions are request-based and do not keep a process alive between requests. Persistent data belongs in PostgreSQL. The demo pairing transition is therefore evaluated during status polling instead of relying on a background timer.

If the WhatsApp bot itself needs a continuously running connection, host that worker on an always-on VM or bot host and keep this API as the control plane.