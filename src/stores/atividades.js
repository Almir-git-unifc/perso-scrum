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
      metas: [],
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
        dataEntradaBacklog:
          atividade.telaDestino === "backlog" ? hojeStr : null,
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
      this.atualizarAtividade(id, {
        telaDestino: "hoje",
        status: "Já selecionado",
      });
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
    adicionarAlerta(tela, texto, tipo = "info") {
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
        tipo: tipo,
      });
      this.salvarLocal();
      return true;
    },

    atualizarAlerta(tela, id, novoTexto, novoTipo) {
      if (this.alertasPorTela[tela]) {
        const index = this.alertasPorTela[tela].findIndex((a) => a.id === id);
        if (index !== -1) {
          this.alertasPorTela[tela][index] = {
            id,
            texto: novoTexto.trim(),
            tipo: novoTipo || "info",
          };
          this.salvarLocal();
        }
      }
    },

    removerAlerta(tela, id) {
      if (this.alertasPorTela[tela]) {
        this.alertasPorTela[tela] = this.alertasPorTela[tela].filter(
          (a) => a.id !== id,
        );
        this.salvarLocal();
      }
    },

    // === PERSISTÊNCIA ===
    salvarLocal() {
      localStorage.setItem("scrum_atividades", JSON.stringify(this.atividades));
      localStorage.setItem(
        "scrum_alertas",
        JSON.stringify(this.alertasPorTela),
      );
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
              this.alertasPorTela[tela] = parsed[tela].filter(
                (a) => a && a.texto && a.texto.trim() !== "",
              );
            }
          });
        } catch (e) {
          console.error("Erro ao carregar alertas:", e);
        }
      }
    },

    exportarDadosJSON() {
      /** Coleta todos os dados persistidos no localStorage */ 
      const backupData = {
        /** backupData = backup de localStorage */
        atividades: JSON.parse(
          localStorage.getItem("scrum_atividades") || "[]",
        ),
        alertas: JSON.parse(localStorage.getItem("scrum_alertas") || "{}"),
        devs: JSON.parse(localStorage.getItem("scrum_devs") || "[]"), // ajuste a chave se for diferente
        dataExportacao: new Date().toISOString(),
      };

      // Cria um arquivo blob e dispara o download do .json
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");

      const dataHoje = new Date().toISOString().split("T")[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `scrum_backup_${dataHoje}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    importarDadosJSON(event) {
      /** importarDadosJSON = importa dados de localStorage */
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const conteudo = JSON.parse(e.target.result);

          // Validação básica do arquivo
          if (!conteudo.atividades || !conteudo.alertas) {
            alert("Arquivo de backup inválido!");
            return;
          }

          if (
            confirm(
              "Importar os dados substituirá todas as informações atuais do sistema. Deseja continuar?",
            )
          ) {
            // Atualiza o localStorage
            localStorage.setItem(
              "scrum_atividades",
              JSON.stringify(conteudo.atividades),
            );
            localStorage.setItem(
              "scrum_alertas",
              JSON.stringify(conteudo.alertas),
            );

            if (conteudo.devs) {
              localStorage.setItem("scrum_devs", JSON.stringify(conteudo.devs));
            }

            // Recarrega os dados na Store e atualiza a tela
            this.carregarLocal();
            window.location.reload(); // Recarrega a página para atualizar todas as stores
          }
        } catch (err) {
          alert("Erro ao ler o arquivo JSON de backup: " + err.message);
        }
      };

      reader.readAsText(file);
    },
  },
});
