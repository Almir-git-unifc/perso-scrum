<template>
  <DefaultLayout>
    <div class="fazendo-hoje-page">
      <!-- Título com o dia da semana dinâmico -->
      <h1>Fazendo Hoje: {{ diaDaSemanaAtual }}</h1>
      <Alertas tela="hoje" />

      <!-- 1. SEÇÃO DE CIMA: EM ANDAMENTO -->
      <section class="secao-scrum">
        <h2>🚀 Atividades Em Andamento</h2>
        <div v-if="atividadesEmProgresso.length > 0" class="grid-cards">
          <CardAtividade
            v-for="atividade in atividadesEmProgresso"
            :key="atividade.id"
            :atividade="atividade"
          >
            <!-- Slot de Ações do Card -->
            <template #acoes="{ atividade: ativSlot }">
              <div class="bloco-acoes-hoje">
                <div class="linha-controles">
                  <label class="concluir-checkbox">
                    <input
                      type="checkbox"
                      :checked="ativSlot.concluida"
                      @change="
                        (e) =>
                          atividadesStore.marcarConcluida(
                            ativSlot.id,
                            e.target.checked,
                          )
                      "
                    />
                    <span>Marcar como Feito/Concluído</span>
                  </label>

                  <button
                    class="btn-acao-mini imp"
                    @click="solicitarImpedimento(ativSlot)"
                  >
                    ⚠️ Declarar Impedimento
                  </button>
                  <button
                    class="btn-acao-mini back"
                    @click="atividadesStore.moverParaBacklog(ativSlot.id)"
                  >
                    ↩️ Devolver Backlog
                  </button>
                </div>

                <!-- Campo "Detalhes-Do-Dia" para anotações rápidas -->
                <div class="anotacao-dia">
                  <label class="label-anotacao"
                    >Anotação diária (Detalhes do Dia):</label
                  >
                  <input
                    type="text"
                    :value="ativSlot.detalhesDia || ''"
                    placeholder="Escreva um detalhe sobre o progresso de hoje..."
                    @change="
                      (e) =>
                        atividadesStore.atualizarAtividade(ativSlot.id, {
                          detalhesDia: e.target.value,
                        })
                    "
                    class="input-anotacao"
                  />
                </div>
              </div>
            </template>
          </CardAtividade>
        </div>
        <p v-else class="sem-tarefas">
          Nenhuma atividade em andamento para hoje.
        </p>
      </section>

      <!-- LINHA DELIMITADORA VISUAL -->
      <hr class="linha-delimitadora" />

      <!-- 2. SEÇÃO DE BAIXO: CONCLUÍDAS DE HOJE -->
      <section class="secao-scrum">
        <h2 class="titulo-concluidas">✅ ATIVIDADES CONCLUÍDAS DE HOJE</h2>
        <div
          v-if="atividadesConcluidasHoje.length > 0"
          class="grid-cards concluidas-lista"
        >
          <CardAtividade
            v-for="atividade in atividadesConcluidasHoje"
            :key="atividade.id"
            :atividade="atividade"
          >
            <!-- Permite desmarcar o checkbox em caso de erro -->
            <template #acoes="{ atividade: ativSlot }">
              <div class="bloco-acoes-hoje">
                <div class="linha-controles">
                  <label class="concluir-checkbox concluido-ativo">
                    <input
                      type="checkbox"
                      :checked="ativSlot.concluida"
                      @change="
                        (e) =>
                          atividadesStore.marcarConcluida(
                            ativSlot.id,
                            e.target.checked,
                          )
                      "
                    />
                    <span>Concluído</span>
                  </label>
                </div>
              </div>
            </template>
          </CardAtividade>
        </div>
        <p v-else class="sem-tarefas-concluidas">
          Nenhuma atividade concluída hoje ainda.
        </p>
      </section>

      <!-- Modal de Impedimento -->
      <div v-if="modalImpedimento.aberto" class="modal-overlay">
        <div class="modal-content">
          <h3>Declarar Impedimento</h3>
          <p>
            Atividade: <strong>{{ modalImpedimento.atividade?.titulo }}</strong>
          </p>

          <div class="form-group">
            <label>Tipo de Impedimento:</label>
            <select v-model="modalImpedimento.tipo">
              <option value="Muito Complexo">Muito Complexo</option>
              <option value="Falta de Informação">Falta de Informação</option>
              <option value="Bloqueio Externo">Bloqueio Externo</option>
              <option value="Infraestrutura">Problema Técnico/Infra</option>
            </select>
          </div>

          <div class="form-group">
            <label>Motivo detalhado:</label>
            <textarea
              v-model="modalImpedimento.motivo"
              rows="3"
              placeholder="Descreva o que está travando a tarefa..."
            ></textarea>
          </div>

          <div class="modal-botoes">
            <button @click="confirmarImpedimento" class="btn-confirmar">
              Bloquear Tarefa
            </button>
            <button
              @click="modalImpedimento.aberto = false"
              class="btn-cancelar"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed, reactive } from "vue";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import Alertas from "../components/Alertas.vue";
