import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface BotSettings {
  id?: number;
  botToken: string;
  welcomeMessage: string;
  supportUsername: string;
  paymentYookassaEnabled: boolean;
  yookassaShopId: string;
  yookassaSecretKey: string;
  paymentStarsEnabled: boolean;
  paymentCryptoEnabled: boolean;
  cryptoBotToken: string;
  lolzApiKey: string;
  tgApiId: string;
  tgApiHash: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<BotSettings>({
    botToken: "",
    welcomeMessage: "",
    supportUsername: "",
    paymentYookassaEnabled: false,
    yookassaShopId: "",
    yookassaSecretKey: "",
    paymentStarsEnabled: false,
    paymentCryptoEnabled: false,
    cryptoBotToken: "",
    lolzApiKey: "",
    tgApiId: "",
    tgApiHash: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/bot/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          botToken: data.botToken || "",
          welcomeMessage: data.welcomeMessage || "",
          supportUsername: data.supportUsername || "",
          paymentYookassaEnabled: data.paymentYookassaEnabled || false,
          yookassaShopId: data.yookassaShopId || "",
          yookassaSecretKey: data.yookassaSecretKey || "",
          paymentStarsEnabled: data.paymentStarsEnabled || false,
          paymentCryptoEnabled: data.paymentCryptoEnabled || false,
          cryptoBotToken: data.cryptoBotToken || "",
          lolzApiKey: data.lolzApiKey || "",
          tgApiId: data.tgApiId || "",
          tgApiHash: data.tgApiHash || "",
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: keyof BotSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/bot/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast({ title: "Успешно", description: "Настройки сохранены" });
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-muted-foreground">Загрузка...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Настройки</h2>
        <p className="text-muted-foreground mt-2">Настройка бота и платёжных шлюзов.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Настройки бота</CardTitle>
            <CardDescription>Основные настройки Telegram бота</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Токен бота</Label>
              <Input type="password" value={settings.botToken} onChange={(e) => handleChange("botToken", e.target.value)} placeholder="123456789:ABCdefGHIjklMNO..." />
            </div>
            <div>
              <Label>Приветственное сообщение</Label>
              <Input value={settings.welcomeMessage} onChange={(e) => handleChange("welcomeMessage", e.target.value)} placeholder="Добро пожаловать в наш магазин!" />
            </div>
            <div>
              <Label>Username поддержки</Label>
              <Input value={settings.supportUsername} onChange={(e) => handleChange("supportUsername", e.target.value)} placeholder="support_admin" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Способы оплаты</CardTitle>
            <CardDescription>Настройка платёжных шлюзов</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">⭐ Telegram Stars</h4>
                  <p className="text-sm text-muted-foreground">Принимать нативные Telegram Stars</p>
                </div>
                <Switch checked={settings.paymentStarsEnabled} onCheckedChange={(v) => handleChange("paymentStarsEnabled", v)} />
              </div>
            </div>

            <div className="space-y-4 border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">₿ Crypto Bot</h4>
                  <p className="text-sm text-muted-foreground">Принимать оплату криптовалютой</p>
                </div>
                <Switch checked={settings.paymentCryptoEnabled} onCheckedChange={(v) => handleChange("paymentCryptoEnabled", v)} />
              </div>
              {settings.paymentCryptoEnabled && (
                <div className="pt-4 border-t">
                  <Label>Crypto Bot API Token</Label>
                  <Input type="password" value={settings.cryptoBotToken} onChange={(e) => handleChange("cryptoBotToken", e.target.value)} placeholder="Токен Crypto Bot" />
                </div>
              )}
            </div>

            <div className="space-y-4 border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">💳 ЮKassa</h4>
                  <p className="text-sm text-muted-foreground">Принимать оплату банковскими картами</p>
                </div>
                <Switch checked={settings.paymentYookassaEnabled} onCheckedChange={(v) => handleChange("paymentYookassaEnabled", v)} />
              </div>
              {settings.paymentYookassaEnabled && (
                <div className="pt-4 border-t space-y-4">
                  <div>
                    <Label>Shop ID</Label>
                    <Input value={settings.yookassaShopId} onChange={(e) => handleChange("yookassaShopId", e.target.value)} placeholder="123456" />
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <Input type="password" value={settings.yookassaSecretKey} onChange={(e) => handleChange("yookassaSecretKey", e.target.value)} placeholder="live_..." />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Дополнительно</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Lolz API Key</Label>
              <Input type="password" value={settings.lolzApiKey} onChange={(e) => handleChange("lolzApiKey", e.target.value)} placeholder="Ключ Lolz API" />
            </div>
            <div>
              <Label>Telegram API ID</Label>
              <Input value={settings.tgApiId} onChange={(e) => handleChange("tgApiId", e.target.value)} placeholder="12345" />
            </div>
            <div>
              <Label>Telegram API Hash</Label>
              <Input type="password" value={settings.tgApiHash} onChange={(e) => handleChange("tgApiHash", e.target.value)} placeholder="abcdef..." />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSaving} className="w-full">
          {isSaving ? "Сохранение..." : "Сохранить настройки"}
        </Button>
      </form>
    </div>
  );
}
