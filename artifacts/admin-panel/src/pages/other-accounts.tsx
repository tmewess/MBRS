import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const SERVICES = [
  { value: "TikTok", label: "TikTok", color: "#010101", bg: "#f0f0f0" },
  { value: "YouTube", label: "YouTube", color: "#FF0000", bg: "#fff0f0" },
  { value: "Instagram", label: "Instagram", color: "#E1306C", bg: "#fff0f5" },
  { value: "Facebook", label: "Facebook", color: "#1877F2", bg: "#f0f5ff" },
  { value: "Twitter / X", label: "Twitter / X", color: "#000000", bg: "#f5f5f5" },
  { value: "Spotify", label: "Spotify", color: "#1DB954", bg: "#f0fff5" },
  { value: "Steam", label: "Steam", color: "#1b2838", bg: "#f0f5ff" },
  { value: "Discord", label: "Discord", color: "#5865F2", bg: "#f0f2ff" },
  { value: "VK", label: "ВКонтакте", color: "#0077FF", bg: "#f0f7ff" },
  { value: "Twitch", label: "Twitch", color: "#9147FF", bg: "#f5f0ff" },
  { value: "Reddit", label: "Reddit", color: "#FF4500", bg: "#fff3f0" },
  { value: "Pinterest", label: "Pinterest", color: "#E60023", bg: "#fff0f0" },
  { value: "LinkedIn", label: "LinkedIn", color: "#0A66C2", bg: "#f0f7ff" },
  { value: "Snapchat", label: "Snapchat", color: "#FFFC00", bg: "#fffef0" },
  { value: "Other", label: "Другое", color: "#6b7280", bg: "#f5f5f5" },
];

function getServiceInfo(service: string) {
  return SERVICES.find(s => s.value === service) ?? { value: service, label: service, color: "#6b7280", bg: "#f5f5f5" };
}

const STATUS_LABELS: Record<string, string> = {
  available: "Доступен",
  sold: "Продан",
};

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
  createdAt: string;
  soldAt: string | null;
}

export default function OtherAccounts() {
  const [accounts, setAccounts] = useState<<OtherAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [service, setService] = useState("TikTok");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [description, setDescription] = useState("");
  const [preDescription, setPreDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);

  const resetForm = () => {
    setService("TikTok");
    setLogin("");
    setPassword("");
    setEmail("");
    setEmailPassword("");
    setDescription("");
    setPreDescription("");
    setPrice("");
    setIsFree(false);
  };

  const loadAccounts = () => {
    setIsLoading(true);
    let url = "/api/other-accounts";
    if (statusFilter !== "all") url += `?status=${statusFilter}`;
    fetch(url)
      .then(r => r.json())
      .then((data: OtherAccount[]) => {
        const filtered = statusFilter !== "all"
          ? data.filter(a => a.status === statusFilter)
          : data;
        setAccounts(filtered || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { loadAccounts(); }, [statusFilter]);

  const handleSave = async () => {
    if (!login || !password) {
      toast({ title: "Ошибка", description: "Логин и пароль обязательны", variant: "destructive" });
      return;
    }
    if (!isFree && !price) {
      toast({ title: "Ошибка", description: "Укажите цену или отметьте как бесплатный", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/other-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          login,
          password,
          email: email || undefined,
          emailPassword: emailPassword || undefined,
          description: description || undefined,
          preDescription: preDescription || undefined,
          price: isFree ? 0 : parseFloat(price) || 0,
          isFree: isFree ? "true" : "false",
        }),
      });
      const data = await res.json() as OtherAccount;
      if (data.id) {
        loadAccounts();
        setIsOpen(false);
        resetForm();
        toast({ title: "Успешно", description: `Товар #${data.id} добавлен` });
      } else {
        toast({ title: "Ошибка", description: "Не удалось добавить", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот товар?")) return;
    const res = await fetch(`/api/other-accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAccounts();
      toast({ title: "Удалено" });
    } else {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Прочее</h2>
          <p className="text-sm text-muted-foreground mt-1">Аккаунты других соцсетей и сервисов</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="available">Доступные</SelectItem>
              <SelectItem value="sold">Проданные</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новый товар (Прочее)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid gap-1.5">
                  <Label>Сервис</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                            {s.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Логин *</Label>
                    <Input value={login} onChange={e => setLogin(e.target.value)} placeholder="username" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Пароль *</Label>
                    <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="password123" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Почта (если есть)</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@mail.com" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Пароль от почты</Label>
                    <Input value={emailPassword} onChange={e => setEmailPassword(e.target.value)} placeholder="mailpass" />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label>Описание до покупки</Label>
                  <Textarea value={preDescription} onChange={e => setPreDescription(e.target.value)} placeholder="Что покупатель видит перед покупкой..." rows={2} />
                </div>

                <div className="grid gap-1.5">
                  <Label>Описание после покупки</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Инструкции, дополнительные данные..." rows={2} />
                </div>

                <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Switch id="free-switch" checked={isFree} onCheckedChange={setIsFree} />
                    <Label htmlFor="free-switch" className="cursor-pointer flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400" /> Бесплатно
                    </Label>
                  </div>
                  {!isFree && (
                    <div className="grid gap-1.5">
                      <Label>Цена (Stars) *</Label>
                      <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="100" min={1} />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Сохранение..." : "Добавить"}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Загрузка...</div>
          ) : accounts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-sm">Товаров пока нет</p>
              <p className="text-xs text-muted-foreground mt-1">Нажмите «Добавить товар»</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Сервис</TableHead>
                  <TableHead>Логин</TableHead>
                  <TableHead>Почта</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Добавлен</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map(acc => {
                  const svc = getServiceInfo(acc.service);
                  const isFreeItem = acc.isFree === "true" || acc.price === 0;
                  return (
                    <TableRow key={acc.id}>
                      <TableCell className="text-muted-foreground text-xs font-mono">{acc.id}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: svc.bg, color: svc.color, border: `1px solid ${svc.color}22` }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: svc.color }} />
                          {svc.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[140px] truncate">{acc.login}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {acc.email ?? <span className="opacity-40">--</span>}
                      </TableCell>
                      <TableCell>
                        {isFreeItem ? (
                          <span className="text-emerald-500 text-xs font-semibold">Бесплатно</span>
                        ) : (
                          <span className="text-xs font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {acc.price}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={acc.status === "available" ? "default" : "secondary"} className="text-xs">
                          {STATUS_LABELS[acc.status] ?? acc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(acc.createdAt), "dd.MM.yy", { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(acc.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Итого: {accounts.length} позиций · {accounts.filter(a => a.status === "available").length} доступно · {accounts.filter(a => a.status === "sold").length} продано
      </div>
    </div>
  );
}