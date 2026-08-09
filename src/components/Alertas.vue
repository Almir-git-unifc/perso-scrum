<template>
  <div class="container-alerta-dinamico">
    <!-- LISTA DE ALERTAS EXISTENTES -->
    <div v-if="alertasDaTela.length > 0" class="lista-alertas-container">
      <div 
        v-for="alerta in alertasDaTela" 
        :key="alerta.id"
        class="card-alerta-wrapper"
      >
        <!-- MODO DE LEITURA (Card com Borda Rotativa) -->
        <div 
          v-if="alertaEmEdicaoId !== alerta.id" 
          :class="['alerta-box-borda-rotativa', alerta.tipo]"
        >
          <div class="conteudo-card-alerta">
            <p class="texto-alerta">{{ alerta.texto }}</p>
            <div class="acoes-card-alerta">
              <button 
                type="button" 
                @click="iniciarEdicao(alerta)" 
                class="btn-card-acao" 
                title="Editar Alerta"
              >
                ✏️
              </button>
              <button 
                type="button" 
                @click="excluirAlerta(alerta.id)" 
                class="btn-card-acao btn-excluir" 
                title="Excluir Alerta"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- MODO DE EDIÇÃO DO CARD SELECIONADO -->
        <div v-else class="alerta-edicao-container">
          <!-- Seletores de Cor/Gravidade -->
          <div class="linha-seletores-cor">
            <span class="label-seletor">Gravidade/Cor:</span>
            <button 
              type="button"
              @click="tipoEdicao = 'info'" 
              :class="['btn-cor info', { ativo: tipoEdicao === 'info' }]"
            >
              🔵 Info
            </button>
            <button 
              type="button"
              @click="tipoEdicao = 'warning'" 
              :class="['btn-cor warning', { ativo: tipoEdicao === 'warning' }]"
            >
              🟠 Atenção
            </button>
            <button 
              type="button"
              @click="tipoEdicao = 'error'" 
              :class="['btn-cor error', { ativo: tipoEdicao === 'error' }]"
            >
              🔴 Crítico
            </button>
          </div>

          <!-- Textarea de edição -->
          <textarea 
            v-model="textoEdicao" 
            rows="2"
            placeholder="Edite a mensagem..."
            :class="['textarea-alerta', tipoEdicao]"
          ></textarea>
          
          <!-- Controles de Ação da Edição -->
          <div class="botoes-alerta-acoes">
            <button type="button" @click="salvarEdicao(alerta.id)" class="btn-salvar-alerta">💾 Salvar</button>
            <button type="button" @click="cancelarEdicao" class="btn-cancelar-alerta">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MENSAGEM QUANDO NÃO HÁ ALERTAS -->
    <div 
      v-else-if="!exibirFormularioNovo" 
      class="alerta-box-borda-rotativa info box-vazio"
      @click="abrirFormularioNovo"
    >
      <p class="alerta-vazio">💡 Clique aqui para definir até 3 alertas permanentes para esta tela...</p>
    </div>

    <!-- FORMULÁRIO PARA NOVO ALERTA (Até o limite de 3) -->
    <div v-if="alertasDaTela.length < 3" class="bloco-novo-alerta">
      <!-- Botão para abrir o formulário -->
      <button 
        v-if="!exibirFormularioNovo && alertasDaTela.length > 0" 
        type="button" 
        @click="abrirFormularioNovo" 
        class="btn-abrir-novo"
      >
        ➕ Adicionar Novo Alerta ({{ alertasDaTela.length }}/3)
      </button>

      <!-- Formulário de Criação -->
      <div v-if="exibirFormularioNovo" class="alerta-edicao-container margin-top">
        <div class="linha-seletores-cor">
          <span class="label-seletor">Gravidade/Cor:</span>
          <button 
            type="button"
            @click="novoTipo = 'info'" 
            :class="['btn-cor info', { ativo: novoTipo === 'info' }]"
          >
            🔵 Info
          </button>
          <button 
            type="button"
            @click="novoTipo = 'warning'" 
            :class="['btn-cor warning', { ativo: novoTipo === 'warning' }]"
          >
            🟠 Atenção
          </button>
          <button 
            type="button"
            @click="novoTipo = 'error'" 
            :class="['btn-cor error', { ativo: novoTipo === 'error' }]"
          >
            🔴 Crítico
          </button>
        </div>

        <textarea 
          v-model="novoTexto" 
          rows="2"
          placeholder="Escreva o alerta permanente desta tela..."
          :class="['textarea-alerta', novoTipo]"
        ></textarea>
        
        <div class="botoes-alerta-acoes">
          <button type="button" @click="criarAlerta" class="btn-salvar-alerta">➕ Criar Alerta</button>
          <button type="button" @click="fecharFormularioNovo" class="btn-cancelar-alerta">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAtividadesStore } from '../stores/atividades';

const props = defineProps({
  tela: {
    type: String,
    required: true // Recebe 'cadastro', 'backlog', 'hoje', etc.
  }
});

