import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { Plus, Star } from "lucide-react";
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

function AccountSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card/80 p-3.5 overflow-hidden relative">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          animation: shimmer 1.4s infinite;
        }
      `}</style>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="shimmer relative w-6 h-5 rounded bg-muted/50" />
            <div className="shimmer relative h-4 w-24 rounded bg-muted/50" />
          </div>
          <div className="shimmer relative h-3 w-32 rounded bg-muted/40" />
          <div className="shimmer relative h-5 w-12 rounded-full bg-muted/40" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="shimmer relative h-5 w-12 rounded bg-muted/50" />
          <div className="shimmer relative h-7 w-16 rounded-full bg-muted/50" />
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
      toast({ title: "Ошибка", description: "Минимальное пополнение — 1 Star", variant: "destructive" });
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
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold tracking-tight">Telegram Аккаунты</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-3 py-1.5 text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{balance.toFixed(0)}</span>
            </div>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setIsTopupOpen(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <AccountSkeleton key={i} />
            ))
          ) : accounts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Аккаунтов пока нет
            </div>
          ) : (
            accounts.map((acc) => (
              <Link key={acc.id} href={`/account/${acc.id}`} className="block">
                <Card className="p-3.5 hover:shadow-md transition-all border-border/40 bg-card/80 backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getFlag(acc.country)}</span>
                        <span className="font-semibold text-sm truncate">{acc.country || "Неизвестно"}</span>
                        {acc.hasPremium && (
                          <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium">Premium</span>
                        )}
                      </div>
                      {acc.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">{acc.description}</div>
                      )}
                      {!acc.description && acc.phonePrefix && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {acc.phonePrefix}****
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {acc.dcId && (
                          <span className="text-[10px] bg-muted/60 px-2 py-0.5 rounded-full text-muted-foreground">
                            DC {acc.dcId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="text-base font-bold text-primary">
                        {acc.isFree === "true" || acc.price === 0 ? (
                          <span className="text-green-400 text-sm">Бесплатно</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {acc.price}
                          </span>
                        )}
                      </div>
                      <Button size="sm" className="h-7 px-4 text-xs rounded-full">
                        {acc.isFree === "true" || acc.price === 0 ? "Получить" : "Купить"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Пополнение баланса</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Сумма Stars (минимум 1)</Label>
              <Input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                min={1}
                placeholder="100"
              />
            </div>
            <div className="flex gap-2">
              {[50, 100, 250, 500].map((amt) => (
                <Button
                  key={amt}
                  variant={topupAmount === String(amt) ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTopupAmount(String(amt))}
                >
                  {amt}
                </Button>
              ))}
            </div>
            <Button className="w-full" onClick={handleTopup}>
              <Star className="w-4 h-4 mr-1" />
              Пополнить
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              После нажатия появится чек оплаты в Telegram
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
