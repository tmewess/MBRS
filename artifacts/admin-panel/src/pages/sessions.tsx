import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Smartphone, CheckCircle2, AlertCircle, RefreshCw, Upload, Store, Package, CheckCircle, Globe, Star, ShieldAlert, Crown, Key, Wifi, Download, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface SessionRecord {
  id: number;
  phone: string;
  firstName: string | null;
  userId: string | null;
  status: string;
  createdAt: string;
  hasSession: boolean;
}

interface CheckResult {
  success: boolean;
  phone?: string;
  userId?: string;
  firstName?: string;
  dcId?: string;
  authKey?: string;
  country?: string;
  hasPremium?: boolean;
  hasPassword?: boolean;
  spamBlock?: string;
  password?: string;
  sessionString?: string;
  error?: string;
}

interface LolzAccount {
  itemId: number;
  price: number;
  title: string;
  phone: string | null;
  country: string | null;
  hasPremium: boolean;
  hasPassword: boolean;
  spamBlock: string | null;
  dcId: string | null;
  userId: string | null;
  idDigitCount: number | null;
  registrationDate: string | null;
  canGetCode: boolean;
  origin: string | null;
}

type AuthStep = "phone" | "code" | "password";

const LOLZ_COUNTRIES: { code: string; name: string }[] = [
  { code: "ru", name: "Россия" }, { code: "ua", name: "Украина" }, { code: "us", name: "США" },
  { code: "kz", name: "Казахстан" }, { code: "by", name: "Беларусь" }, { code: "uz", name: "Узбекистан" },
  { code: "az", name: "Азербайджан" }, { code: "am", name: "Армения" }, { code: "ge", name: "Грузия" },
  { code: "kg", name: "Кыргызстан" }, { code: "tj", name: "Таджикистан" }, { code: "md", name: "Молдова" },
  { code: "lt", name: "Литва" }, { code: "lv", name: "Латвия" }, { code: "ee", name: "Эстония" },
  { code: "pl", name: "Польша" }, { code: "de", name: "Германия" }, { code: "fr", name: "Франция" },
  { code: "gb", name: "Великобритания" }, { code: "nl", name: "Нидерланды" }, { code: "tr", name: "Турция" },
  { code: "in", name: "Индия" }, { code: "id", name: "Индонезия" }, { code: "br", name: "Бразилия" },
  { code: "ph", name: "Филиппины" }, { code: "vn", name: "Вьетнам" }, { code: "th", name: "Таиланд" },
  { code: "ng", name: "Нигерия" }, { code: "pk", name: "Пакистан" }, { code: "bd", name: "Бангладеш" },
  { code: "other", name: "Другая" },
];

const LOLZ_ORIGINS: { value: string; label: string }[] = [
  { value: "", label: "Любой тип" }, { value: "autoreg", label: "Авторег" },
  { value: "fishing", label: "Фишинг" }, { value: "unknown", label: "Неизвестно" },
  { value: "grant", label: "Грант" }, { value: "mix", label: "Микс" },
];

