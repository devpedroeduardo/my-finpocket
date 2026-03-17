"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Lock, Loader2, Bell, Settings, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateProfile, getEmailPreference, toggleEmailPreference } from "@/app/actions/profile";
import { ProfileGeneralTab } from "@/components/profile-general-tab";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);

  useEffect(() => {
    async function loadData() {
      const emailPref = await getEmailPreference();
      setIsEmailEnabled(emailPref);
      setIsLoading(false);
    }
    loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Senha atualizada com sucesso!");
      const passwordInput = document.getElementById("password") as HTMLInputElement;
      if (passwordInput) passwordInput.value = "";
    }
    
    setIsSaving(false);
  }

  async function handleToggleEmail(checked: boolean) {
    setIsEmailEnabled(checked);
    
    const result = await toggleEmailPreference(checked);
    
    if (result?.error) {
      setIsEmailEnabled(!checked);
      toast.error(result.error);
    } else {
      toast.success(checked ? "Notificações ativadas!" : "Notificações desativadas.");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Configurações da Conta</h1>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general" className="gap-2"><User className="w-4 h-4"/> Geral</TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2"><Settings className="w-4 h-4"/> Preferências</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Lock className="w-4 h-4"/> Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <ProfileGeneralTab />
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Sistema</CardTitle>
                <CardDescription>Configure como o MyFinPocket funciona para você.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-blue-500"/> Notificações por E-mail</Label>
                    <p className="text-sm text-slate-500">Receba resumos semanais de gastos.</p>
                  </div>
                  <Switch 
                    checked={isEmailEnabled} 
                    onCheckedChange={handleToggleEmail} 
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2"><Settings className="w-4 h-4 text-slate-500"/> Moeda Principal</Label>
                    <p className="text-sm text-slate-500">Moeda usada na Dashboard.</p>
                  </div>
                  <div className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">BRL (R$)</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>Mantenha sua conta protegida.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Alterar Senha</Label>
                    <Input id="password" name="password" type="password" placeholder="Digite a nova senha (mínimo 8 caracteres)" minLength={8} />
                    <p className="text-xs text-slate-500">Deixe em branco se não quiser alterar.</p>
                  </div>

                  <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar Senha"}
                  </Button>

                  <div className="pt-6 mt-6 border-t border-red-100 dark:border-red-900/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4"/> Zona de Perigo
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">Isso apagará todos os seus dados e transações permanentemente.</p>
                      </div>
                      <Button type="button" variant="destructive" onClick={() => alert("Em breve: Fluxo de exclusão de conta.")}>
                        Excluir Conta
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </form>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}