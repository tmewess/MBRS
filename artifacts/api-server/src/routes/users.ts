import { Router } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, userBalancesTable, ordersTable } from "@workspace/db";

const router = Router();

router.get("/users", async (_req, res): Promise<void> => {
  const [balances, orders] = await Promise.all([
    db.select().from(userBalancesTable).orderBy(desc(userBalancesTable.updatedAt)),
    db.select({ telegramUserId: ordersTable.telegramUserId }).from(ordersTable),
  ]);

  const userMap = new Map<string, { balance: number; updatedAt: Date | null; orderCount: number }>();

  for (const b of balances) {
    userMap.set(b.telegramUserId, { balance: b.balance, updatedAt: b.updatedAt, orderCount: 0 });
  }

  for (const o of orders) {
    const uid = o.telegramUserId;
    if (userMap.has(uid)) {
      userMap.get(uid)!.orderCount += 1;
    } else {
      userMap.set(uid, { balance: 0, updatedAt: null, orderCount: 1 });
    }
  }

  const result = Array.from(userMap.entries()).map(([telegramUserId, data]) => ({
    telegramUserId,
    balance: data.balance,
    updatedAt: data.updatedAt,
    orderCount: data.orderCount,
  }));

  res.json(result);
});

router.post("/users/:id/balance", async (req, res): Promise<void> => {
  const telegramUserId = req.params.id;
  const { amount } = req.body as { amount?: number };

  if (amount === undefined || amount === 0) {
    res.status(400).json({ error: "Amount required" });
    return;
  }

  const [existing] = await db
    .select()
    .from(userBalancesTable)
    .where(eq(userBalancesTable.telegramUserId, telegramUserId));

  if (existing) {
    const newBalance = existing.balance + amount;
    if (newBalance < 0) {
      res.status(400).json({ error: "Balance cannot be negative", current: existing.balance });
      return;
    }
    await db
      .update(userBalancesTable)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(userBalancesTable.telegramUserId, telegramUserId));
    res.json({ success: true, balance: newBalance, telegramUserId });
  } else {
    if (amount < 0) {
      res.status(400).json({ error: "User has no balance to remove from" });
      return;
    }
    const [row] = await db
      .insert(userBalancesTable)
      .values({ telegramUserId, balance: amount })
      .returning();
    res.json({ success: true, balance: row.balance, telegramUserId });
  }
});

export default router;
