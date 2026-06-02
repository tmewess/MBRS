import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { isTelegramWebApp } from "@/lib/telegram";

const LOGO_DARK = "data:image/jpeg;base64,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";
const LOGO_LIGHT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABtUlEQVR4nO2YPU8CQRCGn0OligUJhYmFiYWJhYmFiYWJhYmFiYWJhYkFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhQ==";

function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((v) => !v) };
}

const navItems = [
  {
    href: "/",
    label: "Каталог",
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"} strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.55}>
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" stroke={active ? "hsl(262 83% 63%)" : "none"} fill="none" strokeWidth="1.5"/>
        <path d="M12 17.5v-11" stroke={active ? "hsl(262 83% 63%)" : "none"} fill="none" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "Заказы",
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"} strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.55}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5" stroke={active ? "hsl(262 83% 63%)" : "none"} fill="none" strokeWidth="1.5"/>
        <path d="M12 22V12" stroke={active ? "hsl(262 83% 63%)" : "none"} fill="none" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/news",
    label: "Новости",
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"} strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.55}>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
        <path d="M18 14h-8" stroke={active ? "hsl(262 83% 63%)" : "none"} fill="none" strokeWidth="1.5"/>
        <path d="M15 18h-5" stroke={active ? "hsl(262 83% 63%)" : "none"} fill="none" strokeWidth="1.5"/>
        <path d="M10 6h8v4h-8V6Z" stroke={active ? "hsl(262 83% 63%)" : "none"} fill="none" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"} strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.55}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [pressed, setPressed] = useState<string | null>(null);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    if (isTelegramWebApp()) {
      WebApp.ready();
      WebApp.expand();
    }
  }, []);

  const handlePress = (href: string) => {
    setPressed(href);
    setTimeout(() => setPressed(null), 180);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground pb-[72px]">
      <style>{`
        @keyframes navBounce {
          0% { transform: scale(1) translateY(0); }
          30% { transform: scale(0.80) translateY(2px); }
          65% { transform: scale(1.18) translateY(-2px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes indicatorSlide {
          0% { transform: scaleX(0) translateX(-50%); opacity: 0; }
          100% { transform: scaleX(1) translateX(-50%); opacity: 1; }
        }
        @keyframes labelPop {
          0% { opacity: 0; transform: translateY(3px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nav-active-bounce {
          animation: navBounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .nav-press {
          animation: navBounce 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .nav-indicator {
          left: 50%;
          animation: indicatorSlide 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: center;
        }
        .nav-label-active {
          animation: labelPop 0.22s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full">
        <div
          className="absolute inset-0 border-b"
          style={{
            background: isDark
              ? "rgba(0,0,0,0.85)"
              : "rgba(255,255,255,0.85)",
            borderColor: "rgba(168,85,247,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        />
        <div className="relative flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-xl blur-md opacity-50"
                style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}
              />
              <div
                className="relative h-9 w-9 rounded-xl flex items-center justify-center neon-logo overflow-hidden"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)" }}
              >
                <span className="text-white font-black text-base select-none">V</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold tracking-tight text-[15px]">VoidAccount</span>
              <span className="text-[10px] font-medium" style={{ color: "hsl(262 83% 70%)" }}>marketplace</span>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Переключить тему"
            className="relative flex items-center rounded-full p-1 transition-all duration-300 focus:outline-none"
            style={{
              background: isDark
                ? "rgba(168,85,247,0.12)"
                : "rgba(124,58,237,0.08)",
              border: "1px solid rgba(168,85,247,0.2)",
              width: 52,
              height: 28,
            }}
          >
            <span
              className="absolute flex items-center justify-center rounded-full shadow-sm transition-all duration-300"
              style={{
                width: 22,
                height: 22,
                left: isDark ? 3 : "calc(100% - 25px)",
                background: isDark
                  ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                  : "linear-gradient(135deg,#f59e0b,#fbbf24)",
              }}
            >
              {isDark ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{ height: 64 }}
      >
        <div
          className="absolute inset-0 border-t"
          style={{
            background: isDark
              ? "rgba(0,0,0,0.92)"
              : "rgba(255,255,255,0.92)",
            borderColor: "rgba(168,85,247,0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        />
        <div className="relative flex h-full w-full items-center justify-around px-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const isPressed = pressed === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handlePress(item.href)}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 select-none focus:outline-none"
              >
                {isActive && (
                  <span
                    className="nav-indicator absolute top-0 w-10 h-[2px] rounded-full"
                    style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899)" }}
                  />
                )}
                <span
                  className={isActive ? "nav-active-bounce" : isPressed ? "nav-press" : ""}
                  style={{ color: isActive ? "hsl(262 83% 68%)" : undefined }}
                >
                  {item.icon(isActive)}
                </span>
                <span
                  className={`text-[10px] font-semibold leading-none transition-colors duration-150 ${isActive ? "nav-label-active" : "opacity-45"}`}
                  style={{ color: isActive ? "hsl(262 83% 68%)" : undefined }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
