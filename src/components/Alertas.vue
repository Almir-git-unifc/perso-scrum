<template>
  <div class="container-alerta-dinamico">
    <!-- Bloco de Visualização / Leitura com Borda Rotativa e Background Dinâmico -->
    <div 
      v-if="!editando" 
      @click="editando = true" 
      :class="['alerta-box-borda-rotativa', tipoAlerta]"
    >
      <p v-if="textoAlerta.trim()">{{ textoAlerta }}</p>
      <p v-else class="alerta-vazio">💡 Clique aqui para definir um alerta permanente para esta tela...</p>
    </div>
    
    <!-- Bloco de Edição (Texto e Seleção de Cor) -->
    <div v-else class="alerta-edicao-container">
      <!-- Seletores de Cor/Gravidade -->
      <div class="linha-seletores-cor">
        <span class="label-seletor">Definir gravidade/cor:</span>
        <button 
          type="button"
          @click="ativStore.atualizarAlertaTipo(props.tela, 'info')" 
          :class="['btn-cor info', { ativo: tipoAlerta === 'info' }]"
        >
          🔵 Info (Azul)
        </button>
        <button 
          type="button"
          @click="ativStore.atualizarAlertaTipo(props.tela, 'warning')" 
          :class="['btn-cor warning', { ativo: tipoAlerta === 'warning' }]"
        >
          🟠 Atenção (Laranja)
        </button>
        <button 
          type="button"
          @click="ativStore.atualizarAlertaTipo(props.tela, 'error')" 
          :class="['btn-cor error', { ativo: tipoAlerta === 'error' }]"
        >
          🔴 Crítico (Vermelho)
        </button>
      </div>

      <!-- Textarea de edição cuja cor de fundo acompanha a seleção em tempo real -->
      <textarea 
        v-model="inputTexto" 
        rows="1"
        placeholder="Escreva o alerta permanente desta tela..."
        :class="['textarea-alerta', tipoAlerta]"
      ></textarea>
      
      <!-- Controles de Ação do Editor -->
      <div class="botoes-alerta-acoes">
        <button type="button" @click="salvarAlerta" class="btn-salvar-alerta">Salvar Alerta</button>
        <button type="button" @click="cancelarEdicao" class="btn-cancelar-alerta">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAtividadesStore } from '../stores/atividades';

const props = defineProps({
  tela: {
    type: String,
    required: true // Deve receber 'cadastro', 'backlog' ou 'hoje'
  }
});

const ativStore = useAtividadesStore();
const editando = ref(false);
const inputTexto = ref('');

const textoAlerta = computed(() => {
  /**
  * Const textoAleta Recupera o texto salvo na estrutura de objetos do store
  */
  return ativStore.alertasPorTela?.[props.tela]?.texto || '';
});

const tipoAlerta = computed(() => {
  /**
  * Const tipoAleta Recupera o tipo de cor (info, warning, error) salvo no store
  */
  return ativStore.alertasPorTela?.[props.tela]?.tipo || 'info';
});


watch(textoAlerta, (novoValor) => {
  /** Sincroniza o valor do input local sempre que o texto do store mudar */
  inputTexto.value = novoValor;
}, { immediate: true });

const salvarAlerta = () => {
  ativStore.atualizarAlertaTexto(props.tela, inputTexto.value);
  editando.value = false;
};

const cancelarEdicao = () => {
  /**Restaura o texto original  */
  inputTexto.value = textoAlerta.value;  
  editando.value = false;
};
</script>

<style scoped>
.container-alerta-dinamico {
  margin: 15px 0 25px 0;
  width: 100%;
}

/**  CSS = --- ESTADOS DE COR DO BACKGROUND (INFO, WARNING, ERROR) --- */
.info {
  background-color: #ebf8ff !important; /* Azul claro */
  color: #2b6cb0;
}
.warning {
  background-color: #fffaf0 !important; /* Laranja claro */
  color: #dd6b20;
}
.error {
  background-color: #fff5f5 !important; /* Vermelho claro */
  color: #c53030;
}

/**  CSS = --- BOX DE VISUALIZAÇÃO COM BORDA ANIMADA GROSSA (3px) --- */
.alerta-box-borda-rotativa {
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  border: 3px solid #000000; 
  animation: rotacionarCoresBorda 12s infinite ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.alerta-vazio {
  color: #95a5a6 !important;
  font-style: italic;
}

/**  CSS = --- BLOCO DO FORMULÁRIO DE EDIÇÃO --- */
.alerta-edicao-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
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

/** CSS = BOTÕES SELETORES DE GRAVIDADE */
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

/**  CSS = Destaque visual do botão ativo atual */
.btn-cor.ativo {
  border-color: #2d3748;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.textarea-alerta {
  width: 100%;
  padding: 12px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
  transition: background-color 0.3s ease;
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

/**  CSS = --- ANIMAÇÃO DE ROTAÇÃO DAS CORES DA BORDA --- */
@keyframes rotacionarCoresBorda {
  0%, 100% {
    border-color: #000000; /* Preto */
  }
  20% {
    border-color: #2ecc71; /* Verde */
  }
  40% {
    border-color: #9b59b6; /* Roxo */
  }
  60% {
    border-color: #00ffff; /* Ciano */
  }
  80% {
    border-color: #e0115f; /* Magenta */
  }
}
</style>
