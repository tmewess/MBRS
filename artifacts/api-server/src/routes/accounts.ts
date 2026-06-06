import { Router } from "express";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { db, accountsTable, telegramSessionsTable, botSettingsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { fetchLolzConfirmCode } from "./lolz";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("Only .zip files allowed"));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 },
});

router.get("/accounts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(accountsTable).orderBy(accountsTable.createdAt);
  res.json(rows);
});

router.get("/accounts/available", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.status, "available"))
    .orderBy(accountsTable.createdAt);
  res.json(rows);
});

router.get("/accounts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, id));
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(account);
});

router.post("/accounts/upload", upload.single("file"), async (req, res): Promise<void> => {
  const filePath = req.file?.path ?? null;
  const fileName = req.file?.originalname ?? null;

  const phone = req.body.phone as string | undefined;
  const country = req.body.country as string | undefined;
  const phonePrefix = req.body.phonePrefix as string | undefined;
  const dcId = req.body.dcId as string | undefined;
  const userId = req.body.userId as string | undefined;
  const authKey = req.body.authKey as string | undefined;
  const price = req.body.price ? parseFloat(req.body.price as string) : 0;
  const isFree = req.body.isFree as string | undefined;
  const hasPremium = req.body.hasPremium === "true";
  const hasPassword = req.body.hasPassword === "true";
  const password = req.body.password as string | undefined;
  const spamBlock = req.body.spamBlock as string | undefined;
  const registrationDate = req.body.registrationDate as string | undefined;
  const origin = req.body.origin as string | undefined;
  const lastActivity = req.body.lastActivity as string | undefined;
  const description = req.body.description as string | undefined;

  const [account] = await db
    .insert(accountsTable)
    .values({
      phone: phone ?? null,
      country: country ?? "",
      phonePrefix: phonePrefix ?? null,
      dcId: dcId ?? null,
      userId: userId ?? null,
      authKey: authKey ?? null,
      price,
      isFree: isFree ?? "false",
      hasPremium,
      hasPassword,
      password: password ?? null,
      spamBlock: spamBlock ?? null,
      registrationDate: registrationDate ?? null,
      origin: origin ?? null,
      lastActivity: lastActivity ?? null,
      description: description ?? null,
      filePath: filePath ?? null,
      fileName: fileName ?? null,
    })
    .returning();

  res.json(account);
});

router.patch("/accounts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = req.body as Partial<Record<string, unknown>>;
  const [account] = await db
    .update(accountsTable)
    .set(body)
    .where(eq(accountsTable.id, id))
    .returning();
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(account);
});

router.get("/accounts/:id/session-code", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, id));
  if (!account) { res.status(404).json({ error: "Account not found" }); return; }
  if (!account.sessionId) {
    if (account.lolzItemId) {
      const [settings] = await db.select().from(botSettingsTable).limit(1);
      const lolzApiKey = settings?.lolzApiKey ?? null;
      if (!lolzApiKey) {
        res.status(503).json({ success: false, error: "API ключ LolzTeam не настроен в Настройках" });
        return;
      }
      try {
        const result = await fetchLolzConfirmCode(Number(account.lolzItemId), lolzApiKey);
        if (result.success && result.code) {
          res.json({ success: true, codes: [{ code: result.code, date: new Date().toISOString() }] });
        } else {
          res.json({ success: false, error: result.error ?? "Код не найден в LolzTeam" });
        }
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message ?? "Ошибка запроса к LolzTeam" });
      }
      return;
    }
    res.status(400).json({ success: false, error: "У этого аккаунта нет привязанной сессии" });
    return;
  }

  const [session] = await db.select().from(telegramSessionsTable).where(eq(telegramSessionsTable.id, account.sessionId));
  if (!session?.sessionString) { res.status(400).json({ success: false, error: "Эта сессия не поддерживает получение кодов (tdata-сессия). Добавьте аккаунт через авторизацию: Сессии → Добавить сессию → номер телефона + код." }); return; }

  const [settings] = await db.select().from(botSettingsTable).limit(1);
  const apiId = settings?.tgApiId ? parseInt(settings.tgApiId, 10) : null;
  const apiHash = settings?.tgApiHash ?? null;
  if (!apiId || !apiHash) { res.status(503).json({ success: false, error: "API ID/Hash не настроены в Настройках" }); return; }

  let client: TelegramClient | null = null;
  try {
    client = new TelegramClient(new StringSession(session.sessionString), apiId, apiHash, { connectionRetries: 2 });
    await client.connect();
    const messages = await client.getMessages(777000, { limit: 20 }) as any[];
    await client.disconnect();

    const codes: Array<{ code: string; date: string }> = [];
    for (const msg of messages) {
      if (codes.length >= 3) break;
      const text: string = msg?.message ?? "";
      const match = text.match(/\b(\d{5,6})\b/);
      if (match) {
        const msgDate = msg?.date ? new Date(msg.date * 1000).toISOString() : new Date().toISOString();
        codes.push({ code: match[1], date: msgDate });
      }
    }

    if (codes.length > 0) {
      res.json({ success: true, codes });
    } else {
      res.json({ success: false, error: "Код не найден. Возможные причины: 1) Telegram отправил код по SMS — введите его вручную. 2) Войдите в аккаунт с нового устройства — код появится здесь автоматически." });
    }
  } catch (err: any) {
    await client?.disconnect().catch(() => {});
    logger.error({ err }, "account session-code failed");
    res.status(500).json({ success: false, error: err?.errorMessage ?? err?.message ?? "Ошибка при получении кода" });
  }
});

router.delete("/accounts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [account] = await db.delete(accountsTable).where(eq(accountsTable.id, id)).returning();
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  if (account.filePath && fs.existsSync(account.filePath)) {
    fs.unlinkSync(account.filePath);
  }
  res.json({ success: true });
});

// Called when validation fails during purchase — marks account as unavailable
router.post("/accounts/:id/remove", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.update(accountsTable)
      .set({ status: "unavailable" })
      .where(eq(accountsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to remove invalid account");
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
