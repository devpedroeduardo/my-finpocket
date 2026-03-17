"use client";

import { useState, useEffect } from "react";
import { Save, Camera, Loader2 } from "lucide-react";
// Ajuste o caminho de importação do seu cliente Supabase conforme a estrutura do seu projeto
import { createClient } from "@/lib/supabase/client";

export function ProfileGeneralTab() {
  const supabase = createClient();
  
  // O estado começa vazio, esperando os dados reais do banco
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    dataNascimento: "",
    profissao: "",
    cidade: "",
    estado: "",
  });

  // Dois estados de carregamento separados: um para a tela abrir, outro para o botão salvar
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  // 1. Busca os dados assim que o componente é montado na tela
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) throw new Error("Usuário não autenticado");

        // Busca o perfil na tabela 'profiles' associado a este usuário
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Erro ao buscar perfil:", profileError);
        }

        // Preenche os inputs com os dados que vieram do banco
        if (profile) {
          setFormData({
            nome: profile.full_name || "",
            telefone: profile.phone || "",
            email: user.email || "", 
            dataNascimento: profile.birth_date || "",
            profissao: profile.profession || "",
            cidade: profile.city || "",
            estado: profile.state || "",
          });
        } else {
          // Se o perfil não existir na tabela ainda, pelo menos preenche o e-mail
          setFormData(prev => ({ ...prev, email: user.email || "" }));
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
      } finally {
        setIsPageLoading(false);
      }
    }

    fetchUserData();
  }, [supabase]);

  // 2. Atualiza o estado conforme o usuário digita
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFeedbackMsg({ text: "", type: "" }); // Limpa a mensagem de sucesso/erro ao digitar
  };

  // 3. Salva as alterações no banco de dados
  const handleSave = async () => {
    setIsSaving(true);
    setFeedbackMsg({ text: "", type: "" });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada");

      // Atualiza (ou insere) os dados na tabela 'profiles' usando upsert
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id, // Chave primária obrigatória
          full_name: formData.nome,
          phone: formData.telefone,
          birth_date: formData.dataNascimento,
          profession: formData.profissao,
          city: formData.cidade,
          state: formData.estado,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setFeedbackMsg({ text: "Perfil atualizado com sucesso!", type: "success" });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setFeedbackMsg({ text: "Erro ao salvar alterações. Tente novamente.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Tela de carregamento enquanto o banco responde na primeira vez
  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center w-full max-w-3xl h-64 bg-[#0f172a] border border-slate-800 rounded-xl">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden w-full max-w-3xl">
      
      {/* Cabeçalho */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Dados Pessoais</h2>
          <p className="text-sm text-slate-400 mt-1">
            Gerencie sua identidade visual e informações de contato.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Seção da Foto */}
        <div className="flex items-center gap-6 p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold shrink-0 uppercase">
            {formData.nome ? formData.nome.substring(0, 2) : "User"}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-1">Foto de Perfil</h3>
            <p className="text-xs text-slate-400 mb-3">Recomendado: JPG ou PNG quadrados de até 2MB.</p>
            <button className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors border border-slate-700">
              <Camera className="w-4 h-4" />
              Escolher nova foto
            </button>
          </div>
        </div>

        {/* Grid do Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full bg-[#0B1120] border border-slate-800 rounded-md px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Data de Nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              className="w-full bg-[#0B1120] border border-slate-800 rounded-md px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Telefone / WhatsApp</label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full bg-[#0B1120] border border-slate-800 rounded-md px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Profissão / Ocupação</label>
            <input
              type="text"
              name="profissao"
              placeholder="Ex: Desenvolvedor, Médico, Estudante..."
              value={formData.profissao}
              onChange={handleChange}
              className="w-full bg-[#0B1120] border border-slate-800 rounded-md px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Cidade</label>
            <input
              type="text"
              name="cidade"
              placeholder="Sua cidade"
              value={formData.cidade}
              onChange={handleChange}
              className="w-full bg-[#0B1120] border border-slate-800 rounded-md px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full bg-[#0B1120] border border-slate-800 rounded-md px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
            >
              <option value="">Selecione...</option>
              <option value="SP">São Paulo (SP)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="CE">Ceará (CE)</option>
              {/* Adicione outros estados conforme a necessidade do projeto */}
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-800/50">
            <label className="text-sm font-medium text-slate-300">E-mail (Login)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-2.5 text-slate-500 cursor-not-allowed"
              title="A alteração de e-mail deve ser feita na aba Segurança."
            />
          </div>

        </div>
      </div>

      {/* Footer com Botão de Salvar e Feedback */}
      <div className="p-6 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
        
        <div className="text-sm font-medium">
          {feedbackMsg.text && (
            <span className={feedbackMsg.type === "success" ? "text-emerald-500" : "text-red-500"}>
              {feedbackMsg.text}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

    </div>
  );
}