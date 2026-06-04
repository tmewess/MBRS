import { useState, useEffect } from "react";
import { Link } from "wouter";
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
  lolzItemId: string | null;
  sessionId: number | null;
}

interface OtherAccount {
  id: number;
  service: string;
  login: string;
  price: number;
  isFree: string;
  status: string;
  preDescription: string | null;
  description: string | null;
  email: string | null;
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
  "Казахстан": "🇰🇿", "Камбоджа": "🇰🇭", "Камерун": "🇨🇲",
  "Канада": "🇨🇦", "Катар": "🇶🇦", "Кения": "🇰🇪",
  "Кипр": "🇨🇾", "Кыргызстан": "🇰🇬", "Китай": "🇨🇳",
  "Колумбия": "🇨🇴", "Коморы": "🇰🇲", "Конго": "🇨🇬",
  "Косово": "🇽🇰", "Коста-Рика": "🇨🇷", "Куба": "🇨🇺",
  "Кувейт": "🇰🇼", "Лаос": "🇱🇦", "Латвия": "🇱🇻",
  "Лесото": "🇱🇸", "Либерия": "🇱🇷", "Ливан": "🇱🇧",
  "Ливия": "🇱🇾", "Литва": "🇱🇹", "Лихтенштейн": "🇱🇮",
  "Люксембург": "🇱🇺", "Маврикий": "🇲🇺", "Мавритания": "🇲🇷",
  "Мадагаскар": "🇲🇬", "Малави": "🇲🇼", "Малайзия": "🇲🇾",
  "Мали": "🇲🇱", "Мальдивы": "🇲🇻", "Мальта": "🇲🇹",
  "Марокко": "🇲🇦", "Мексика": "🇲🇽", "Молдова": "🇲🇩",
  "Монако": "🇲🇨", "Монголия": "🇲🇳", "Мьянма": "🇲🇲",
  "Намибия": "🇳🇦", "Непал": "🇳🇵", "Нигер": "🇳🇪",
  "Нигерия": "🇳🇬", "Нидерланды": "🇳🇱", "Никарагуа": "🇳🇮",
  "Новая Зеландия": "🇳🇿", "Норвегия": "🇳🇴", "ОАЭ": "🇦🇪",
  "Оман": "🇴🇲", "Пакистан": "🇵🇰", "Панама": "🇵🇦",
  "Парагвай": "🇵🇾", "Перу": "🇵🇪", "Польша": "🇵🇱",
  "Португалия": "🇵🇹", "Россия": "🇷🇺", "Руанда": "🇷🇼",
  "Румыния": "🇷🇴", "Сальвадор": "🇸🇻", "Самоа": "🇼🇸",
  "Саудовская Аравия": "🇸🇦", "Северная Македония": "🇲🇰",
  "Сенегал": "🇸🇳", "Сербия": "🇷🇸", "Сингапур": "🇸🇬",
  "Сирия": "🇸🇾", "Словакия": "🇸🇰", "Словения": "🇸🇮",
  "Сомали": "🇸🇴", "Судан": "🇸🇩", "США": "🇺🇸",
  "Таджикистан": "🇹🇯", "Таиланд": "🇹🇭", "Танзания": "🇹🇿",
  "Того": "🇹🇬", "Тунис": "🇹🇳", "Туркменистан": "🇹🇲",
  "Турция": "🇹🇷", "Уганда": "🇺🇬", "Узбекистан": "🇺🇿",
  "Украина": "🇺🇦", "Уругвай": "🇺🇾", "Филиппины": "🇵🇭",
  "Финляндия": "🇫🇮", "Франция": "🇫🇷", "Хорватия": "🇭🇷",
  "Чехия": "🇨🇿", "Чили": "🇨🇱", "Швейцария": "🇨🇭",
  "Швеция": "🇸🇪", "Шри-Ланка": "🇱🇰", "Эквадор": "🇪🇨",
  "Эстония": "🇪🇪", "Эфиопия": "🇪🇹", "ЮАР": "🇿🇦",
  "Южная Корея": "🇰🇷", "Япония": "🇯🇵", "Другая": "🌍",
};

