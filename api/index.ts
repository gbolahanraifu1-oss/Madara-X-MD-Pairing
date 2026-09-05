type RequestLike = {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

type ExpressHandler = (req: RequestLike, res: ResponseLike) => unknown;

function requestPath(req: RequestLike): string {
  const pathQuery = req.query?.path;
  const rewrittenPath = Array.isArray(pathQuery) ? pathQuery.join("/") : pathQuery;

  if (rewrittenPath) {
    return "/" + rewrittenPath.replace(/^\/+/, "");
  }

  const path = (req.url ?? "/").split("?", 1)[0];
  return path.startsWith("/api") ? path.slice("/api".length) || "/" : path;
}

function hasDatabaseConfigured(): boolean {
  const runtime = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return Boolean(runtime.process?.env?.DATABASE_URL);
}

function sendHealth(res: ResponseLike): void {
  const databaseConfigured = hasDatabaseConfigured();
  res.statusCode = databaseConfigured ? 200 : 503;
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      status: databaseConfigured ? "ok" : "degraded",
      databaseConfigured,
    }),
  );
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  const path = requestPath(req);

  if (path === "/healthz") {
    sendHealth(res);
    return;
  }

  const { default: app } = await import("../artifacts/api-server/src/app.js");
  req.url = "/api" + (path === "/" ? "" : path);

  return (app as unknown as ExpressHandler)(req, res);
}
