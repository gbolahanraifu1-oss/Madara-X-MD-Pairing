type NodeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

function hasDatabaseConfigured(): boolean {
  const runtime = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return Boolean(runtime.process?.env?.DATABASE_URL);
}

export default function handler(_req: unknown, res: NodeResponse) {
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
