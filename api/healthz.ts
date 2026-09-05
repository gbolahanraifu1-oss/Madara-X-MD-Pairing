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

export default async function handler(_req: unknown, res: NodeResponse) {
  if (!hasDatabaseConfigured()) {
    res.statusCode = 503;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ status: "degraded", databaseConfigured: false }));
    return;
  }

  try {
    const { pool } = await import("../artifacts/api-server/src/lib/db.js");
    const result = await pool.query<{
      users_table: string | null;
      sessions_table: string | null;
    }>(
      "select to_regclass('public.users') as users_table, to_regclass('public.sessions') as sessions_table",
    );
    const row = result.rows[0];
    const missingTables = [
      row?.users_table ? null : "users",
      row?.sessions_table ? null : "sessions",
    ].filter((table): table is string => table !== null);

    res.statusCode = missingTables.length === 0 ? 200 : 503;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        status: missingTables.length === 0 ? "ok" : "degraded",
        databaseConfigured: true,
        databaseReachable: true,
        missingTables,
      }),
    );
  } catch (error) {
    console.error(
      "Database health check failed",
      error instanceof Error ? error.message : "unknown database error",
    );
    res.statusCode = 503;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        status: "degraded",
        databaseConfigured: true,
        databaseReachable: false,
      }),
    );
  }
}
