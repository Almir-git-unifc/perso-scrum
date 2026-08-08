<template>
  <DefaultLayout>
    <div class="backlog-page">
      <h1>Backlog do Produto</h1>
      <Alertas tela="backlog" />

      <div class="lista-atividades">
        <div v-if="atividadesPendentes.length === 0" class="empty-state">
          Nenhuma atividade pendente no Backlog. Adicione novas metas pela tela
          de Cadastro!
        </div>

        <CardAtividade
          v-for="ativ in atividadesPendentes"
          :key="ativ.id"
          :atividade="ativ"
        >
          <template #acoes="{ atividade }">
            <button
              class="btn-acao mover"
              @click="atividadesStore.moverParaHoje(atividade.id)"
            >
              ⚡ Começar Hoje (Fazer)
            </button>
            <button
              class="btn-acao remover"
              @click="atividadesStore.excluirAtividade(atividade.id)"
            >
              🗑️ Excluir
            </button>
          </template>
        </CardAtividade>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed } from "vue";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import Alertas from "../components/Alertas.vue";
import CardAtividade from "../components/CardAtividade.vue";
import { useAtividadesStore } from "../stores/atividades";

const atividadesStore = useAtividadesStore();

const atividadesPendentes = computed(() => {
  /** Atividades pendentes */
  return atividadesStore.atividades.filter(
    (a) => a.telaDestino === "backlog" && !a.concluida && !a.impedida,
  );
});
</script>

<style scoped>
.lista-atividades {
  margin-top: 15px;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ccc;
}
.btn-acao {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: bold;
}
.btn-acao.mover {
  background: #3498db;
  color: white;
}
.btn-acao.remover {
  background: #e74c3c;
  color: white;
}
</style>
