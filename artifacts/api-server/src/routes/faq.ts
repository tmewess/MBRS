import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// Ensure faq_items table exists
async function ensureFaqTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "faq_items" (
        "id" serial PRIMARY KEY,
        "question" text NOT NULL,
        "answer" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
  } catch (err) {
    logger.error({ err }, "Failed to create faq_items table");
  }
}

ensureFaqTable();

router.get("/faq", async (_req, res): Promise<void> => {
  try {
    const rows = await db.execute(sql`SELECT * FROM faq_items WHERE is_active = true ORDER BY sort_order ASC, created_at ASC`);
    res.json(rows.rows);
  } catch (err) {
    logger.error({ err }, "Failed to list FAQ items");
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/faq/all", async (_req, res): Promise<void> => {
  try {
    const rows = await db.execute(sql`SELECT * FROM faq_items ORDER BY sort_order ASC, created_at ASC`);
    res.json(rows.rows);
  } catch (err) {
    logger.error({ err }, "Failed to list all FAQ items");
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/faq", async (req, res): Promise<void> => {
  const { question, answer, sortOrder } = req.body as { question?: string; answer?: string; sortOrder?: number };
  if (!question || !answer) {
    res.status(400).json({ error: "question и answer обязательны" });
    return;
  }
  try {
    const rows = await db.execute(sql`
      INSERT INTO faq_items (question, answer, sort_order) VALUES (${question}, ${answer}, ${sortOrder ?? 0}) RETURNING *
    `);
    res.json({ success: true, item: rows.rows[0] });
  } catch (err) {
    logger.error({ err }, "Failed to create FAQ item");
    res.status(500).json({ error: "DB error" });
  }
});

router.patch("/faq/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { question, answer, sortOrder, isActive } = req.body as { question?: string; answer?: string; sortOrder?: number; isActive?: boolean };
  try {
    const rows = await db.execute(sql`
      UPDATE faq_items SET
        question = COALESCE(${question ?? null}, question),
        answer = COALESCE(${answer ?? null}, answer),
        sort_order = COALESCE(${sortOrder ?? null}, sort_order),
        is_active = COALESCE(${isActive ?? null}, is_active)
      WHERE id = ${id} RETURNING *
    `);
    if (!rows.rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true, item: rows.rows[0] });
  } catch (err) {
    logger.error({ err }, "Failed to update FAQ item");
    res.status(500).json({ error: "DB error" });
  }
});

router.delete("/faq/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.execute(sql`DELETE FROM faq_items WHERE id = ${id}`);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete FAQ item");
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
