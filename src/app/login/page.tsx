"use client"; // <--- 1. Obrigatório para usar Tabs

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Wallet className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">MyFinPocket</h1>
          <p className="text-slate-500">Controle suas finanças com simplicidade.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>
          
          {/* ABA DE LOGIN */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Acesse sua conta para ver seus lançamentos.
                </CardDescription>
              </CardHeader>

              <form action={async (formData: FormData) => { await login(formData); }}>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Entrar
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* ABA DE CADASTRO */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Comece a controlar seu dinheiro hoje.
                </CardDescription>
              </CardHeader>
              
              <form action={async (formData: FormData) => { await signup(formData); }}>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" name="name" placeholder="Ex: Pedro Silva" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email-signup">E-mail</Label>
                    <Input id="email-signup" name="email" type="email" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password-signup">Senha</Label>
                    <Input id="password-signup" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Cadastrar-se
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}