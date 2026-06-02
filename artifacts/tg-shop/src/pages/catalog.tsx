import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { Plus, Star, Zap } from "lucide-react";
import { getTelegramUser } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
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
  "Бутан": "🇧🇹", "Вануату": "🇻🇺", "Великобритания": "🇬🇧",
  "Венгрия": "🇭🇺", "Венесуэла": "🇻🇪", "Вьетнам": "🇻🇳",
  "Габон": "🇬🇦", "Гаити": "🇭🇹", "Гамбия": "🇬🇲",
  "Гана": "🇬🇭", "Гватемала": "🇬🇹", "Гвинея": "🇬🇳",
  "Гвинея-Бисау": "🇬🇼", "Германия": "🇩🇪", "Гондурас": "🇭🇳",
  "Гренада": "🇬🇩", "Греция": "🇬🇷", "Грузия": "🇬🇪",
  "Дания": "🇩🇰", "Джибути": "🇩🇯", "Доминика": "🇩🇲",
  "Доминиканская Республика": "🇩🇴", "Египет": "🇪🇬", "Замбия": "🇿🇲",
  "Зимбабве": "🇿🇼", "Израиль": "🇮🇱", "Индия": "🇮🇳",
  "Индонезия": "🇮🇩", "Иордания": "🇯🇴", "Ирак": "🇮🇶",
  "Иран": "🇮🇷", "Ирландия": "🇮🇪", "Исландия": "🇮🇸",
  "Испания": "🇪🇸", "Италия": "🇮🇹", "Йемен": "🇾🇪",
  "Кабо-Верде": "🇨🇻", "Казахстан": "🇰🇿", "Камбоджа": "🇰🇭",
  "Камерун": "🇨🇲", "Канада": "🇨🇦", "Катар": "🇶🇦",
  "Кения": "🇰🇪", "Кипр": "🇨🇾", "Кыргызстан": "🇰🇬",
  "Китай": "🇨🇳", "Колумбия": "🇨🇴", "Коморы": "🇰🇲",
  "Конго": "🇨🇬", "Косово": "🇽🇰", "Коста-Рика": "🇨🇷",
  "Кот-д'Ивуар": "🇨🇮", "Куба": "🇨🇺", "Кувейт": "🇰🇼",
  "Лаос": "🇱🇦", "Латвия": "🇱🇻", "Лесото": "🇱🇸",
  "Либерия": "🇱🇷", "Ливан": "🇱🇧", "Ливия": "🇱🇾",
  "Литва": "🇱🇹", "Лихтенштейн": "🇱🇮", "Люксембург": "🇱🇺",
  "Маврикий": "🇲🇺", "Мавритания": "🇲🇷", "Мадагаскар": "🇲🇬",
  "Малави": "🇲🇼", "Малайзия": "🇲🇾", "Мали": "🇲🇱",
  "Мальдивы": "🇲🇻", "Мальта": "🇲🇹", "Марокко": "🇲🇦",
  "Маршалловы Острова": "🇲🇭", "Мексика": "🇲🇽", "Микронезия": "🇫🇲",
  "Мозамбик": "🇲🇿", "Молдова": "🇲🇩", "Монако": "🇲🇨",
  "Монголия": "🇲🇳", "Мьянма": "🇲🇲", "Намибия": "🇳🇦",
  "Науру": "🇳🇷", "Непал": "🇳🇵", "Нигер": "🇳🇪",
  "Нигерия": "🇳🇬", "Нидерланды": "🇳🇱", "Никарагуа": "🇳🇮",
  "Новая Зеландия": "🇳🇿", "Норвегия": "🇳🇴", "ОАЭ": "🇦🇪",
  "Оман": "🇴🇲", "Пакистан": "🇵🇰", "Палау": "🇵🇼",
  "Панама": "🇵🇦", "Папуа Новая Гвинея": "🇵🇬", "Парагвай": "🇵🇾",
  "Перу": "🇵🇪", "Польша": "🇵🇱", "Португалия": "🇵🇹",
  "Россия": "🇷🇺", "Руанда": "🇷🇼", "Румыния": "🇷🇴",
  "Сальвадор": "🇸🇻", "Самоа": "🇼🇸", "Сан-Марино": "🇸🇲",
  "Сан-Томе и Принсипи": "🇸🇹", "Саудовская Аравия": "🇸🇦",
  "Северная Македония": "🇲🇰", "Сейшелы": "🇸🇨", "Сенегал": "🇸🇳",
  "Сент-Китс и Невис": "🇰🇳", "Сент-Люсия": "🇱🇨",
  "Сент-Винсент и Гренадины": "🇻🇨", "Сербия": "🇷🇸",
  "Сингапур": "🇸🇬", "Сирия": "🇸🇾", "Словакия": "🇸🇰",
  "Словения": "🇸🇮", "Соломоновы Острова": "🇸🇧", "Сомали": "🇸🇴",
  "Судан": "🇸🇩", "Суринам": "🇸🇷", "США": "🇺🇸",
  "Сьерра-Леоне": "🇸🇱", "Таджикистан": "🇹🇯", "Таиланд": "🇹🇭",
  "Танзания": "🇹🇿", "Того": "🇹🇬", "Тонга": "🇹🇴",
  "Тринидад и Тобаго": "🇹🇹", "Тувалу": "🇹🇻", "Тунис": "🇹🇳",
  "Туркменистан": "🇹🇲", "Турция": "🇹🇷", "Уганда": "🇺🇬",
  "Узбекистан": "🇺🇿", "Украина": "🇺🇦", "Уругвай": "🇺🇾",
  "Фиджи": "🇫🇯", "Филиппины": "🇵🇭", "Финляндия": "🇫🇮",
  "Франция": "🇫🇷", "Хорватия": "🇭🇷", "Центральноафриканская Республика": "🇨🇫",
  "Чад": "🇹🇩", "Черногория": "🇲🇪", "Чехия": "🇨🇿",
  "Чили": "🇨🇱", "Швейцария": "🇨🇭", "Швеция": "🇸🇪",
  "Шри-Ланка": "🇱🇰", "Эквадор": "🇪🇨", "Экваториальная Гвинея": "🇬🇶",
  "Эритрея": "🇪🇷", "Эсватини": "🇸🇿", "Эстония": "🇪🇪",
  "Эфиопия": "🇪🇹", "ЮАР": "🇿🇦", "Южная Корея": "🇰🇷",
  "Южный Судан": "🇸🇸", "Ямайка": "🇯🇲", "Япония": "🇯🇵",
  "Другая": "🌍",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || "🌍";
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
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const user = getTelegramUser();
  const { toast } = useToast();

  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("100");

  useEffect(() => {
    fetch("/api/accounts/available")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data);
        setIsLoading(false);
      });
    if (user) {
      fetch(`/api/balance/${user.id}`)
        .then((r) => r.json())
        .then((data) => setBalance(data.balance ?? 0));
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
                .then((r) => r.json())
                .then((data) => setBalance(data.balance ?? 0));
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
            <p className="text-xs text-muted-foreground mt-0.5">Telegram аккаунты</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Balance badge */}
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

        {/* Account list */}
        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <AccountSkeleton key={i} index={i} />
            ))
          ) : accounts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-medium">Аккаунтов пока нет</p>
              <p className="text-xs mt-1 opacity-60">Загляните позже</p>
            </div>
          ) : (
            accounts.map((acc, i) => {
              const isFree = acc.isFree === "true" || acc.price === 0;
              return (
                <Link key={acc.id} href={`/account/${acc.id}`} className="block">
                  <div
                    className="card-press rounded-2xl p-4 transition-all duration-200 group"
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
                        {/* Flag circle */}
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: "rgba(168,85,247,0.08)" }}
                        >
                          {getFlag(acc.country)}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm truncate">{acc.country || "Неизвестно"}</span>
                            {acc.hasPremium && (
                              <span className="badge-premium flex-shrink-0">Premium</span>
                            )}
                            {isFree && (
                              <span className="badge-free flex-shrink-0">Free</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {acc.phonePrefix && (
                              <span className="text-[11px] text-muted-foreground font-mono">{acc.phonePrefix}****</span>
                            )}
                            {acc.dcId && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                style={{ background: "rgba(168,85,247,0.1)", color: "hsl(262 83% 70%)" }}
                              >
                                DC {acc.dcId}
                              </span>
                            )}
                          </div>
                          {acc.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{acc.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Price + button */}
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
                            background: isFree
                              ? "linear-gradient(135deg,#059669,#10b981)"
                              : "linear-gradient(135deg,#7c3aed,#a855f7)",
                            boxShadow: isFree
                              ? "0 2px 8px rgba(5,150,105,0.3)"
                              : "0 2px 8px rgba(124,58,237,0.3)",
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
                onChange={(e) => setTopupAmount(e.target.value)}
                min={1}
                placeholder="100"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  className="rounded-xl py-2 text-xs font-semibold transition-all"
                  style={{
                    background: topupAmount === String(amt)
                      ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                      : "rgba(168,85,247,0.08)",
                    border: topupAmount === String(amt)
                      ? "1px solid rgba(168,85,247,0.5)"
                      : "1px solid rgba(168,85,247,0.15)",
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