export default function Sessions() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTdataDialogOpen, setIsTdataDialogOpen] = useState(false);

  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeViaApp, setIsCodeViaApp] = useState(false);
  const [tdataFile, setTdataFile] = useState<File | null>(null);
  const [tdataPhone, setTdataPhone] = useState("");
  const [tdataCountry, setTdataCountry] = useState("");
  const [tdataPassword, setTdataPassword] = useState("");
  const [tdataLoading, setTdataLoading] = useState(false);

  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [isCheckDialogOpen, setIsCheckDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [checkingSessionId, setCheckingSessionId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [selling, setSelling] = useState(false);
  const [kicking, setKicking] = useState(false);
  const [kickResult, setKickResult] = useState<string | null>(null);

  const [sellPrice, setSellPrice] = useState("");
  const [sellDescription, setSellDescription] = useState("");
  const [sellCountry, setSellCountry] = useState("");
  const [sellIsFree, setSellIsFree] = useState(false);

  // LolzTeam states
  const [isLolzOpen, setIsLolzOpen] = useState(false);
  const [lolzAccounts, setLolzAccounts] = useState<LolzAccount[]>([]);
  const [lolzLoading, setLolzLoading] = useState(false);
  const [lolzPmin, setLolzPmin] = useState("");
  const [lolzPmax, setLolzPmax] = useState("");
  const [lolzCount, setLolzCount] = useState("20");
  const [lolzIsFree, setLolzIsFree] = useState(false);
  const [lolzCountry, setLolzCountry] = useState("");
  const [lolzOrigin, setLolzOrigin] = useState("");
  const [lolzHasPassword, setLolzHasPassword] = useState(false);
  const [lolzHasPremium, setLolzHasPremium] = useState(false);
  const [lolzNoSpam, setLolzNoSpam] = useState(false);
  const [lolzApiCode, setLolzApiCode] = useState(false);
  const [lolzAccountIdMin, setLolzAccountIdMin] = useState("");
  const [lolzAccountIdMax, setLolzAccountIdMax] = useState("");
  const [selectedLolz, setSelectedLolz] = useState<LolzAccount | null>(null);
  const [isLolzDetailOpen, setIsLolzDetailOpen] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const resetDialog = () => {
    setAuthStep("phone");
    setPhone("");
    setCode("");
    setPassword("");
    setIsSubmitting(false);
    setIsCodeViaApp(false);
  };

  const resetSellForm = () => {
    setSellPrice("");
    setSellDescription("");
    setSellCountry("");
    setSellIsFree(false);
  };

  const handleRequestCode = async () => {
    if (!phone.trim()) {
      toast({ title: "Ошибка", description: "Введите номер телефона", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sessions/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCodeViaApp(!!data.isCodeViaApp);
        setAuthStep("code");
        toast({ title: "Код отправлен", description: data.message });
      } else {
        toast({ title: "Ошибка", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет подключения к API", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCode = async (withPassword = false) => {
    if (!code.trim()) {
      toast({ title: "Ошибка", description: "Введите код из Telegram", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sessions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
          ...(withPassword && password ? { password } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Готово", description: data.message });
        setIsDialogOpen(false);
        resetDialog();
        loadSessions();
      } else if (data.needsPassword) {
        setAuthStep("password");
        toast({ title: "Требуется 2FA", description: "Введите пароль двухфакторной аутентификации" });
      } else {
        toast({ title: "Ошибка", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет подключения к API", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить эту сессию?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSessions(prev => prev.filter(s => s.id !== id));
      toast({ title: "Удалено", description: "Сессия удалена" });
    }
  };

  const getSpamLabel = (spam: string | null) => {
    if (!spam || spam === "0" || spam === "none") return null;
    if (spam === "1") return "Спам";
    return `Спам: ${spam}`;
  };

  const getIsoFlag = (code: string | null): string => {
    if (!code) return "";
    const flags: Record<string, string> = {
      ru: "἟7἟a", ua: "἟a἞6", us: "἟a἟8", kz: "἟0἟f", by: "἞7἟e", pl: "἟5἟1",
      de: "἞9἞a", fr: "἞b἟7", it: "἞e἟9", tr: "἟9἟7", in: "἞e἟3", cn: "἞8἟3",
      jp: "἞f἟5", br: "἞7἟7", gb: "἞c἞7", nl: "἟3἟1", uz: "἟a἟f", az: "἞6἟f",
      am: "἞6἟2", ge: "἞c἞a", kg: "἟0἞c", tj: "἟9἞f", md: "἟2἞9", lt: "἟1἟9",
      lv: "἟1἟b", ee: "἞a἞a", ph: "἟5἞d", vn: "἟b἟3", th: "἟9἞d", ng: "἟3἞c",
      pk: "἟5἟0", bd: "἞7἞9", id: "἞e἞9", other: "🌐",
    };
    return flags[code.toLowerCase()] ?? "";
  };

  const handleLolzSearch = async () => {
    setLolzLoading(true);
    setLolzAccounts([]);
    try {
      const params = new URLSearchParams();
      if (lolzPmin) params.set("pmin", lolzPmin);
      if (lolzPmax) params.set("pmax", lolzPmax);
      if (lolzCount) params.set("count", lolzCount);
      if (lolzCountry) params.set("country", lolzCountry);
      if (lolzOrigin) params.set("item_origin", lolzOrigin);
      if (lolzHasPassword) params.set("has_password", "1");
      if (lolzHasPremium) params.set("has_premium", "1");
      if (lolzNoSpam) params.set("spam", "0");
      if (lolzApiCode) params.set("api_code", "1");
      if (lolzAccountIdMin) params.set("account_id_min", lolzAccountIdMin);
      if (lolzAccountIdMax) params.set("account_id_max", lolzAccountIdMax);

      const res = await fetch(`/api/lolz/accounts?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Ошибка запроса");
      }
      const data = await res.json() as LolzAccount[];
      setLolzAccounts(data);
      if (data.length === 0) toast({ title: "Импорт", description: "Аккаунтов не найдено" });
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Ошибка поиска", variant: "destructive" });
    } finally {
      setLolzLoading(false);
    }
  };

  const handleLolzImport = async (acc: LolzAccount) => {
    try {
      const res = await fetch(`/api/lolz/import/${acc.itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: acc.phone,
          country: acc.country ?? "",
          phonePrefix: acc.phone?.substring(0, 2) ?? null,
          dcId: acc.dcId,
          userId: acc.userId,
          price: lolzIsFree ? 0 : acc.price,
          isFree: lolzIsFree ? "true" : "false",
          hasPremium: acc.hasPremium,
          hasPassword: acc.hasPassword,
          spamBlock: acc.spamBlock,
          registrationDate: acc.registrationDate,
          origin: acc.origin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Импортировано", description: data.message });
        setLolzAccounts(prev => prev.filter(a => a.itemId !== acc.itemId));
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось импортировать", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет подключения", variant: "destructive" });
    }
  };

  const getStatusBadge = (s: SessionRecord) => {
    if (s.status === "active" && s.hasSession) {
      return <Badge className="bg-green-500/15 text-green-500 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Активна</Badge>;
    }
    if (s.status === "pending") {
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500/20"><AlertCircle className="w-3 h-3 mr-1" />Ожидание</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Неактивна</Badge>;
  };

  const handleUploadTdata = async () => {
    if (!tdataFile) {
      toast({ title: "Ошибка", description: "Выберите ZIP-файл tdata", variant: "destructive" });
      return;
    }
    setTdataLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", tdataFile);
      if (tdataPhone) formData.append("phone", tdataPhone);
      if (tdataCountry) formData.append("country", tdataCountry);
      if (tdataPassword) formData.append("password", tdataPassword);
      const res = await fetch("/api/sessions/tdata", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Успех", description: data.message });
        setIsTdataDialogOpen(false);
        setTdataFile(null);
        setTdataPhone("");
        setTdataCountry("");
        setTdataPassword("");
        loadSessions();
      } else {
        toast({ title: "Ошибка", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет подключения", variant: "destructive" });
    } finally {
      setTdataLoading(false);
    }
  };

  const handleCheck = async (sessionId: number) => {
    setChecking(true);
    setCheckingSessionId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/check`, { method: "POST" });
      const data = await res.json() as CheckResult;
      if (data.success) {
        setSelectedSessionId(sessionId);
        setCheckResult(data);
        setIsCheckDialogOpen(true);
      } else {
        toast({ title: "Ошибка проверки", description: data.error || "Не удалось проверить аккаунт", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет подключения к API", variant: "destructive" });
    } finally {
      setChecking(false);
      setCheckingSessionId(null);
    }
  };

  const handleOpenSell = () => {
    setIsCheckDialogOpen(false);
    resetSellForm();
    setSellCountry(checkResult?.country ?? "");
    setIsSellDialogOpen(true);
  };

  const handleKick = async () => {
    if (!selectedSessionId) return;
    setKicking(true);
    setKickResult(null);
    try {
      const res = await fetch(`/api/sessions/${selectedSessionId}/kick-others`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        let msg = data.message;
        if (data.skippedRecent?.length > 0) {
          msg += "\n\nНе кикнуто (< 24 ч):\n" + data.skippedRecent.join("\n");
        }
        setKickResult(msg);
        toast({ title: "Кик выполнен", description: data.message });
      } else {
        setKickResult("Ошибка: " + (data.error || "Не удалось выполнить"));
        toast({ title: "Ошибка кика", description: data.error || "Не удалось выполнить", variant: "destructive" });
      }
    } catch {
      setKickResult("Ошибка: нет подключения к API");
      toast({ title: "Ошибка", description: "Нет подключения к API", variant: "destructive" });
    } finally {
      setKicking(false);
    }
  };

  const handleSell = async () => {
    if (!sellPrice && !sellIsFree) {
      toast({ title: "Ошибка", description: "Укажите цену или отметьте как бесплатный", variant: "destructive" });
      return;
    }
    if (!checkResult?.phone) {
      toast({ title: "Ошибка", description: "Нет данных аккаунта", variant: "destructive" });
      return;
    }
    setSelling(true);
    try {
      const res = await fetch(`/api/sessions/${selectedSessionId}/create-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: sellIsFree ? 0 : parseFloat(sellPrice) || 0,
          description: sellDescription,
          country: sellCountry || undefined,
          isFree: sellIsFree ? "true" : "false",
          spamBlock: checkResult.spamBlock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Успех", description: data.message || "Аккаунт добавлен на продажу" });
        setIsSellDialogOpen(false);
        resetSellForm();
        setCheckResult(null);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось добавить аккаунт", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет подключения к API", variant: "destructive" });
    } finally {
      setSelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Сессии Telegram</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Авторизованные аккаунты для работы с API Telegram.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Button variant="outline" onClick={() => { setIsTdataDialogOpen(true); }}>
            <Upload className="w-4 h-4 mr-2" />
            Загрузить tdata
          </Button>
          <Button onClick={() => { resetDialog(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить сессию
          </Button>
        </div>
      </div>

      {/* Info card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Как это работает:</strong> добавьте Telegram-аккаунт через авторизацию (номер телефона → код).
            Сессия сохраняется на сервере и может использоваться для работы с аккаунтами.
            Для работы необходимо настроить <strong className="text-foreground">API ID</strong> и <strong className="text-foreground">API Hash</strong> в разделе{" "}
            <a href="/settings" className="text-primary underline">Настройки</a> (получить на{" "}
            <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-primary underline">my.telegram.org</a>).
          </p>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Sessions list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Активные сессии</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Smartphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Сессий нет. Добавьте первую.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-medium text-sm">{s.phone}</span>
                          {s.firstName && <span className="text-muted-foreground text-sm">{s.firstName}</span>}
                          {getStatusBadge(s)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {s.userId && `ID: ${s.userId} · `}
                          Добавлена {format(new Date(s.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCheck(s.id)}
                        disabled={checking && checkingSessionId === s.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        {checking && checkingSessionId === s.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Store className="w-4 h-4 mr-1" />
                            Залить
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: LolzTeam Import */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-4 h-4" />
              Импорт LolzTeam
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Поиск и импорт Telegram аккаунтов с LolzTeam Market. API ключ задаётся в <a href="/settings" className="text-primary underline">Настройках</a>.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Мин. цена ($)</Label>
                  <Input value={lolzPmin} onChange={e => setLolzPmin(e.target.value)} placeholder="0" type="number" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Макс. цена ($)</Label>
                  <Input value={lolzPmax} onChange={e => setLolzPmax(e.target.value)} placeholder="100" type="number" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Кол-во</Label>
                  <Input value={lolzCount} onChange={e => setLolzCount(e.target.value)} placeholder="20" type="number" min="1" max="100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs flex items-center gap-1"><Globe className="w-3 h-3" />Страна</Label>
                  <select
                    value={lolzCountry}
                    onChange={e => setLolzCountry(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Любая</option>
                    {LOLZ_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Тип аккаунта</Label>
                  <select
                    value={lolzOrigin}
                    onChange={e => setLolzOrigin(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {LOLZ_ORIGINS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="flex items-center gap-2">
                  <Switch id="lp" checked={lolzHasPassword} onCheckedChange={setLolzHasPassword} />
                  <Label htmlFor="lp" className="text-xs cursor-pointer flex items-center gap-1"><Key className="w-3 h-3 text-orange-400" />2FA</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="lpr" checked={lolzHasPremium} onCheckedChange={setLolzHasPremium} />
                  <Label htmlFor="lpr" className="text-xs cursor-pointer flex items-center gap-1"><Crown className="w-3 h-3 text-yellow-400" />Premium</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="lns" checked={lolzNoSpam} onCheckedChange={setLolzNoSpam} />
                  <Label htmlFor="lns" className="text-xs cursor-pointer flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-green-400" />Без спама</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="lac" checked={lolzApiCode} onCheckedChange={setLolzApiCode} />
                  <Label htmlFor="lac" className="text-xs cursor-pointer flex items-center gap-1"><Wifi className="w-3 h-3 text-blue-400" />Код API</Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="lf" checked={lolzIsFree} onCheckedChange={setLolzIsFree} />
                <Label htmlFor="lf" className="text-xs cursor-pointer"><Star className="w-3 h-3 inline mr-1 text-yellow-400" />Выставить как бесплатный</Label>
              </div>

              <Button onClick={handleLolzSearch} disabled={lolzLoading} className="w-full">
                {lolzLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Поиск...</>
                  : <><Search className="mr-2 h-4 w-4" /> Найти аккаунты</>}
              </Button>

              {lolzAccounts.length > 0 && (
                <div className="border rounded-md divide-y max-h-80 overflow-y-auto">
                  {lolzAccounts.map(acc => (
                    <div key={acc.itemId} className="flex items-center justify-between p-3 gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate mb-1" title={acc.title}>{acc.title}</div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {acc.country && (
                            <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded font-medium">{getIsoFlag(acc.country)} {acc.country}</span>
                          )}
                          {acc.dcId && (
                            <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">DC {acc.dcId}</span>
                          )}
                          {acc.idDigitCount && (
                            <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">{acc.idDigitCount} цифр</span>
                          )}
                          {acc.origin && (
                            <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded capitalize">{acc.origin}</span>
                          )}
                          {acc.hasPremium && (
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" />Premium</span>
                          )}
                          {acc.hasPassword && (
                            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><Key className="w-2.5 h-2.5" />2FA</span>
                          )}
                          {acc.canGetCode && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><Wifi className="w-2.5 h-2.5" />API</span>
                          )}
                          {getSpamLabel(acc.spamBlock) && (
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-medium">{getSpamLabel(acc.spamBlock)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-primary">${acc.price}</span>
                        <Button size="sm" onClick={() => handleLolzImport(acc)}>
                          Импорт
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auth dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); setIsDialogOpen(open); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              {authStep === "phone" && "Добавить сессию"}
              {authStep === "code" && "Введите код"}
              {authStep === "password" && "Двухфакторная защита"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {authStep === "phone" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Введите номер телефона Telegram-аккаунта. Вам придёт код подтверждения.
                </p>
                <div className="space-y-1.5">
                  <Label>Номер телефона</Label>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+79991234567"
                    onKeyDown={e => e.key === "Enter" && handleRequestCode()}
                  />
                </div>
                <Button className="w-full" onClick={handleRequestCode} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Отправка кода...</> : "Получить код"}
                </Button>
              </>
            )}

            {authStep === "code" && (
              <>
                {isCodeViaApp ? (
                  <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                    <strong>📱 Код в Telegram-приложении</strong><br />
                    Откройте Telegram на устройстве, где уже авторизован аккаунт <strong>{phone}</strong>. Вам пришло уведомление с кодом входа.
                  </div>
                ) : (
                  <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700 dark:text-green-300">
                    <strong>📲 Код отправлен по SMS</strong><br />
                    Проверьте SMS на номере <strong>{phone}</strong>.
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Код подтверждения</Label>
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="12345"
                    maxLength={8}
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && handleConfirmCode()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setAuthStep("phone")} disabled={isSubmitting}>
                    Назад
                  </Button>
                  <Button className="flex-1" onClick={() => handleConfirmCode()} disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Проверка...</> : "Подтвердить"}
                  </Button>
                </div>
              </>
            )}

            {authStep === "password" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Аккаунт защищён двухфакторной аутентификацией. Введите пароль.
                </p>
                <div className="space-y-1.5">
                  <Label>Пароль 2FA</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Пароль"
                    onKeyDown={e => e.key === "Enter" && handleConfirmCode(true)}
                  />
                </div>
                <Button className="w-full" onClick={() => handleConfirmCode(true)} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Проверка...</> : "Войти"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Check Account Dialog */}
      <Dialog open={isCheckDialogOpen} onOpenChange={setIsCheckDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Данные аккаунта
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {checkResult && (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Номер</Label>
                    <div className="font-mono">{checkResult.phone || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">ID</Label>
                    <div className="font-mono">{checkResult.userId || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">DC</Label>
                    <div className="font-mono">{checkResult.dcId || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Имя</Label>
                    <div>{checkResult.firstName || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Premium</Label>
                    <div>{checkResult.hasPremium ? "Да" : "Нет"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">2FA</Label>
                    <div>{checkResult.hasPassword ? "Включен" : "Нет"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Спамблок</Label>
                    <div className={checkResult.spamBlock === "Отсутствует" ? "text-green-600" : "text-red-600"}>
                      {checkResult.spamBlock || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Страна</Label>
                    <div>{checkResult.country || "—"}</div>
                  </div>
                </div>
                {checkResult.authKey && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Auth Key</Label>
                    <div className="font-mono text-xs break-all bg-muted p-2 rounded">{checkResult.authKey.substring(0, 64)}...</div>
                  </div>
                )}
                {checkResult.password && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Пароль 2FA</Label>
                    <div className="font-mono text-xs bg-muted p-2 rounded">{checkResult.password}</div>
                  </div>
                )}
                {kickResult && (
                  <div className="rounded-md bg-muted p-3 text-xs whitespace-pre-wrap text-muted-foreground">
                    {kickResult}
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full text-orange-500 border-orange-500/30 hover:bg-orange-50 hover:text-orange-600"
                    onClick={handleKick}
                    disabled={kicking || !checkResult?.sessionString}
                    title={!checkResult?.sessionString ? "Доступно только для сессий с авторизацией (не tdata)" : undefined}
                  >
                    {kicking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Кикаю...</> : <><Wifi className="w-4 h-4 mr-2" />Кик всех сессий (кроме нашей)</>}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { setIsCheckDialogOpen(false); setKickResult(null); }}>
                      Закрыть
                    </Button>
                    <Button className="flex-1" onClick={handleOpenSell}>
                      <Store className="w-4 h-4 mr-2" />
                      Залить на продажу
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Account Dialog */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Карточка товара
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Аккаунт: <strong>{checkResult?.phone}</strong> (ID: {checkResult?.userId})
            </p>

            <div className="space-y-1.5">
              <Label>Цена ($)</Label>
              <Input
                type="number"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                placeholder="0"
                disabled={sellIsFree}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={sellIsFree}
                onChange={e => setSellIsFree(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isFree" className="text-sm cursor-pointer">Бесплатный аккаунт</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Input
                value={sellDescription}
                onChange={e => setSellDescription(e.target.value)}
                placeholder="Авторег Россия, без спам-блока..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Страна аккаунта</Label>
              <select
                value={sellCountry}
                onChange={e => setSellCountry(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Не указана —</option>
                {[
                  "Россия","США","Украина","Казахстан","Беларусь","Узбекистан",
                  "Азербайджан","Армения","Грузия","Кыргызстан","Таджикистан","Молдова",
                  "Литва","Латвия","Эстония","Польша","Германия","Франция",
                  "Великобритания","Нидерланды","Турция","Индия","Индонезия","Бразилия",
                  "Филиппины","Вьетнам","Таиланд","Нигерия","Пакистан","Бангладеш",
                  "Другая",
                ].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-muted-foreground">
              Спамблок: <span className={checkResult?.spamBlock === "Отсутствует" ? "text-green-600" : "text-red-600"}>{checkResult?.spamBlock}</span>
              {checkResult?.hasPassword && " · Пароль 2FA сохранён"}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsSellDialogOpen(false)}>
                Отмена
              </Button>
              <Button className="flex-1" onClick={handleSell} disabled={selling}>
                {selling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Сохранение...</> : "Залить на продажу"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TData Upload Dialog */}
      <Dialog open={isTdataDialogOpen} onOpenChange={(open) => { setIsTdataDialogOpen(open); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Загрузить tdata
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Загрузите ZIP-архив с tdata-папкой. Сессия будет извлечена автоматически.
            </p>
            <div className="space-y-1.5">
              <Label>ZIP-файл tdata</Label>
              <Input type="file" accept=".zip" onChange={(e) => setTdataFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-1.5">
              <Label>Номер телефона (необязательно)</Label>
              <Input value={tdataPhone} onChange={e => setTdataPhone(e.target.value)} placeholder="+79991234567" />
            </div>
            <div className="space-y-1.5">
              <Label>Страна (необязательно)</Label>
              <Input value={tdataCountry} onChange={e => setTdataCountry(e.target.value)} placeholder="Россия" />
            </div>
            <div className="space-y-1.5">
              <Label>Пароль 2FA (если включен)</Label>
              <Input type="password" value={tdataPassword} onChange={e => setTdataPassword(e.target.value)} placeholder="Пароль двухфакторной аутентификации" />
            </div>
            <Button className="w-full" onClick={handleUploadTdata} disabled={tdataLoading}>
              {tdataLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Загрузка...</> : "Создать сессию"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
