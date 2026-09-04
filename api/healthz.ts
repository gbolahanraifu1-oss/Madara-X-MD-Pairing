type HealthResponse = {
  status: "ok" | "degraded";
  databaseConfigured: boolean;
};

type VercelRequest = {
  method?: string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: HealthResponse) => void;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({
      status: "degraded",
      databaseConfigured: Boolean(process.env.DATABASE_URL),
    });
    return;
  }

  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  res.status(databaseConfigured ? 200 : 503).json({
    status: databaseConfigured ? "ok" : "degraded",
    databaseConfigured,
  });
}
