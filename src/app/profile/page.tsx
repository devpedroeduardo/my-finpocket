"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, User, Lock, Save, Loader2, Camera, Bell, Settings, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getUserProfile, updateProfile } from "@/app/actions/profile";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getUserProfile();
      if (data) {
        setEmail(data.email || "");
        setName(data.name || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Cria um preview da imagem antes de salvar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Perfil atualizado com sucesso!");
      (document.getElementById("password") as HTMLInputElement).value = "";
      
      // Atualiza a foto atual se houver novo preview
      if (avatarPreview) {
        setAvatarUrl(avatarPreview);
        setAvatarPreview(null);
      }
    }
    
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Função para pegar as iniciais do nome para o Avatar Fallback
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "US";

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

          {/* ABA 1: DADOS GERAIS */}
          <TabsContent value="general">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                  <CardDescription>
                    Gerencie sua identidade visual e informações de contato.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Foto de Perfil */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                    <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-sm">
                      <AvatarImage src={avatarPreview || avatarUrl} className="object-cover" />
                      <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col items-center sm:items-start space-y-2">
                      <Label className="text-base font-medium">Foto de Perfil</Label>
                      <p className="text-sm text-slate-500 text-center sm:text-left">
                        Recomendado: JPG ou PNG quadrados de até 2MB.
                      </p>
                      <input 
                        type="file" 
                        id="avatar" 
                        name="avatar" 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 mt-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4" />
                        Escolher nova foto
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone / WhatsApp</Label>
                      <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail (Login)</Label>
                    <Input id="email" type="email" value={email} disabled className="bg-slate-100 dark:bg-slate-900 cursor-not-allowed" />
                  </div>

                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t px-6 py-4">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* ABA 2: PREFERÊNCIAS (Mock visual por enquanto) */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Sistema</CardTitle>
                <CardDescription>Configure como o MyFinPocket funciona para você.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-blue-500"/> Notificações por E-mail</Label>
                    <p className="text-sm text-slate-500">Receba resumos semanais de gastos.</p>
                  </div>
                  <Button variant="outline" disabled>Em breve</Button>
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

          {/* ABA 3: SEGURANÇA */}
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