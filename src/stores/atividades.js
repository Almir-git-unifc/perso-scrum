import { defineStore } from "pinia";

export const useAtividadesStore = defineStore("atividades", {
  state: () => ({
    atividades: [],
    // Cada tela aceita até 3 alertas reativos armazenados
    alertasPorTela: {
      cadastro: [],
      backlog: [],
      hoje: [],
      ontem: [],
      impedimentos: [],
      metas: []
    },
  }),

  actions: {
    // === MÉTODOS DE ATIVIDADES ===
    adicionarAtividade(atividade) {
      const hojeStr = new Date().toISOString().split("T")[0];

      const novoItem = {
        ...atividade,
        id: Date.now().toString(),
        dataCriacao: hojeStr,
        dataEntradaBacklog: atividade.telaDestino === "backlog" ? hojeStr : null,
        concluida: false,
        dataConclusao: null,
        detalhesDia: "",
      };

      this.atividades.push(novoItem);
      this.salvarLocal();
    },

    atualizarAtividade(id, alteracoes) {
      const index = this.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        this.atividades[index] = { ...this.atividades[index], ...alteracoes };
        this.salvarLocal();
      }
    },

    excluirAtividade(id) {
      this.atividades = this.atividades.filter((a) => a.id !== id);
      this.salvarLocal();
    },

    moverParaHoje(id) {
      this.atualizarAtividade(id, { telaDestino: "hoje", status: "Já selecionado" });
    },

    marcarConcluida(id, statusConclusao) {
      const index = this.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        const hojeStr = new Date().toISOString().split("T")[0];
        this.atividades[index] = {
          ...this.atividades[index],
          concluida: statusConclusao,
          dataConclusao: statusConclusao ? hojeStr : null,
        };
        this.salvarLocal();
      }
    },

    moverParaBacklog(id) {
      const index = this.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        const hojeStr = new Date().toISOString().split("T")[0];
        this.atividades[index] = {
          ...this.atividades[index],
          telaDestino: "backlog",
          dataEntradaBacklog: hojeStr,
          impedida: false,
        };
        this.salvarLocal();
      }
    },

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
          },
        };
        this.salvarLocal();
      }
    },

    // === MÉTODOS DE ALERTAS (CORRIGIDOS) ===
    adicionarAlerta(tela, texto, tipo = 'info') {
      if (!this.alertasPorTela[tela]) {
        this.alertasPorTela[tela] = [];
      }
      if (this.alertasPorTela[tela].length >= 3) {
        alert("Limite máximo de 3 alertas atingido para esta tela!");
        return false;
      }
      this.alertasPorTela[tela].push({
        id: Date.now().toString(),
        texto: texto.trim(),
        tipo: tipo
      });
      this.salvarLocal();
      return true;
    },

    atualizarAlerta(tela, id, novoTexto, novoTipo) {
      if (this.alertasPorTela[tela]) {
        const index = this.alertasPorTela[tela].findIndex(a => a.id === id);
        if (index !== -1) {
          this.alertasPorTela[tela][index] = {
            id,
            texto: novoTexto.trim(),
            tipo: novoTipo || 'info'
          };
          this.salvarLocal();
        }
      }
    },

    removerAlerta(tela, id) {
      if (this.alertasPorTela[tela]) {
        this.alertasPorTela[tela] = this.alertasPorTela[tela].filter(a => a.id !== id);
        this.salvarLocal();
      }
    },

    // === PERSISTÊNCIA ===
    salvarLocal() {
      localStorage.setItem("scrum_atividades", JSON.stringify(this.atividades));
      localStorage.setItem("scrum_alertas", JSON.stringify(this.alertasPorTela));
    },

    carregarLocal() {
      const atividadesSalvas = localStorage.getItem("scrum_atividades");
      if (atividadesSalvas) {
        this.atividades = JSON.parse(atividadesSalvas);
      }

      const alertasSalvos = localStorage.getItem("scrum_alertas");
      if (alertasSalvos) {
        try {
          const parsed = JSON.parse(alertasSalvos);
          // Limpa e migra garantindo arrays válidos por tela
          Object.keys(parsed).forEach((tela) => {
            if (Array.isArray(parsed[tela])) {
              // Filtra alertas válidos (com texto)
              this.alertasPorTela[tela] = parsed[tela].filter(a => a && a.texto && a.texto.trim() !== "");
            }
          });
        } catch (e) {
          console.error("Erro ao carregar alertas:", e);
        }
      }
    },
  },
});