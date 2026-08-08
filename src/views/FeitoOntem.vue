<template>
  <DefaultLayout>
    <div class="feito-ontem-page">
      <!-- Título com o dia da semana anterior dinâmico -->
      <h1>Relatório de Realizações ('Feito Ontem: {{ diaDaSemanaOntem }}')</h1>

      <!-- Calendário de Seleção Corrigido -->
      <div class="filtro-calendario">
        <label for="data-filtro"
          >📆 Selecione uma data para auditar o histórico:</label
        >
        <input
          id="data-filtro"
          type="date"
          v-model="dataSelecionada"
          class="input-data"
        />
      </div>

      <div class="lista-concluidas">
        <div v-if="atividadesConcluidasNaData.length > 0">
          <p class="resumo-contagem">
            🎉
            <strong>{{ atividadesConcluidasNaData.length }}</strong>
            atividade(s) concluída(s) nesta data!
          </p>
          <div class="grid-cards">
            <!-- Reaproveita o seu componente de card padrão -->
            <CardAtividade
              v-for="atividade in atividadesConcluidasNaData"
              :key="atividade.id"
              :atividade="atividade"
            />
          </div>
        </div>

        <!-- Mensagem de lista vazia com data formatada em DD-MM-AAAA -->
        <div v-else class="sem-atividades">
          📭 Nenhuma atividade foi marcada como concluída na data:
          <strong>{{ dataFormatadaBr }}</strong
          >.
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
    import { ref, computed } from "vue";
    import DefaultLayout from "../layouts/DefaultLayout.vue";
    import CardAtividade from "../components/CardAtividade.vue";
    import { useAtividadesStore } from "../stores/atividades";

    const atividadesStore = useAtividadesStore();

    const obterDataStringComDeslocamento = (diasDeslocamento) => {
      /**
       * Gera a string YYYY-MM-DD baseada estritamente no fuso local
       */
      const d = new Date();
      // Ajusta os dias com base na data local da máquina
      const dataAlvo = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diasDeslocamento);
      
      const ano = dataAlvo.getFullYear();
      const mes = String(dataAlvo.getMonth() + 1).padStart(2, "0");
      const dia = String(dataAlvo.getDate()).padStart(2, "0"); // CORRIGIDO: mudado de getUTCDate para getDate
      
      return `${ano}-${mes}-${dia}`;
    };

    // Por padrão, o calendário já abre apontando para o dia de ONTEM (-1) local perfeito
    const dataSelecionada = ref(obterDataStringComDeslocamento(-1));

    const diaDaSemanaOntem = computed(() => {
      /**
       * method diaDaSemanaOntem = Calcula o dia da semana de Ontem para o título dinâmico
       */
      const d = new Date();
      const ontem = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
      return ontem
        .toLocaleDateString("pt-BR", { weekday: "long" })
        .replace("-feira", "");
    });


    const dataFormatadaBr = computed(() => {
      /**
       * Method dataFormatadaBr = Formata a data selecionada do formato YYYY-MM-DD para DD-MM-AAAA para exibição na tela
       */
      if (!dataSelecionada.value) return "";
      const [ano, mes, dia] = dataSelecionada.value.split("-");
      return `${dia}-${mes}-${ano}`;
    });

  
    const atividadesConcluidasNaData = computed(() => {
      /** 
       * Method atividadesConcluidasNaData = Filtro reativo que busca na store as atividades concluídas que batem com a string selecionada
       */
      if (!dataSelecionada.value) return [];
      return atividadesStore.atividades.filter(
        (a) => a.concluida && a.dataConclusao === dataSelecionada.value,
      );
    });
</script>

<style scoped>
    .filtro-calendario {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .input-data {
      padding: 10px;
      font-size: 1rem;
      border: 2px solid #bdc3c7;
      border-radius: 6px;
      width: 100%;
      max-width: 250px;
      outline: none;
    }
    .input-data:focus {
      border-color: #3498db;
    }
    .resumo-contagem {
      margin-bottom: 15px;
      color: #27ae60;
    }

    /* CSS = Layout Horizontal Restaurado */
    .grid-cards {
      display: flex;
      flex-direction: column; /*  CSS = Alinha um card abaixo do outro */
      gap: 15px; /*  CSS = Espaçamento entre as linhas */
      width: 100%;
    }

    /*  CSS = Garante que o componente interno ocupe a largura total */
    .grid-cards :deep(.card-atividade) {
      width: 100% !important;
      max-width: 100% !important;
    }

    .sem-atividades {
      background: #fcf8e3;
      color: #8a6d3b;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #faebcc;
      text-align: center;
    }
</style>
