import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getTelegramUser } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Copy, Download, RotateCcw, ChevronDown, ChevronUp, ArrowLeft, ShoppingBag } from "lucide-react";
import { GetCodeModal } from "@/components/get-code-modal";

interface OrderWithAccount {
  id: number;
  telegramUserId: string;
  telegramUsername: string | null;
  accountId: number;
  status: string;
  paymentMethod: string;
  amount: number;
  createdAt: string;
  accountPhone: string | null;
  accountCountry: string | null;
  accountDcId: string | null;
  accountUserId: string | null;
  accountAuthKey: string | null;
  accountFilePath: string | null;
  accountLolzItemId: string | null;
  accountSessionId: number | null;
  accountHasPremium: boolean;
  accountDescription: string | null;
  accountPassword: string | null;
  accountHasPassword: boolean | null;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "США": "🇺🇸", "Россия": "🇷🇺", "Украина": "🇺🇦", "Казахстан": "🇰🇿",
  "Беларусь": "🇧🇾", "Польша": "🇵🇱", "Германия": "🇩🇪", "Франция": "🇫🇷",
  "Италия": "🇮🇹", "Турция": "🇹🇷", "Индия": "🇮🇳", "Китай": "🇨🇳",
  "Япония": "🇯🇵", "Бразилия": "🇧🇷", "Аргентина": "🇦🇷",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || "🌍";
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидание", paid: "Оплачен", delivered: "Доставлен",
  cancelled: "Отменён", refunded: "Возврат",
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  delivered: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  paid:      { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
  pending:   { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  cancelled: { bg: "rgba(239,68,68,0.12)",  color: "#f87171" },
  refunded:  { bg: "rgba(239,68,68,0.12)",  color: "#f87171" },
};

function DataRow({
  label, value, onCopy,
}: { label: string; value: string | null; onCopy?: () => void }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <div
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono truncate"
          style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.12)" }}
        >
          {value.length > 32 ? `${value.slice(0, 24)}...${value.slice(-8)}` : value}
        </div>
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
          >
            <Copy className="w-3.5 h-3.5" style={{ color: "hsl(262 83% 68%)" }} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const user = getTelegramUser();
  const telegramUserId = user?.id.toString() || "dev";
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithAccount | null>(null);
  const [showCopyDropdown, setShowCopyDropdown] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [orders, setOrders] = useState<OrderWithAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const userOrders = orders.filter((o) => o.telegramUserId === telegramUserId);

  const handleCopy = (text: string | null, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано", description: `${label} скопирован в буфер` });
  };

  const handleCopyAll = (order: OrderWithAccount) => {
    const parts: string[] = [];
    if (order.accountPhone) parts.push(`Номер: ${order.accountPhone}`);
    if (order.accountUserId) parts.push(`ID: ${order.accountUserId}`);
    if (order.accountAuthKey) parts.push(`Auth Key: ${order.accountAuthKey}`);
    if (order.accountDcId) parts.push(`DC: ${order.accountDcId}`);
    if (order.accountHasPassword && order.accountPassword) parts.push(`Пароль 2FA: ${order.accountPassword}`);
    navigator.clipboard.writeText(parts.join("\n"));
    toast({ title: "Скопировано", description: "Все данные аккаунта" });
  };

  const handleDownload = (accountId: number) => {
    window.open(`/api/accounts/download/${accountId}`, "_blank");
  };

  const handleResetSessions = async (order: OrderWithAccount) => {
    try {
      const res = await fetch(`/api/lolz/reset/${order.accountId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Успех", description: "Сессии сброшены" });
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось сбросить сессии", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет подключения к API", variant: "destructive" });
    }
  };

  // Full-screen detail view
  if (selectedOrder) {
    const order = selectedOrder;
    const hasApiIntegration = !!(order.accountLolzItemId) || !!(order.accountSessionId);
    const statusStyle = STATUS_STYLES[order.status] ?? { bg: "rgba(168,85,247,0.1)", color: "hsl(262 83% 68%)" };

    return (
      <>
        <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground">
          {/* Detail header */}
          <header className="sticky top-0 z-50 w-full">
            <div
              className="absolute inset-0 border-b"
              style={{
                background: "rgba(0,0,0,0.85)",
                borderColor: "rgba(168,85,247,0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            />
            <div className="relative flex h-14 items-center px-4 gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: "hsl(262 83% 68%)" }} />
              </button>
              <span className="font-bold tracking-tight text-base">Данные аккаунта</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
            {/* Account header */}
            <div
              className="rounded-2xl p-4 flex items-center gap-4 animate-fade-in"
              style={{
                background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08))",
                border: "1px solid rgba(168,85,247,0.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: "rgba(168,85,247,0.12)" }}
              >
                {getFlag(order.accountCountry || "")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{order.accountCountry || "Аккаунт Telegram"}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {order.accountHasPremium && (
                    <span className="badge-premium">Premium</span>
                  )}
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  {order.accountDcId && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg"
                      style={{ background: "rgba(168,85,247,0.1)", color: "hsl(262 83% 68%)" }}
                    >
                      DC {order.accountDcId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Login data */}
            <div
              className="rounded-2xl p-4 space-y-3 animate-fade-in-2"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(168,85,247,0.12)" }}
            >
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Данные для входа
              </div>

              <DataRow label="Номер телефона" value={order.accountPhone} onCopy={() => handleCopy(order.accountPhone, "Номер")} />
              <DataRow label="ID аккаунта" value={order.accountUserId} onCopy={() => handleCopy(order.accountUserId, "ID")} />
              <DataRow label="Auth Key" value={order.accountAuthKey} onCopy={() => handleCopy(order.accountAuthKey, "Auth Key")} />
              <DataRow label="DC" value={order.accountDcId} onCopy={() => handleCopy(order.accountDcId, "DC")} />
              {order.accountHasPassword && (
                <DataRow label="Пароль 2FA" value={order.accountPassword} onCopy={() => handleCopy(order.accountPassword, "Пароль")} />
              )}
              {order.accountDescription && (
                <div className="space-y-1">
                  <div className="text-[11px] text-muted-foreground font-medium">Описание</div>
                  <div
                    className="rounded-xl px-3 py-2.5 text-xs text-muted-foreground"
                    style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.12)" }}
                  >
                    {order.accountDescription}
                  </div>
                </div>
              )}

              {/* Copy dropdown */}
              <div className="relative pt-1">
                <button
                  className="w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "rgba(168,85,247,0.1)",
                    border: "1px solid rgba(168,85,247,0.2)",
                    color: "hsl(262 83% 70%)",
                  }}
                  onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Скопировать данные
                  {showCopyDropdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showCopyDropdown && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                    style={{ background: "hsl(var(--card))", border: "1px solid rgba(168,85,247,0.2)" }}
                  >
                    <button
                      className="w-full text-left text-xs px-4 py-3 font-medium transition-colors hover:bg-primary/5"
                      onClick={() => { handleCopyAll(order); setShowCopyDropdown(false); }}
                    >
                      Все данные
                    </button>
                    {order.accountPhone && (
                      <button
                        className="w-full text-left text-xs px-4 py-3 font-medium transition-colors hover:bg-primary/5 border-t border-border/30"
                        onClick={() => { handleCopy(order.accountPhone, "Номер"); setShowCopyDropdown(false); }}
                      >
                        Только номер
                      </button>
                    )}
                    {order.accountAuthKey && (
                      <button
                        className="w-full text-left text-xs px-4 py-3 font-medium transition-colors hover:bg-primary/5 border-t border-border/30"
                        onClick={() => { handleCopy(order.accountAuthKey, "Auth Key"); setShowCopyDropdown(false); }}
                      >
                        Только Auth Key
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Download */}
            {order.accountFilePath && (
              <div
                className="rounded-2xl p-4 animate-fade-in-3"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(168,85,247,0.12)" }}
              >
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Скачать</div>
                <button
                  onClick={() => handleDownload(order.accountId)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    boxShadow: "0 2px 12px rgba(124,58,237,0.3)",
                  }}
                >
                  <Download className="w-4 h-4" />
                  Скачать TData
                </button>
              </div>
            )}

            {/* Code & Reset */}
            {hasApiIntegration && (
              <div
                className="rounded-2xl p-4 animate-fade-in-4"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(168,85,247,0.12)" }}
              >
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Войти в аккаунт
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#059669,#10b981)",
                      boxShadow: "0 2px 12px rgba(5,150,105,0.3)",
                    }}
                    onClick={() => setShowCodeModal(true)}
                  >
                    Получить код
                  </button>
                  <button
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{
                      background: "rgba(168,85,247,0.1)",
                      border: "1px solid rgba(168,85,247,0.2)",
                      color: "hsl(262 83% 70%)",
                    }}
                    onClick={() => handleResetSessions(order)}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Сбросить
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
        {showCodeModal && selectedOrder && (
          <GetCodeModal
            accountId={selectedOrder.accountId}
            phone={selectedOrder.accountPhone}
            onClose={() => setShowCodeModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-4 pb-6">
        <div className="animate-fade-in-1">
          <h1 className="text-xl font-bold tracking-tight">Заказы</h1>
          <p className="text-xs text-muted-foreground mt-0.5">История покупок</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
          ) : userOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground animate-fade-in">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(168,85,247,0.1)" }}
              >
                <ShoppingBag className="w-8 h-8" style={{ color: "hsl(262 83% 68%)" }} />
              </div>
              <p className="text-sm font-medium">Заказов пока нет</p>
              <p className="text-xs mt-1 opacity-60">Купите первый аккаунт в каталоге</p>
            </div>
          ) : (
            userOrders.map((o, i) => {
              const statusStyle = STATUS_STYLES[o.status] ?? { bg: "rgba(168,85,247,0.1)", color: "hsl(262 83% 68%)" };
              return (
                <div
                  key={o.id}
                  className="card-press rounded-2xl p-4 animate-fade-in cursor-pointer"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid rgba(168,85,247,0.12)",
                    animationDelay: `${i * 0.05}s`,
                  }}
                  onClick={() => { setSelectedOrder(o); setShowCopyDropdown(false); }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: "rgba(168,85,247,0.08)" }}
                    >
                      {o.accountCountry ? getFlag(o.accountCountry) : "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm truncate">{o.accountCountry || `Заказ #${o.id}`}</span>
                        {o.accountHasPremium && <span className="badge-premium flex-shrink-0">Premium</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(o.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                        </span>
                        {o.accountPhone && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {o.accountPhone}
                            {o.accountDcId ? ` · DC ${o.accountDcId}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: "hsl(262 83% 70%)" }}>
                        {o.amount > 0 ? `${o.amount} ★` : "Free"}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
