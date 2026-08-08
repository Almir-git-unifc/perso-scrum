<template>
  <div
    :class="[
      'card-atividade',
      {
        'urgente-border': atividade.prioridade === 'Urgente',
        'alto-risco': atividade.risco === 'alto',
        'concluida': atividade.concluida,
      },
    ]"
  >
    <div class="card-header">
      <span v-if="atividade.prioridade === 'Urgente'" class="badge urgente"
        >🚨 URGENTE</span
      >
      <span v-if="atividade.risco === 'alto'" class="badge risco"
        >⚠️ ALTO RISCO</span
      >
      <span class="badge prioridade">{{ atividade.prioridade }}</span>
    </div>

    <h3>{{ atividade.titulo }}</h3>
    <p class="desc">{{ atividade.descricao }}</p>

    <div v-if="atividade.detalhesDia" class="detalhes-dia-container">
      📝 <strong>Detalhes do Dia:</strong>
      <p class="detalhes-texto">{{ atividade.detalhesDia }}</p>
    </div>

    <div class="meta-info">
      <span><strong>Duração:</strong> {{ atividade.duracao }}</span>

      <span class="smart-badge-list">
        <strong>Foco SMART:</strong>
        <span v-if="typeof atividade.smart === 'object'">
          <span :class="['sigla', { ativa: atividade.smart.S }]">S</span>
          <span :class="['sigla', { ativa: atividade.smart.M }]">M</span>
          <span :class="['sigla', { ativa: atividade.smart.A }]">A</span>
          <span :class="['sigla', { ativa: atividade.smart.R }]">R</span>
          <span :class="['sigla', { ativa: atividade.smart.T }]">T</span>
        </span>
        <span v-else>{{ atividade.smart || "Nenhum" }}</span>
      </span>

      <span v-if="dono"><strong>Dev:</strong> {{ dono.nome }}</span>
    </div>

    <div v-if="atrasoDias > 0 && !atividade.concluida" class="atraso-contador">
      ⏰ Em atraso:
      <strong>{{ atrasoDias }} {{ atrasoDias === 1 ? "dia" : "dias" }}</strong>
    </div>

    <div class="card-actions">
      <slot name="acoes" :atividade="atividade" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCadastroStore } from "../stores/cadastro";
import { useDatas } from "../composables/useDatas";

const props = defineProps({
  /** Exibe tarefas no Scrum */
  atividade: { type: Object, required: true },
});

const cadastroStore = useCadastroStore();
const { calcularDiasDeAtraso } = useDatas();

const dono = computed(() => {
  return cadastroStore.devs.find((d) => d.id === props.atividade.devId);
});

const atrasoDias = computed(() => {
  // Passando a string da dataCriacao vai funcionar 100% e com segurança agora!
  return calcularDiasDeAtraso(props.atividade);
});

</script>

<style scoped>
.card-atividade {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}
.card-atividade:hover {
  transform: translateY(-2px);
}
.urgente-border {
  border-left: 6px solid #e74c3c;
}
.alto-risco {
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.15);
  background: #fffcfc;
}
.concluida {
  opacity: 0.6;
  background-color: #f1f2f6 !important;
  border-left: 6px solid #2ecc71;
  text-decoration: line-through;
}
.card-header {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.75rem;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: bold;
}
.badge.urgente {
  background: #e74c3c;
  color: white;
}
.badge.risco {
  background: #e67e22;
  color: white;
}
.badge.prioridade {
  background: #95a5a6;
  color: white;
}
.desc {
  font-size: 0.9em;
  color: #555;
  margin: 8px 0;
}
.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.8em;
  color: #7f8c8d;
  margin-bottom: 12px;
}
.atraso-contador {
  background: #fdf2e2;
  color: #d35400;
  padding: 5px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-bottom: 10px;
  text-align: center;
}
.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.smart-badge-list {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.sigla {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: bold;
  background: #dfe6e9;
  color: #b2bec3;
}
.sigla.ativa {
  background: #2ecc71; /* Verde neon/suave para o que está ativo */
  color: white;
}
.detalhes-dia-container {
  background: #fff9db;
  border-left: 4px solid #f1c40f;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.85em;
  margin: 10px 0;
  color: #5c3c00;
}
.detalhes-texto {
  margin: 4px 0 0 0;
  font-style: italic;
}
</style>
