<template>
  <DefaultLayout>
    <div class="impedimentos-page">
      <h1>Quadro de Impedimentos</h1>
      <Alertas tela="impedimentos" />

      <div class="lista-impedidos">
        <div v-if="impedidos.length === 0" class="empty-state">
          Ótimo! No momento, você não possui nenhuma atividade impedida. 🎉
        </div>

        <div v-for="ativ in impedidos" :key="ativ.id" class="card-impedimento">
          <div class="conteudo-principal">
            <h3>{{ ativ.titulo }}</h3>
            <div class="detalhe-alerta">
              ⚠️ <strong>Tipo:</strong> {{ ativ.tipoImpedimento }} <br>
              📝 <strong>Motivo do bloqueio:</strong> {{ ativ.motivoImpedimento }}
            </div>
          </div>
          <div class="acoes-impedimento">
            <button class="btn-desbloquear" @click="atividadesStore.moverParaBacklog(ativ.id)">
              🔓 Resolver e Mover ao Backlog
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed } from 'vue';
import DefaultLayout from "../layouts/DefaultLayout.vue";
import Alertas from "../components/Alertas.vue";
import { useAtividadesStore } from "../stores/atividades";

/** Exibe atividades pausadas por bloqueios e os motivos */
const atividadesStore = useAtividadesStore();

const impedidos = computed(() => {
  return atividadesStore.atividades.filter(a => a.impedida);
});
</script>

<style scoped>
.card-impedimento {
  background: #fff5f5;
  border: 1px solid #fab1a0;
  border-left: 6px solid #d63031;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
@media (max-width: 600px) {
  .card-impedimento { flex-direction: column; align-items: stretch; }
}
.detalhe-alerta {
  background: white;
  border: 1px solid #ffccd5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 0.9em;
  color: #c0392b;
}
.btn-desbloquear {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}
</style>