const ativStore = useAtividadesStore();

// Estados para Edição
const alertaEmEdicaoId = ref(null);
const textoEdicao = ref('');
const tipoEdicao = ref('info');

// Estados para Criação
const exibirFormularioNovo = ref(false);
const novoTexto = ref('');
const novoTipo = ref('info');


const alertasDaTela = computed(() => {
  /** alertas.vue:alertasDaTela =  Computed para buscar o array de alertas da tela reativamente */
  const lista = ativStore.alertasPorTela?.[props.tela];
  return Array.isArray(lista) ? lista : [];
});

// Ações de Criação
const abrirFormularioNovo = () => {
  novoTexto.value = '';
  novoTipo.value = 'info';
  exibirFormularioNovo.value = true;
};

const fecharFormularioNovo = () => {
  exibirFormularioNovo.value = false;
  novoTexto.value = '';
};

const criarAlerta = () => {
  if (!novoTexto.value.trim()) return;
  const sucesso = ativStore.adicionarAlerta(props.tela, novoTexto.value, novoTipo.value);
  if (sucesso) {
    fecharFormularioNovo();
  }
};


const iniciarEdicao = (alerta) => {
  /** alertas.vue:iniciarEdicao = Ações de Edição */
  alertaEmEdicaoId.value = alerta.id;
  textoEdicao.value = alerta.texto;
  tipoEdicao.value = alerta.tipo || 'info';
};

const salvarEdicao = (id) => {
  if (textoEdicao.value.trim()) {
    ativStore.atualizarAlerta(props.tela, id, textoEdicao.value, tipoEdicao.value);
  }
  cancelarEdicao();
};

const cancelarEdicao = () => {
  alertaEmEdicaoId.value = null;
  textoEdicao.value = '';
  tipoEdicao.value = 'info';
};


const excluirAlerta = (id) => {
  /** aleras.vue:excluirAlerta = Ação de Exclusão */
  ativStore.removerAlerta(props.tela, id);
};
</script>

<style scoped>
.container-alerta-dinamico {
  margin: 15px 0 25px 0;
  width: 100%;
}

.lista-alertas-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-alerta-wrapper {
  width: 100%;
}

/** --- ESTADOS DE COR DO BACKGROUND --- */
.info {
  background-color: #ebf8ff !important;
  color: #2b6cb0;
}
.warning {
  background-color: #fffaf0 !important;
  color: #dd6b20;
}
.error {
  background-color: #fff5f5 !important;
  color: #c53030;
}

/** --- CARD COM BORDA ANIMADA --- */
.alerta-box-borda-rotativa {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  border: 3px solid #000000; 
  animation: rotacionarCoresBorda 12s infinite ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.box-vazio {
  cursor: pointer;
}

.conteudo-card-alerta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.texto-alerta {
  margin: 0;
  word-break: break-word;
  font-size: 0.95rem;
}

.acoes-card-alerta {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-card-acao {
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-card-acao:hover {
  background: #f7fafc;
  transform: scale(1.05);
}

.btn-excluir:hover {
  background: #fff5f5;
  border-color: #feb2b2;
}

.alerta-vazio {
  color: #95a5a6 !important;
  font-style: italic;
  margin: 0;
}

/** --- FORMULÁRIO DE EDIÇÃO E CRIAÇÃO --- */
.alerta-edicao-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.margin-top {
  margin-top: 10px;
}

.linha-seletores-cor {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.label-seletor {
  font-size: 0.85rem;
  font-weight: bold;
  color: #4a5568;
  margin-right: 5px;
}

.btn-cor {
  padding: 6px 12px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  transition: all 0.2s ease;
}
.btn-cor.info { background-color: #e1effe; color: #1e40af; }
.btn-cor.warning { background-color: #fdf2e9; color: #9a3412; }
.btn-cor.error { background-color: #fde8e8; color: #9b1c1c; }

.btn-cor.ativo {
  border-color: #2d3748;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.textarea-alerta {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
  transition: background-color 0.3s ease;
  box-sizing: border-box;
}

.textarea-alerta:focus {
  border-color: #4a5568;
}

.botoes-alerta-acoes {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-salvar-alerta {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-cancelar-alerta {
  background: #a0aec0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.bloco-novo-alerta {
  margin-top: 10px;
}

.btn-abrir-novo {
  background: #ffffff;
  border: 2px dashed #a0aec0;
  color: #4a5568;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  width: 100%;
  transition: all 0.2s;
}

.btn-abrir-novo:hover {
  border-color: #4a5568;
  background: #f7fafc;
}

/** --- ANIMAÇÃO DAS CORES DA BORDA --- */
@keyframes rotacionarCoresBorda {
  0%, 100% { border-color: #000000; }
  20% { border-color: #2ecc71; }
  40% { border-color: #9b59b6; }
  60% { border-color: #00ffff; }
  80% { border-color: #e0115f; }
}
</style>