import CardAtividade from "../components/CardAtividade.vue";
import { useAtividadesStore } from "../stores/atividades";
import { useDatas } from "../composables/useDatas";

const atividadesStore = useAtividadesStore();
const { calcularDiasDeAtraso } = useDatas();

const modalImpedimento = reactive({
  aberto: false,
  atividade: null,
  tipo: "Muito Complexo",
  motivo: "",
});


const diaDaSemanaAtual = computed(() => {
  /** Method diaDasemanaAtual = Retorna o dia da semana atual formatado (ex: "sábado") */
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long" })
    .replace("-feira", "");
});


const obterDataHojeString = () => {
  /** Method obterDataHojeString = Gera a string de hoje no formato YYYY-MM-DD local */
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};


const atividadesEmProgresso = computed(() => {
  /** Method atividadesEmProgresso  = Seção Em Andamento: Remove concluídas e ordena por regras SMART de prioridade/risco/atraso */
  const hojeStr = obterDataHojeString();

  const lista = atividadesStore.atividades.filter((a) => {
    if (a.telaDestino !== "hoje" || a.impedida) return false;
    // Se estiver concluída (seja hoje ou antes), sai da lista de andamento
    if (a.concluida) return false;
    return true;
  });

  return lista.sort((a, b) => {
    const aUrgente = a.prioridade === "Urgente" ? 1 : 0;
    const bUrgente = b.prioridade === "Urgente" ? 1 : 0;
    if (bUrgente !== aUrgente) return bUrgente - aUrgente;

    const aRisco = a.risco === "alto" ? 1 : 0;
    const bRisco = b.risco === "alto" ? 1 : 0;
    if (bRisco !== aRisco) return bRisco - aRisco;

    return calcularDiasDeAtraso(b) - calcularDiasDeAtraso(a);
  });
});


const atividadesConcluidasHoje = computed(() => {
  /** Method atividadesConcluidasHoje =  Seção de Concluídas: Exibe apenas o que foi finalizado no dia de HOJE */
  const hojeStr = obterDataHojeString();
  return atividadesStore.atividades.filter(
    (a) =>
      a.telaDestino === "hoje" && a.concluida && a.dataConclusao === hojeStr,
  );
});


const atividadesPendentesHoje = computed(() => {
  /** Method atividadesPendentesHoje = Em FazendoHoje.vue — Adicione esta computed para listar o que precisa ser feito hoje: */
  return atividadesStore.atividades.filter(
    (a) => a.telaDestino === "hoje" && !a.concluida && !a.impedida
  );
});

const solicitarImpedimento = (atividade) => {
  modalImpedimento.atividade = atividade;
  modalImpedimento.tipo = "Muito Complexo";
  modalImpedimento.motivo = "";
  modalImpedimento.aberto = true;
};

const confirmarImpedimento = () => {
  if (!modalImpedimento.atividade) return;
  atividadesStore.moverParaImpedidos(
    modalImpedimento.atividade.id,
    modalImpedimento.tipo,
    modalImpedimento.motivo,
  );
  modalImpedimento.aberto = false;
};
</script>

<style scoped>
.fazendo-hoje-page {
  padding: 10px 0;
}
.secao-scrum {
  margin-bottom: 20px;
}
.grid-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}
.grid-cards :deep(.card-atividade) {
  width: 100% !important;
  max-width: 100% !important;
}
.linha-delimitadora {
  border: 0;
  height: 2px;
  background-image: linear-gradient(to right, #2ecc71, #f1c40f, transparent);
  margin: 30px 0;
}
.titulo-concluidas {
  color: #27ae60;
}
.concluidas-lista :deep(.card-atividade) {
  border-left: 4px solid #2ecc71 !important;
  opacity: 0.85;
  background: #f4fbf7;
}
.sem-tarefas,
.sem-tarefas-concluidas {
  background: #f8f9fa;
  border: 1px dashed #ccc;
  padding: 15px;
  text-align: center;
  color: #7f8c8d;
  border-radius: 6px;
}
.bloco-acoes-hoje {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 10px;
}
.linha-controles {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.concluir-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  cursor: pointer;
  color: #2c3e50;
  background: #e8f8f5;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #a3e4d7;
}
.concluido-ativo {
  background: #d4efdf;
  border-color: #2ecc71;
  color: #1e8449;
}
.btn-acao-mini {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: bold;
}
.btn-acao-mini.imp {
  background: #f39c12;
  color: white;
}
.btn-acao-mini.back {
  background: #7f8c8d;
  color: white;
}

.anotacao-dia {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fffdf3;
  border: 1px dashed #f1c40f;
  padding: 10px;
  border-radius: 4px;
}
.label-anotacao {
  font-size: 0.75rem;
  font-weight: bold;
  color: #9a7d0a;
}
.input-anotacao {
  border: 1px solid #eedc82;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9em;
  outline: none;
  background: white;
}
.input-anotacao:focus {
  border-color: #f39c12;
  background: #fffef9;
}

/* Modal Estilos */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.modal-botoes {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.btn-confirmar {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-cancelar {
  background: #bdc3c7;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
textarea,
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
