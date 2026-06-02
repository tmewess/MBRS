import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getTelegramUser } from "@/lib/telegram";
import { Star, User, Hash, AtSign, ShoppingBag } from "lucide-react";

export default function Profile() {
  const user = getTelegramUser();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/balance/${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          setBalance(data.balance ?? 0);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <Layout>
      <div className="p-4 space-y-4 pb-6">
        <div className="animate-fade-in-1">
          <h1 className="text-xl font-bold tracking-tight">Профиль</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Ваш аккаунт</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* User card */}
            <div
              className="rounded-2xl p-4 animate-fade-in-2"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid rgba(168,85,247,0.15)",
              }}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="absolute inset-0 rounded-2xl blur-md opacity-60"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}
                  />
                  {user?.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt="avatar"
                      className="relative w-16 h-16 rounded-2xl object-cover"
                      style={{ border: "2px solid rgba(168,85,247,0.4)" }}
                    />
                  ) : (
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                    >
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-base truncate">
                    {user?.first_name || "Пользователь"}
                    {user?.last_name ? ` ${user.last_name}` : ""}
                  </div>
                  {user?.username && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <AtSign className="w-3 h-3" style={{ color: "hsl(262 83% 68%)" }} />
                      <span>@{user.username}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="w-3 h-3" style={{ color: "hsl(262 83% 68%)" }} />
                    <span>{user?.id ?? "Неизвестен"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance card */}
            <div
              className="rounded-2xl p-5 animate-fade-in-3"
              style={{
                background: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(168,85,247,0.08))",
                border: "1px solid rgba(168,85,247,0.25)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Баланс</div>
                  <div className="text-3xl font-black flex items-center gap-2">
                    <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                    <span>{balance}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Telegram Stars</div>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(168,85,247,0.15)" }}
                >
                  <ShoppingBag className="w-7 h-7" style={{ color: "hsl(262 83% 68%)" }} />
                </div>
              </div>
            </div>

            {/* Info card */}
            <div
              className="rounded-2xl p-4 space-y-3 animate-fade-in-4"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid rgba(168,85,247,0.12)",
              }}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">О магазине</div>
              <div className="space-y-2">
                {[
                  { icon: "🔒", text: "Все аккаунты проверены вручную" },
                  { icon: "⚡", text: "Мгновенная выдача после оплаты" },
                  { icon: "💎", text: "Оплата через Telegram Stars" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
