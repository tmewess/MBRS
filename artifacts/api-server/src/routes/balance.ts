import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, userBalancesTable, accountsTable, ordersTable } from "@workspace/db";

const router = Router();

const BOT_TOKEN = process.env["BOT_TOKEN"];

async function createTelegramInvoiceLink(params: {
  title: string;
  description: string;
  payload: string;
  currency: string;
  amount: number;
}) {
  if (!BOT_TOKEN) throw new Error("BOT_TOKEN not configured");
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`;
  const body = {
    title: params.title,
    description: params.description,
    payload: params.payload,
    provider_token: "",
    currency: params.currency,
    prices: [{ label: "Stars", amount: params.amount }],
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json() as { ok: boolean; result?: string; description?: string };
  if (!data.ok) throw new Error(data.description ?? "Failed to create invoice link");
  return data.result!;
}

router.get("/balance/:userId", async (req, res): Promise<void> => {
  const userId = req.params.userId;
  const [row] = await db.select().from(userBalancesTable).where(eq(userBalancesTable.telegramUserId, userId));
  res.json({ balance: row?.balance ?? 0 });
});

router.post("/balance/topup", async (req, res): Promise<void> => {
  const { telegramUserId, amount } = req.body as { telegramUserId?: string; amount?: number };
  if (!telegramUserId || !amount || amount < 1) {
    res.status(400).json({ error: "Minimum topup is 1 Star" });
    return;
  }
  res.json({
    success: true,
    telegramUserId,
    amount,
    payload: JSON.stringify({ type: "balance_topup", telegramUserId, amount }),
  });
});

router.post("/balance/topup-invoice", async (req, res): Promise<void> => {
  const { telegramUserId, amount } = req.body as { telegramUserId?: string; amount?: number };
  if (!telegramUserId || !amount || amount < 1) {
    res.status(400).json({ error: "Minimum topup is 1 Star" });
    return;
  }
  try {
    const payload = JSON.stringify({ type: "balance_topup", telegramUserId, amount });
    const invoiceUrl = await createTelegramInvoiceLink({
      title: "Пополнение баланса",
      description: `Пополнение баланса на ${amount} Stars`,
      payload,
      currency: "XTR",
      amount,
    });
    res.json({ success: true, invoiceUrl, payload });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create invoice";
    res.status(503).json({ error: message });
  }
});

router.post("/balance/purchase", async (req, res): Promise<void> => {
  const { telegramUserId, telegramUsername, accountId } = req.body as {
    telegramUserId?: string;
    telegramUsername?: string;
    accountId?: number;
  };
  if (!telegramUserId || !accountId) {
    res.status(400).json({ error: "telegramUserId and accountId required" });
    return;
  }

  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, accountId));
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

    const newBalance = currentBalance - account.price;
    await db
      .update(userBalancesTable)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(userBalancesTable.telegramUserId, telegramUserId));
  }

  const [order] = await db.insert(ordersTable).values({
    telegramUserId,
    telegramUsername: telegramUsername ?? null,
    accountId: account.id,
    status: "paid",
    paymentMethod: isFree ? "free" : "balance",
    amount: isFree ? 0 : account.price,
  }).returning();

  await db.update(accountsTable).set({ status: "sold", soldAt: new Date() }).where(eq(accountsTable.id, accountId));
  await db.update(ordersTable).set({ status: "delivered", deliveredAt: new Date() }).where(eq(ordersTable.id, order.id));

  res.json({ success: true, orderId: order.id, account });
});

export default router;
