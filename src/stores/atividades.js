import { defineStore } from "pinia";

export const useAtividadesStore = defineStore("atividades", {
  state: () => ({
    atividades: [],
    /** useAtividadesStore usa o Pinia e Agora cada tela possui uma array fixa de 3 mensagens personalizadas  */ 
    alertasPorTela: {
      cadastro: [
        { texto: "", tipo: "info" },
        { texto: "", tipo: "info" },
        { texto: "", tipo: "info" }
      ],
      backlog: [
        { texto: "", tipo: "info" },
        { texto: "", tipo: "info" },
        { texto: "", tipo: "info" }
      ],
      hoje: [
        { texto: "", tipo: "info" },
        { texto: "", tipo: "info" },
        { texto: "", tipo: "info" }
      ],
    },
  }),

  actions: {
    // Adiciona uma nova atividade vinda do Cadastro
    adicionarAtividade(atividade) {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");
      const hojeStr = `${ano}-${mes}-${dia}`;

      // 1. Extrai apenas os dados fornecidos pelo formulário
      const novoItem = {
        ...atividade, // Desestrutura os dados do formulário primeiro
        
        // 2. Sobrescreve e garante as travas de segurança para a NOVA atividade:
        id: Date.now().toString(), // Garante sempre um ID único inédito
        dataCriacao: hojeStr,
        dataEntradaBacklog: atividade.telaDestino === "backlog" ? hojeStr : null,
        concluida: false,          // Força 'false' estrito para o novo item
        dataConclusao: null,       // Força 'null' estrito para o novo item
        detalhesDia: "",
      };

      // Garante a reatividade empurrando o novo objeto isolado
      this.atividades.push(novoItem);

      this.salvarLocal();
    },

    atualizarAtividade(id, alteracoes) {
      /** Method atualziarAtividades recebe @Param id e @Param alteracoes e Atualiza propriedades gerais de uma atividade */
      const index = this.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        this.atividades[index] = { ...this.atividades[index], ...alteracoes };
        this.salvarLocal();
      }
    },

    // Corrigido para usar salvarLocal() e manter o padrão unificado
    excluirAtividade(id) {
      this.atividades = this.atividades.filter(a => a.id !== id);
      this.salvarLocal();
    },

    moverParaHoje(id) {
      this.atualizarAtividade(id, { telaDestino: 'hoje', status: 'Já selecionado' });
    },

    // Controla o fluxo de marcação/desmarcação de conclusão de tarefas
    marcarConcluida(id, statusConclusao) {
      const index = this.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");
        const hojeStr = `${ano}-${mes}-${dia}`;

        this.atividades[index] = {
          ...this.atividades[index],
          concluida: statusConclusao,
          dataConclusao: statusConclusao ? hojeStr : null,
        };

        this.salvarLocal();
      }
    },

    // Move ou devolve uma atividade de volta para o Backlog
    moverParaBacklog(id) {
      const index = this.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");
        const hojeStr = `${ano}-${mes}-${dia}`;

        this.atividades[index] = {
          ...this.atividades[index],
          telaDestino: "backlog",
          dataEntradaBacklog: hojeStr,
          impedida: false
        };
        this.salvarLocal();
      }
    },

    // Move uma atividade para o estado de impedimento com motivo
    moverParaImpedidos(id, tipoImpedimento, motivo) {
      const index = this.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        this.atividades[index] = {
          ...this.atividades[index],
          impedida: true,
          status: "Impedida",
          impedimentoInfo: {
            tipo: tipoImpedimento,
            motivo: motivo,
            dataBloqueio: new Date().toISOString().split("T")[0],
          }
        };
        this.salvarLocal();
      }
    },

    // ATUALIZADO: Salva o texto baseado no índice da mensagem (0, 1 ou 2)
    atualizarAlertaTexto(tela, index, novoTexto) {
      if (this.alertasPorTela[tela] && this.alertasPorTela[tela][index]) {
        this.alertasPorTela[tela][index].texto = novoTexto;
        // Força reatividade profunda na array do Vue/Pinia
        this.alertasPorTela[tela] = [...this.alertasPorTela[tela]];
        this.salvarLocal();
      }
    },

    // ATUALIZADO: Salva o tipo/cor baseado no índice da mensagem (0, 1 ou 2)
    atualizarAlertaTipo(tela, index, novoTipo) {
      if (this.alertasPorTela[tela] && this.alertasPorTela[tela][index]) {
        this.alertasPorTela[tela][index].tipo = novoTipo;
        // Força reatividade profunda na array do Vue/Pinia
        this.alertasPorTela[tela] = [...this.alertasPorTela[tela]];
        this.salvarLocal();
      }
    },

    // Grava permanentemente os dados no localStorage
    salvarLocal() {
      localStorage.setItem("scrum_atividades", JSON.stringify(this.atividades));
      localStorage.setItem("scrum_alertas", JSON.stringify(this.alertasPorTela));
    },

    // Recupera os dados salvos
    carregarLocal() {
      const atividadesSalvas = localStorage.getItem("scrum_atividades");
      if (atividadesSalvas) {
        this.atividades = JSON.parse(atividadesSalvas);
      }

      const alertasSalvos = localStorage.getItem("scrum_alertas");
      if (alertasSalvos) {
        const parsed = JSON.parse(alertasSalvos);

        // Migração estrutural inteligente para evitar quebras se o Storage estiver antigo
        Object.keys(parsed).forEach((tela) => {
          // Se for uma estrutura antiga (objeto único ou string simples)
          if (!Array.isArray(parsed[tela])) {
            const textoAntigo = typeof parsed[tela] === "string" ? parsed[tela] : (parsed[tela].texto || "");
            const tipoAntigo = parsed[tela].tipo || "info";
            
            parsed[tela] = [
              { texto: textoAntigo, tipo: tipoAntigo },
              { texto: "", tipo: "info" },
              { texto: "", tipo: "info" }
            ];
          }
        });

        this.alertasPorTela = parsed;
      }
    },
  },
});