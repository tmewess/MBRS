import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, otherAccountsTable, ordersTable, userBalancesTable } from "@workspace/db";

const router = Router();

router.get("/other-accounts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(otherAccountsTable).orderBy(otherAccountsTable.createdAt);
  res.json(rows);
});

router.get("/other-accounts/available", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(otherAccountsTable)
    .where(eq(otherAccountsTable.status, "available"))
    .orderBy(otherAccountsTable.createdAt);
  res.json(rows);
});

router.get("/other-accounts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [account] = await db.select().from(otherAccountsTable).where(eq(otherAccountsTable.id, id));
  if (!account) { res.status(404).json({ error: "Not found" }); return; }
  res.json(account);
});

router.post("/other-accounts", async (req, res): Promise<void> => {
  const body = req.body as {
    service?: string;
    login?: string;
    password?: string;
    email?: string;
    emailPassword?: string;
    description?: string;
    preDescription?: string;
    price?: number;
    isFree?: string;
  };

  if (!body.service || !body.login || !body.password) {
    res.status(400).json({ error: "service, login and password are required" });
    return;
  }

  const [account] = await db.insert(otherAccountsTable).values({
    service: body.service,
    login: body.login,
    password: body.password,
    email: body.email ?? null,
    emailPassword: body.emailPassword ?? null,
    description: body.description ?? null,
    preDescription: body.preDescription ?? null,
    price: body.isFree === "true" ? 0 : (body.price ?? 0),
    isFree: body.isFree ?? "false",
    status: "available",
  }).returning();

  res.json(account);
});

router.patch("/other-accounts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = req.body as Partial<Record<string, unknown>>;
  const [account] = await db.update(otherAccountsTable).set(body).where(eq(otherAccountsTable.id, id)).returning();
  if (!account) { res.status(404).json({ error: "Not found" }); return; }
  res.json(account);
});

router.delete("/other-accounts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [account] = await db.delete(otherAccountsTable).where(eq(otherAccountsTable.id, id)).returning();
  if (!account) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ success: true });
});

router.post("/other-accounts/purchase", async (req, res): Promise<void> => {
  const { telegramUserId, telegramUsername, accountId } = req.body as {
    telegramUserId?: string;
    telegramUsername?: string;
    accountId?: number;
  };

  if (!telegramUserId || !accountId) {
    res.status(400).json({ error: "telegramUserId and accountId required" });
    return;
  }

  const [account] = await db.select().from(otherAccountsTable).where(eq(otherAccountsTable.id, accountId));
  if (!account || account.status !== "available") {
    res.status(400).json({ error: "Account not available" });
    return;
  }

  const isFree = account.isFree === "true" || account.price === 0;

  if (!isFree) {
    const [balance] = await db.select().from(userBalancesTable).where(eq(userBalancesTable.telegramUserId, telegramUserId));
    const currentBalance = balance?.balance ?? 0;
    if (currentBalance < account.price) {
      res.status(400).json({ error: "Insufficient balance", required: account.price, current: currentBalance });
      return;
    }
    await db
      .update(userBalancesTable)
      .set({ balance: currentBalance - account.price, updatedAt: new Date() })
      .where(eq(userBalancesTable.telegramUserId, telegramUserId));
  }

  const [order] = await db.insert(ordersTable).values({
    telegramUserId,
    telegramUsername: telegramUsername ?? null,
    accountId: null,
    otherAccountId: account.id,
    status: "paid",
    paymentMethod: isFree ? "free" : "balance",
    amount: isFree ? 0 : account.price,
  }).returning();

  await db.update(otherAccountsTable).set({ status: "sold", soldAt: new Date() }).where(eq(otherAccountsTable.id, accountId));
  await db.update(ordersTable).set({ status: "delivered", deliveredAt: new Date() }).where(eq(ordersTable.id, order.id));

  res.json({ success: true, orderId: order.id, account });
});

export default router;
