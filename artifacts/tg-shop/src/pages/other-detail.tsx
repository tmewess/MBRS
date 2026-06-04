import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTelegramUser } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { Copy, ArrowLeft, Shield, Star } from "lucide-react";
import { Confetti } from "@/components/confetti";

interface OtherAccount {
  id: number;
  service: string;
  login: string;
  password: string;
  email: string | null;
  emailPassword: string | null;
  description: string | null;
  preDescription: string | null;
  price: number;
  isFree: string;
  status: string;
}

const SERVICE_ICONS: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
  "TikTok": {
    color: "#010101",
    bg: "rgba(1,1,1,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7a4.85 4.85 0 0 1-1.01-.31z"/>
      </svg>
    ),
  },
  "YouTube": {
    color: "#FF0000",
    bg: "rgba(255,0,0,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.83 12l-6.08 3.52z"/>
      </svg>
    ),
  },
  "Instagram": {
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  "Facebook": {
    color: "#1877F2",
    bg: "rgba(24,119,242,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  "Twitter / X": {
    color: "#000000",
    bg: "rgba(0,0,0,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  "Spotify": {
    color: "#1DB954",
    bg: "rgba(29,185,84,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  "Steam": {
    color: "#1b2838",
    bg: "rgba(27,40,56,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
      </svg>
    ),
  },
  "Discord": {
    color: "#5865F2",
    bg: "rgba(88,101,242,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.130 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  "VK": {
    color: "#0077FF",
    bg: "rgba(0,119,255,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.032-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.17-3.608 2.17-3.608.119-.254.322-.491.763-.491h1.744c.525 0 .644.271.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.716-.576.716z"/>
      </svg>
    ),
  },
};

function getServiceInfo(service: string) {
  return SERVICE_ICONS[service] ?? {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    icon: <span className="text-2xl font-bold">{service[0] ?? "?"}</span>,
  };
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Скопировано", description: `${label} скопирован` });
  };
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}:</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted/60 rounded-lg px-3 py-2.5 text-sm font-mono break-all">{value}</div>
        <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function OtherDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const user = getTelegramUser();
  const accountId = Number(id);

  const [account, setAccount] = useState<OtherAccount | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [purchasedAccount, setPurchasedAccount] = useState<OtherAccount | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetch(`/api/other-accounts/${accountId}`)
      .then(r => r.json())
      .then(data => { setAccount(data); setIsLoading(false); });
    if (user) {
      fetch(`/api/balance/${user.id}`)
        .then(r => r.json())
        .then(data => setBalance(data.balance ?? 0));
    }
  }, [accountId, user]);

  const handleBuy = async () => {
    if (!user) {
      toast({ title: "Ошибка", description: "Откройте в Telegram", variant: "destructive" });
      return;
    }
    if (!account) return;

    setIsBuying(true);
    const isFree = account.isFree === "true" || account.price === 0;

    if (!isFree && balance < account.price) {
      toast({ title: "Недостаточно Stars", description: `Нужно: ${account.price}, у вас: ${balance}. Пополните баланс.`, variant: "destructive" });
      setIsBuying(false);
      return;
    }

    try {
      const res = await fetch("/api/other-accounts/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramUserId: String(user.id),
          telegramUsername: user.username,
          accountId: account.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (!isFree) setBalance(b => b - account.price);
        setPurchasedAccount(data.account);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast({ title: "Готово!", description: isFree ? "Получено!" : "Куплено!" });
      } else {
        toast({ title: "Ошибка", description: data.error ?? "Не удалось купить", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Ошибка подключения", variant: "destructive" });
    }
    setIsBuying(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout>
        <div className="p-4 text-center text-muted-foreground">Товар не найден.</div>
      </Layout>
    );
  }

  const svcInfo = getServiceInfo(account.service);
  const isFree = account.isFree === "true" || account.price === 0;

  // Post-purchase view
  if (purchasedAccount) {
    const acc = purchasedAccount;
    return (
      <>
        <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLocation("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-semibold tracking-tight text-lg">Данные аккаунта</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: svcInfo.bg, color: svcInfo.color }}
              >
                {svcInfo.icon}
              </div>
              <div>
                <div className="font-semibold text-lg">{acc.service}</div>
                <div className="text-xs text-emerald-400 font-medium">Аккаунт получен</div>
              </div>
            </div>

            <Card className="p-4 space-y-3 bg-card/80 border-border/40">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Данные для входа
              </div>

              <CopyField label="Логин" value={acc.login} />
              <CopyField label="Пароль" value={acc.password} />

              {acc.email && (
                <CopyField label="Почта" value={acc.email} />
              )}

              {acc.emailPassword && (
                <CopyField label="Пароль от почты" value={acc.emailPassword} />
              )}
            </Card>

            {acc.description && (
              <Card className="p-4 bg-card/80 border-border/40">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Дополнительная информация
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{acc.description}</p>
              </Card>
            )}

            <div
              className="rounded-xl p-3 text-xs text-muted-foreground text-center"
              style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.1)" }}
            >
              Сохраните данные -- они показываются только один раз
            </div>
          </main>
        </div>
        <Confetti active={showConfetti} />
      </>
    );
  }

  // Pre-purchase view
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground pb-24">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold tracking-tight text-lg">{account.service}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: svcInfo.bg, color: svcInfo.color }}
          >
            {svcInfo.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold">{account.service}</h1>
            <div className="text-base font-medium mt-0.5">
              {isFree ? (
                <span className="text-emerald-400">Бесплатно</span>
              ) : (
                <span className="text-primary flex items-center gap-1">
                  <Shield className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {account.price} Stars
                </span>
              )}
            </div>
          </div>
        </div>

        <Card className="p-4 bg-card/80 border-border/40">
          <h3 className="text-sm font-semibold mb-3">Информация о товаре</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Тип сервиса</span>
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded-full"
                style={{ background: svcInfo.bg, color: svcInfo.color }}
              >
                {account.service}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Включено</span>
              <span className="text-sm font-medium">Логин + пароль</span>
            </div>
            {account.email !== null && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Почта</span>
                <span className="text-sm font-medium text-emerald-400">Есть</span>
              </div>
            )}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">Статус</span>
              <span className="text-sm font-medium text-emerald-400">Доступен</span>
            </div>
          </div>
        </Card>

        {account.preDescription && (
          <Card className="p-4 bg-card/80 border-border/40">
            <h3 className="text-sm font-semibold mb-2">Описание</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {account.preDescription}
            </p>
          </Card>
        )}

        {!isFree && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm">Ваш баланс: <strong>{balance} Stars</strong></span>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border/50 z-10">
        <Button
          className="w-full h-12 text-base font-semibold"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            border: "none",
          }}
          onClick={handleBuy}
          disabled={isBuying || account.status !== "available"}
        >
          {isBuying
            ? "Обработка..."
            : isFree
              ? "Получить бесплатно"
              : account.status === "available"
                ? `Купить за ${account.price} Stars`
                : "Недоступен"}
        </Button>
      </div>
    </div>
  );
}
