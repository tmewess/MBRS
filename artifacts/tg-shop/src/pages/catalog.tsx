import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { Plus, Star, Zap } from "lucide-react";
import { getTelegramUser } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { getSocialNetwork } from "@/lib/social-networks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Account {
  id: number;
  phone: string | null;
  country: string;
  phonePrefix: string | null;
  dcId: string | null;
  userId: string | null;
  authKey: string | null;
  status: string;
  price: number;
  isFree: string;
  hasPremium: boolean;
  filePath: string | null;
  fileName: string | null;
  createdAt: string;
  spamBlock: string | null;
  origin: string | null;
  lastActivity: string | null;
  registrationDate: string | null;
  description: string | null;
  lolzItemId: string | null;
  sessionId: number | null;
}

interface OtherProduct {
  id: number;
  socialNetwork: string;
  description: string | null;
  price: number;
  isFree: string;
  status: string;
  createdAt: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "Австралия": "🇦🇺", "Австрия": "🇦🇹", "Азербайджан": "🇦🇿",
  "Албания": "🇦🇱", "Алжир": "🇩🇿", "Ангола": "🇦🇴",
  "Андорра": "🇦🇩", "Антигуа и Барбуда": "🇦🇬", "Аргентина": "🇦🇷",
  "Армения": "🇦🇲", "Афганистан": "🇦🇫", "Багамы": "🇧🇸",
  "Бангладеш": "🇧🇩", "Барбадос": "🇧🇧", "Бахрейн": "🇧🇭",
  "Беларусь": "🇧🇾", "Белиз": "🇧🇿", "Бельгия": "🇧🇪",
  "Бенин": "🇧🇯", "Болгария": "🇧🇬", "Боливия": "🇧🇴",
  "Босния и Герцеговина": "🇧🇦", "Ботсвана": "🇧🇼", "Бразилия": "🇧🇷",
  "Бруней": "🇧🇳", "Буркина-Фасо": "🇧🇫", "Бурунди": "🇧🇮",
  "Бутан": "🇧🇹", "Великобритания": "🇬🇧", "Венгрия": "🇭🇺",
  "Венесуэла": "🇻🇪", "Вьетнам": "🇻🇳", "Германия": "🇩🇪",
  "Греция": "🇬🇷", "Грузия": "🇬🇪", "Дания": "🇩🇰",
  "Египет": "🇪🇬", "Израиль": "🇮🇱", "Индия": "🇮🇳",
  "Индонезия": "🇮🇩", "Иордания": "🇯🇴", "Ирак": "🇮🇶",
  "Иран": "🇮🇷", "Ирландия": "🇮🇪", "Испания": "🇪🇸",
  "Италия": "🇮🇹", "Казахстан": "🇰🇿", "Канада": "🇨🇦",
  "Китай": "🇨🇳", "Колумбия": "🇨🇴", "Кыргызстан": "🇰🇬",
  "Латвия": "🇱🇻", "Литва": "🇱🇹", "Мексика": "🇲🇽",
  "Молдова": "🇲🇩", "Монголия": "🇲🇳", "Нидерланды": "🇳🇱",
  "Норвегия": "🇳🇴", "ОАЭ": "🇦🇪", "Пакистан": "🇵🇰",
  "Польша": "🇵🇱", "Португалия": "🇵🇹", "Россия": "🇷🇺",
  "Румыния": "🇷🇴", "Саудовская Аравия": "🇸🇦", "Сербия": "🇷🇸",
  "Сингапур": "🇸🇬", "Словакия": "🇸🇰", "США": "🇺🇸",
  "Таджикистан": "🇹🇯", "Таиланд": "🇹🇭", "Турция": "🇹🇷",
  "Узбекистан": "🇺🇿", "Украина": "🇺🇦", "Финляндия": "🇫🇮",
  "Франция": "🇫🇷", "Чехия": "🇨🇿", "Швейцария": "🇨🇭",
  "Швеция": "🇸🇪", "Япония": "🇯🇵", "Южная Корея": "🇰🇷",
  "Другая": "🌍",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || "🌍";
}

function getIdDigitLabel(userId: string | null): string | null {
  if (!userId) return null;
  const digits = userId.replace(/\D/g, "").length;
  if (!digits) return null;
  return `${digits}ID`;
}

function AccountSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl p-4 overflow-hidden relative animate-fade-in"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid rgba(168,85,247,0.1)",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <div className="shimmer-card absolute inset-0 rounded-2xl overflow-hidden" />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-5 rounded-md bg-muted/50" />
            <div className="h-4 w-28 rounded-lg bg-muted/50" />
          </div>
          <div className="h-3 w-36 rounded-md bg-muted/35" />
          <div className="h-5 w-14 rounded-full bg-muted/35" />
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <div className="h-5 w-14 rounded-md bg-muted/50" />
          <div className="h-8 w-20 rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [otherProducts, setOtherProducts] = useState<OtherProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<"telegram" | "other">("telegram");
  const user = getTelegramUser();
  const { toast } = useToast();

  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("100");

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts/available").then(r => r.json()),
      fetch("/api/other-products/available").then(r => r.json()),
    ]).then(([accs, others]) => {
      setAccounts(Array.isArray(accs) ? accs : []);
      setOtherProducts(Array.isArray(others) ? others : []);
      setIsLoading(false);
    });

    if (user) {
      fetch(`/api/balance/${user.id}`)
        .then(r => r.json())
        .then(data => setBalance(data.balance ?? 0));
    }
  }, [user]);

  const handleTopup = async () => {
    if (!user) {
      toast({ title: "Ошибка", description: "Откройте в Telegram", variant: "destructive" });
      return;
    }
    const amount = parseInt(topupAmount, 10);
    if (isNaN(amount) || amount < 1) {
      toast({ title: "Ошибка", description: "Минимальное пополнение -- 1 Star", variant: "destructive" });
      return;
    }
    const tg = (window as any).Telegram?.WebApp;
    try {
      const res = await fetch("/api/balance/topup-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramUserId: String(user.id), amount }),
      });
      const data = await res.json();
      if (data.success && data.invoiceUrl) {
        setIsTopupOpen(false);
        if (tg?.openInvoice) {
          tg.openInvoice(data.invoiceUrl, (status: string) => {
            if (status === "paid") {
              toast({ title: "Успешно", description: "Баланс пополнен" });
              fetch(`/api/balance/${user.id}`)
                .then(r => r.json())
                .then(data => setBalance(data.balance ?? 0));
            } else if (status === "cancelled") {
              toast({ title: "Отменено", description: "Платёж отменён" });
            }
          });
        } else {
          window.open(data.invoiceUrl, "_blank");
        }
      } else {
        toast({ title: "Пополнение", description: data.error ?? "Ошибка создания инвойса", variant: "destructive" });
      }
    } catch {
      toast({ title: "Пополнение", description: "Используйте команду /topup в боте", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="p-4 space-y-4 pb-6">

        {/* Header row */}
        <div className="flex items-center justify-between animate-fade-in-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Каталог</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Все товары магазина</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold"
              style={{
                background: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(168,85,247,0.10))",
                border: "1px solid rgba(168,85,247,0.25)",
              }}
            >
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>{balance.toFixed(0)}</span>
            </div>
            <button
              onClick={() => setIsTopupOpen(true)}
              className="flex items-center justify-center rounded-xl w-8 h-8 transition-all active:scale-90"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                boxShadow: "0 2px 12px rgba(124,58,237,0.35)",
              }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}
        >
          <button
            onClick={() => setActiveTab("telegram")}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all"
            style={{
              background: activeTab === "telegram" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
              color: activeTab === "telegram" ? "white" : undefined,
              boxShadow: activeTab === "telegram" ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
            }}
          >
            ✈️ Telegram
            {accounts.length > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: activeTab === "telegram" ? "rgba(255,255,255,0.25)" : "rgba(168,85,247,0.2)",
                }}
              >
                {accounts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("other")}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all"
            style={{
              background: activeTab === "other" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
              color: activeTab === "other" ? "white" : undefined,
              boxShadow: activeTab === "other" ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
            }}
          >
            🌐 Прочие
            {otherProducts.length > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: activeTab === "other" ? "rgba(255,255,255,0.25)" : "rgba(168,85,247,0.2)",
                }}
              >
                {otherProducts.length}
              </span>
            )}
          </button>
        </div>

        {/* Lists */}
        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <AccountSkeleton key={i} index={i} />)
          ) : activeTab === "telegram" ? (
            accounts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-medium">Аккаунтов пока нет</p>
                <p className="text-xs mt-1 opacity-60">Загляните позже</p>
              </div>
            ) : (
              accounts.map((acc, i) => {
                const isFree = acc.isFree === "true" || acc.price === 0;
                const hasAutoDelivery = !!(acc.lolzItemId || acc.sessionId);
                const idLabel = getIdDigitLabel(acc.userId);
                return (
                  <Link key={acc.id} href={`/account/${acc.id}`} className="block">
                    <div
                      className="card-press rounded-2xl p-4 transition-all duration-200"
                      style={{
                        background: "hsl(var(--card))",
                        border: "1px solid rgba(168,85,247,0.12)",
                        animationDelay: `${i * 0.04}s`,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(168,85,247,0.3)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(124,58,237,0.12)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(168,85,247,0.12)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{ background: "rgba(168,85,247,0.08)" }}
                          >
                            {getFlag(acc.country)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            {acc.description ? (
                              <p className="text-sm font-semibold truncate">{acc.description}</p>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-sm truncate">{acc.country || "Неизвестно"}</span>
                                {acc.hasPremium && <span className="badge-premium flex-shrink-0">Premium</span>}
                                {isFree && <span className="badge-free flex-shrink-0">Free</span>}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {acc.description && <span className="text-[11px] text-muted-foreground">{acc.country || "Неизвестно"}</span>}
                              {acc.phonePrefix && <span className="text-[11px] text-muted-foreground font-mono">{acc.phonePrefix}****</span>}
                              {acc.dcId && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "rgba(168,85,247,0.1)", color: "hsl(262 83% 70%)" }}>
                                  DC {acc.dcId}
                                </span>
                              )}
                              {idLabel && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "hsl(239 84% 70%)" }}>
                                  {idLabel}
                                </span>
                              )}
                              {hasAutoDelivery && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "hsl(160 84% 39%)" }}>
                                  авто-выдача
                                </span>
                              )}
                            </div>
                            {acc.description && (acc.hasPremium || isFree) && (
                              <div className="flex items-center gap-1.5">
                                {acc.hasPremium && <span className="badge-premium flex-shrink-0">Premium</span>}
                                {isFree && <span className="badge-free flex-shrink-0">Free</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="font-bold text-sm">
                            {isFree ? (
                              <span className="text-emerald-400">Бесплатно</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span>{acc.price}</span>
                              </span>
                            )}
                          </div>
                          <div
                            className="text-[11px] font-bold text-white px-3 py-1.5 rounded-xl flex items-center gap-1"
                            style={{
                              background: isFree ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                              boxShadow: isFree ? "0 2px 8px rgba(5,150,105,0.3)" : "0 2px 8px rgba(124,58,237,0.3)",
                            }}
                          >
                            {!isFree && <Zap className="w-3 h-3" />}
                            {isFree ? "Получить" : "Купить"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )
          ) : (
            // Other products tab
            otherProducts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-medium">Товаров пока нет</p>
                <p className="text-xs mt-1 opacity-60">Загляните позже</p>
              </div>
            ) : (
              otherProducts.map((product, i) => {
                const isFree = product.isFree === "true" || product.price === 0;
                const sn = getSocialNetwork(product.socialNetwork);
                return (
                  <Link key={product.id} href={`/other/${product.id}`} className="block">
                    <div
                      className="card-press rounded-2xl p-4 transition-all duration-200"
                      style={{
                        background: "hsl(var(--card))",
                        border: "1px solid rgba(168,85,247,0.12)",
                        animationDelay: `${i * 0.04}s`,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(168,85,247,0.3)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(124,58,237,0.12)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(168,85,247,0.12)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{ background: "rgba(168,85,247,0.08)" }}
                          >
                            {sn.emoji}
                          </div>
                          <div className="min-w-0 space-y-1">
                            {product.description ? (
                              <p className="text-sm font-semibold truncate">{product.description}</p>
                            ) : (
                              <p className="text-sm font-semibold">{sn.name}</p>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-muted-foreground">{sn.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="font-bold text-sm">
                            {isFree ? (
                              <span className="text-emerald-400">Бесплатно</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span>{product.price}</span>
                              </span>
                            )}
                          </div>
                          <div
                            className="text-[11px] font-bold text-white px-3 py-1.5 rounded-xl flex items-center gap-1"
                            style={{
                              background: isFree ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                              boxShadow: isFree ? "0 2px 8px rgba(5,150,105,0.3)" : "0 2px 8px rgba(124,58,237,0.3)",
                            }}
                          >
                            {!isFree && <Zap className="w-3 h-3" />}
                            {isFree ? "Получить" : "Купить"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Topup Dialog */}
      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Пополнение баланса
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Сумма Stars (минимум 1)</Label>
              <Input
                type="number"
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                min={1}
                placeholder="100"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map(amt => (
                <button
                  key={amt}
                  className="rounded-xl py-2 text-xs font-semibold transition-all"
                  style={{
                    background: topupAmount === String(amt) ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(168,85,247,0.08)",
                    border: topupAmount === String(amt) ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(168,85,247,0.15)",
                    color: topupAmount === String(amt) ? "white" : undefined,
                  }}
                  onClick={() => setTopupAmount(String(amt))}
                >
                  {amt}
                </button>
              ))}
            </div>
            <button
              className="w-full rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
              }}
              onClick={handleTopup}
            >
              <Star className="w-4 h-4 fill-current" />
              Пополнить
            </button>
            <p className="text-xs text-muted-foreground text-center">
              После нажатия появится чек оплаты в Telegram
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
