type NodeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

export default function handler(_req: unknown, res: NodeResponse) {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  res.statusCode = databaseConfigured ? 200 : 503;
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      status: databaseConfigured ? "ok" : "degraded",
      databaseConfigured,
    }),
  );
}
