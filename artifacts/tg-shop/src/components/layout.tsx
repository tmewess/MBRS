import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { isTelegramWebApp } from "@/lib/telegram";

const navItems = [
  {
    href: "/",
    label: "Каталог",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
        <path d="M12 17.5v-11"/>
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "Заказы",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5"/>
        <path d="M12 22V12"/>
      </svg>
    ),
  },
  {
    href: "/news",
    label: "Новости",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
        <path d="M18 14h-8"/>
        <path d="M15 18h-5"/>
        <path d="M10 6h8v4h-8V6Z"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [pressed, setPressed] = useState<string | null>(null);

  useEffect(() => {
    if (isTelegramWebApp()) {
      WebApp.ready();
      WebApp.expand();
    }
  }, []);

  const handlePress = (href: string) => {
    setPressed(href);
    setTimeout(() => setPressed(null), 200);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground pb-[76px]">
      <style>{`
        @keyframes navPop {
          0% { transform: scale(1); }
          40% { transform: scale(0.82); }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes labelSlide {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes indicatorGrow {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        .nav-item-active .nav-icon {
          animation: navPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .nav-item-pressed {
          animation: navPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .nav-label-active {
          animation: labelSlide 0.2s ease forwards;
        }
        .nav-indicator {
          animation: indicatorGrow 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: center;
        }
      `}</style>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`.replace(/\/\/+/g, "/")} alt="VoidAccount" className="h-10 w-10 rounded-md neon-logo" />
          <span className="font-semibold tracking-tight text-lg">VoidAccount</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/98 backdrop-blur-xl pb-safe" style={{ height: '68px' }}>
        <div className="flex h-full w-full items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const isPressed = pressed === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handlePress(item.href)}
                className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-150 select-none ${
                  isActive ? "text-primary nav-item-active" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="nav-indicator absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary" />
                )}
                <span className={`nav-icon transition-transform duration-150 ${isPressed ? "nav-item-pressed" : ""}`}>
                  {item.icon}
                </span>
                <span className={`text-[11px] font-bold tracking-wide leading-none ${isActive ? "nav-label-active" : ""}`}>
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
