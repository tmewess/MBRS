import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
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

if (!process.env["REPLIT_DEV_DOMAIN"]) {
  const distBase = path.join(__dirname, "..", "..");

  const tgShopDist = path.join(distBase, "tg-shop", "dist", "public");
  const adminPanelDist = path.join(distBase, "admin-panel", "dist", "public");

  if (fs.existsSync(tgShopDist)) {
    app.use("/tg-shop", express.static(tgShopDist));
    app.get("/tg-shop/*path", (_req, res) => {
      res.sendFile(path.join(tgShopDist, "index.html"));
    });
    logger.info({ tgShopDist }, "Serving tg-shop static files");
  } else {
    logger.warn({ tgShopDist }, "tg-shop dist not found — run build first");
  }

  if (fs.existsSync(adminPanelDist)) {
    app.use("/admin-panel", express.static(adminPanelDist));
    app.get("/admin-panel/*path", (_req, res) => {
      res.sendFile(path.join(adminPanelDist, "index.html"));
    });
    logger.info({ adminPanelDist }, "Serving admin-panel static files");
  } else {
    logger.warn({ adminPanelDist }, "admin-panel dist not found — run build first");
  }
}

export default app;