const SERVICE_ICONS: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
  "TikTok": {
    color: "#010101",
    bg: "rgba(1,1,1,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.78 1.52V7a4.85 4.85 0 0 1-1.01-.31z"/>
      </svg>
    ),
  },
  "YouTube": {
    color: "#FF0000",
    bg: "rgba(255,0,0,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.83 12l-6.08 3.52z"/>
      </svg>
    ),
  },
  "Instagram": {
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  "Facebook": {
    color: "#1877F2",
    bg: "rgba(24,119,242,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  "Twitter / X": {
    color: "#000000",
    bg: "rgba(0,0,0,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  "Spotify": {
    color: "#1DB954",
    bg: "rgba(29,185,84,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  "Steam": {
    color: "#1b2838",
    bg: "rgba(27,40,56,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
      </svg>
    ),
  },
  "Discord": {
    color: "#5865F2",
    bg: "rgba(88,101,242,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.130 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  "VK": {
    color: "#0077FF",
    bg: "rgba(0,119,255,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.032-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.17-3.608 2.17-3.608.119-.254.322-.491.763-.491h1.744c.525 0 .644.271.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.716-.576.716z"/>
      </svg>
    ),
  },
  "Twitch": {
    color: "#9147FF",
    bg: "rgba(145,71,255,0.08)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
      </svg>
    ),
  },
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || "🌍";
}

function getServiceIcon(service: string) {
  return SERVICE_ICONS[service] ?? {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    icon: <span className="text-base font-bold">{service[0] ?? "?"}</span>,
  };
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

type Tab = "telegram" | "other";

export default function Catalog() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [otherAccounts, setOtherAccounts] = useState<OtherAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("telegram");
  const user = getTelegramUser();
  const { toast } = useToast();

  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("100");

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/accounts/available").then(r => r.json()),
      fetch("/api/other-accounts/available").then(r => r.json()),
    ]).then(([tg, other]) => {
      setAccounts(tg);
      setOtherAccounts(other);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

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
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeTab === "telegram" ? "Telegram аккаунты" : "Другие сервисы"}
            </p>
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

        {/* Category tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)" }}
        >
          {(["telegram", "other"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
              style={
                activeTab === tab
                  ? {
                      background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                      color: "white",
                      boxShadow: "0 2px 10px rgba(124,58,237,0.35)",
                    }
                  : { color: "hsl(var(--muted-foreground))" }
              }
            >
              {tab === "telegram" ? "Telegram" : "Прочее"}
            </button>
          ))}
        </div>

        {/* Telegram accounts */}
        {activeTab === "telegram" && (
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <AccountSkeleton key={i} index={i} />)
            ) : accounts.length === 0 ? (
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
                              {acc.description && (
                                <span className="text-[11px] text-muted-foreground">{acc.country || "Неизвестно"}</span>
                              )}
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
                              {idLabel && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                  style={{ background: "rgba(99,102,241,0.1)", color: "hsl(239 84% 70%)" }}
                                >
                                  {idLabel}
                                </span>
                              )}
                              {hasAutoDelivery && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                  style={{ background: "rgba(16,185,129,0.1)", color: "hsl(160 84% 39%)" }}
                                >
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
        )}

        {/* Other accounts */}
        {activeTab === "other" && (
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <AccountSkeleton key={i} index={i} />)
            ) : otherAccounts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-medium">Товаров пока нет</p>
                <p className="text-xs mt-1 opacity-60">Загляните позже</p>
              </div>
            ) : (
              otherAccounts.map((acc, i) => {
                const isFree = acc.isFree === "true" || acc.price === 0;
                const svcInfo = getServiceIcon(acc.service);
                return (
                  <Link key={acc.id} href={`/other/${acc.id}`} className="block">
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
                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: svcInfo.bg, color: svcInfo.color }}
                          >
                            {svcInfo.icon}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-semibold truncate">{acc.service}</p>
                            {acc.preDescription ? (
                              <p className="text-[11px] text-muted-foreground truncate">{acc.preDescription}</p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground">
                                {acc.email ? "Есть почта" : "Логин + пароль"}
                              </p>
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
        )}
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
              <input
                type="number"
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                min={1}
                placeholder="100"
                className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map(amt => (
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
