import app from "../artifacts/api-server/src/app.js";

type RequestLike = {
  url?: string;
};

type ResponseLike = object;

type ExpressHandler = (req: RequestLike, res: ResponseLike) => unknown;

export default function handler(req: RequestLike, res: ResponseLike) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url === "/" ? "" : req.url);
  }

  return (app as unknown as ExpressHandler)(req, res);
}
