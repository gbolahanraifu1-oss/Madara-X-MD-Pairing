import express from "express";
import cors from "cors";
import pinoHttpImport from "pino-http";
const pinoHttp = pinoHttpImport as unknown as (opts?: Record<string, unknown>) => any;
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: import("http").IncomingMessage) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: import("http").ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((error: unknown, _req: any, res: any, _next: any) => {
  logger.error(
    {
      err:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
    },
    "Unhandled API error",
  );

  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
