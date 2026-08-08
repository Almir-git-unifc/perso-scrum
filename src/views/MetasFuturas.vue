<template>
  <DefaultLayout>
    <div class="metas-page">
      <h1>Ideias Futuras & Estudos</h1>
      <Alertas tela="metas" />

      <div class="lista-metas">
        <div v-if="metas.length === 0" class="empty-state">
          Nenhuma meta ou ideia futura cadastrada. Use a tela de cadastro com destino "Idéias Futuras"!
        </div>

        <CardAtividade 
          v-for="meta in metas" 
          :key="meta.id" 
          :atividade="meta"
        >
          <template #acoes="{ atividade }">
            <button class="btn-promover" @click="promoverParaBacklog(atividade.id)">
              🚀 Promover para o Backlog
            </button>
            <button class="btn-excluir" @click="atividadesStore.excluirAtividade(atividade.id)">
              🗑️ Excluir
            </button>
          </template>
        </CardAtividade>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed } from 'vue';
import DefaultLayout from "../layouts/DefaultLayout.vue";
import Alertas from "../components/Alertas.vue";
import CardAtividade from "../components/CardAtividade.vue";
import { useAtividadesStore } from "../stores/atividades";

/** Área para registrar ideias futuras, estudos e planos de longo prazo, e para encaminahr ao backlog */
const atividadesStore = useAtividadesStore();

const metas = computed(() => {
  return atividadesStore.atividades.filter(
    a => a.telaDestino === 'metas' && !a.concluida && !a.impedida
  );
});

const promoverParaBacklog = (id) => {
  atividadesStore.atualizarAtividade(id, { telaDestino: 'backlog' });
};
</script>

<style scoped>
.btn-promover {
  background: #9b59b6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-excluir {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>

