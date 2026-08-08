<template>
  <DefaultLayout>
    <div class="cadastro-page">
      <h1>Painel de Configuração e Cadastros</h1>
      <Alertas tela="cadastro" />

      <div class="painel-grid">
        <!-- Cadastrar Devs -->
        <section class="card-secao">
          <h2>👥 Cadastrar Desenvolvedor</h2>
          <div class="form-row">
            <input v-model="novoDevNome" placeholder="Nome do Dev..." />
            <button @click="salvarDev" class="btn-primary">Adicionar Dev</button>
          </div>
          <ul class="lista-simples">
            <li v-for="dev in cadastroStore.devs" :key="dev.id">
              {{ dev.nome }}
              <button @click="cadastroStore.excluirDev(dev.id)" class="btn-danger-link">Remover</button>
            </li>
          </ul>
        </section>

        <!-- Formulário Inteligente de Atividades (CRUD + Busca) -->
        <section class="card-secao">
          <div class="header-inline">
            <h2>📝 {{ editandoId ? 'Editar' : 'Criar Nova' }} Atividade ou Meta</h2>
            <button v-if="editandoId" class="btn-limpar" @click="limparFormulario">✨ Modo Criar Novo</button>
          </div>

          <!-- Barra de Pesquisa e Seleção de Atividades Existentes -->
          <div class="busca-container">
            <label>🔍 Pesquisar Atividades Cadastradas:</label>
            <input 
              v-model="termoBusca" 
              placeholder="Digite o título para buscar e editar..." 
              class="input-busca"
            />
            <div v-if="termoBusca.trim() !== ''" class="resultados-busca">
              <div 
                v-for="ativ in atividadesFiltradas" 
                :key="ativ.id" 
                class="item-busca"
                @click="carregarAtividadeParaEdicao(ativ)"
              >
                <span><strong>[{{ ativ.telaDestino.toUpperCase() }}]</strong> {{ ativ.titulo }}</span>
                <span class="status-badge" :class="ativ.status.toLowerCase()">{{ ativ.status }}</span>
              </div>
              <div v-if="atividadesFiltradas.length === 0" class="sem-resultados">
                Nenhuma atividade encontrada.
              </div>
            </div>
          </div>

          <form @submit.prevent="salvarAtividade" class="form-scrum">
            <div class="form-group">
              <label>Título da Meta/Tarefa:</label>
              <input v-model="novaAtiv.titulo" required placeholder="Ex: Criar API de login" />
            </div>

            <div class="form-group">
              <label>Descrição:</label>
              <textarea v-model="novaAtiv.descricao" rows="2"></textarea>
            </div>

            <div class="form-group-row">
              <div class="form-group">
                <label>Associar Dev:</label>
                <select v-model="novaAtiv.devId">
                  <option value="">Sem desenvolvedor</option>
                  <option v-for="dev in cadastroStore.devs" :key="dev.id" :value="dev.id">
                    {{ dev.nome }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Destino Inicial / Localização:</label>
                <select v-model="novaAtiv.telaDestino">
                  <option value="cadastro">Apenas Cadastrar (Rascunho)</option>
                  <option value="backlog">Enviar para o Backlog</option>
                  <option value="hoje">Enviar para Fazendo Hoje</option>
                  <option value="metas">Idéias Futuras / Metas</option>
                </select>
              </div>
            </div>

            <div class="form-group smart-checkbox-group">
              <label>Classificação SMART:</label>
              <div class="checkbox-grid">
                <label class="smart-item"><input type="checkbox" v-model="novaAtiv.smart.S" /> <span><strong>S</strong> - Esp.</span></label>
                <label class="smart-item"><input type="checkbox" v-model="novaAtiv.smart.M" /> <span><strong>M</strong> - Mens.</span></label>
                <label class="smart-item"><input type="checkbox" v-model="novaAtiv.smart.A" /> <span><strong>A</strong> - Atin.</span></label>
                <label class="smart-item"><input type="checkbox" v-model="novaAtiv.smart.R" /> <span><strong>R</strong> - Relev.</span></label>
                <label class="smart-item"><input type="checkbox" v-model="novaAtiv.smart.T" /> <span><strong>T</strong> - Prazo</span></label>
              </div>
            </div>

            <div class="form-group-row">
              <div class="form-group">
                <label>Duração:</label>
                <select v-model="novaAtiv.duracao">
                  <option value="continuo">Contínuo</option>
                  <option value="curto prazo15min">CurtoPz-15-min</option>
                  <option value="curto prazo40min">CurtoPz-40-min</option>
                  <option value="medio prazo15min">Médio Pz-15-min</option>
                  <option value="medio prazo30min">Médio Pz-30-min</option>
                  <option value="medio prazo45min">Médio Pz-45-min</option>
                  <option value="longo prazo-10min">LgPz-10-min</option>
                  <option value="longo prazo-35min">LgPz-35-min</option>
                  <option value="longo prazo-45min">LgPz-45-min</option>
                </select>
              </div>
              <div class="form-group">
                <label>Prioridade:</label>
                <select v-model="novaAtiv.prioridade">
                <option value="Normal">Normal</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Rotina">Rotina</option>
                  <option value="Imprevistos">Imprevistos</option>
                  <option value="Meta">Meta</option>
                  <option value="Refinamento">Refinamento</option>
                </select>
              </div>
            </div>

            <div class="form-group-row">
              <div class="form-group">
                <label>Risco:</label>
                <select v-model="novaAtiv.risco">
                  <option value="baixo">Baixo</option>
                  <option value="médio">Médio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
              <div class="form-group">
                <label>Dependência?</label>
                <select v-model="novaAtiv.dependencia">
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>
            </div>

            <div v-if="novaAtiv.dependencia === 'Sim'" class="form-group">
              <label>Meta Vinculada:</label>
              <select v-model="novaAtiv.dependenciaAtividadeId">
                <option value="">Nenhuma</option>
                <option v-for="a in ativStore.atividades" :key="a.id" :value="a.id">
                  {{ a.titulo }}
                </option>
              </select>
            </div>

            <!-- Botões Dinâmicos de Ação (Salvar / Editar / Excluir) -->
            <div class="botoes-form-acoes">
              <button type="submit" class="btn-sucesso">
                {{ editandoId ? '💾 Atualizar Alterações' : '➕ Salvar Atividade' }}
              </button>
              <button 
                v-if="editandoId" 
                type="button" 
                class="btn-deletar" 
                @click="excluirAtividadeEdicao"
              >
                🗑️ Excluir Meta Permanente
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import DefaultLayout from "../layouts/DefaultLayout.vue";
import Alertas from "../components/Alertas.vue";
import { useCadastroStore } from "../stores/cadastro";
import { useAtividadesStore } from "../stores/atividades";

const cadastroStore = useCadastroStore();
const ativStore = useAtividadesStore();

const novoDevNome = ref('');
const termoBusca = ref('');
const editandoId = ref(null);

const novaAtiv = reactive({
  titulo: '',
  descricao: '',
  devId: '',
  smart: { S: false, M: false, A: false, R: false, T: false },
  duracao: 'medio prazo',
  prioridade: 'Normal',
  risco: 'baixo',
  dependencia: 'Não',
  dependenciaAtividadeId: '',
  telaDestino: 'cadastro' // Padrão: Apenas Salvar no Cadastro
});

 
const obterDataHojeString = () => {
  /**  Method obterDataHojeString = Função auxiliar para obter a data de hoje no formato YYYY-MM-DD local */
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const atividadesFiltradas = computed(() => {
  /** Method atividadesFiltradas = Pesquisa Reativa com cálculo de Status em Tempo Real */
  if (!termoBusca.value.trim()) return [];
  
  const hojeStr = obterDataHojeString();
  const termo = termoBusca.value.toLowerCase();

  return ativStore.atividades
    .filter(a => a.titulo.toLowerCase().includes(termo))
    .map(a => {
      /** statusCalculado = Regra dinâmica de status:  */
      let statusCalculado = 'Disponível';

      if (a.telaDestino === 'backlog') {
        statusCalculado = 'Já selecionado';
      } else if (a.telaDestino === 'hoje') {
        if (!a.concluida) {
          // Se está no Fazendo Hoje e não concluiu, está ocupada
          statusCalculado = 'Já selecionado';
        } else if (a.concluida && a.dataConclusao === hojeStr) {
          // Se concluiu HOJE, continua bloqueada para evitar duplicar no mesmo dia
          statusCalculado = 'Já selecionado';
        }
      }

      // Retorna o objeto com o status atualizado em tempo real para a interface
      return {
        ...a,
        status: statusCalculado
      };
    });
});

const carregarAtividadeParaEdicao = (ativ) => {
  editandoId.value = ativ.id;
  novaAtiv.titulo = ativ.titulo;
  novaAtiv.descricao = ativ.descricao;
  novaAtiv.devId = ativ.devId;
  novaAtiv.smart = { ...ativ.smart };
  novaAtiv.duracao = ativ.duracao;
  novaAtiv.prioridade = ativ.prioridade;
  novaAtiv.risco = ativ.risco;
  novaAtiv.dependencia = ativ.dependencia;
  novaAtiv.dependenciaAtividadeId = ativ.dependenciaAtividadeId;
  novaAtiv.telaDestino = ativ.telaDestino;
  termoBusca.value = ''; // Limpa a busca ao selecionar
};

const salvarDev = () => {
  if (!novoDevNome.value.trim()) return;
  cadastroStore.adicionarDev(novoDevNome.value);
  novoDevNome.value = '';
};


const salvarAtividade = () => {

/** salvarAtividade = Adicione no início de salvarAtividade em Cadastro.vue: */ 
const hojeStr = obterDataHojeString();

const jaExisteHoje = ativStore.atividades.some(a => 
  /** Method jaExiteHoje = Verifica se já existe uma tarefa ativa hoje com o mesmo título e na mesma tela destino */
  a.titulo.trim().toLowerCase() === novaAtiv.titulo.trim().toLowerCase() &&
  a.telaDestino === novaAtiv.telaDestino &&
  !a.concluida
);

if (jaExisteHoje && !editandoId.value) {
  alert(`A tarefa "${novaAtiv.titulo}" já está presente na tela ${novaAtiv.telaDestino.toUpperCase()} hoje!`);
  return; // Interrompe o salvamento para evitar duplicados
}


  

  // Busca a versão original da atividade na store caso esteja em modo de edição
  const ativOriginal = editandoId.value 
    ? ativStore.atividades.find(a => a.id === editandoId.value) 
    : null;

  // Se a atividade editada já foi concluída em um dia anterior,
  // nós NÃO podemos alterá-la! Devemos gerar uma REUTILIZAÇÃO (novo registro).
  const ehReutilizacao = ativOriginal && ativOriginal.concluida;

  if (ehReutilizacao) {
    // === REUTILIZAÇÃO: CRIA UM NOVO REGISTRO ===
    const novaCopiaReutilizada = {
      ...novaAtiv,
      smart: { ...novaAtiv.smart },
      // Descarta o ID antigo para que a store crie um novo
      id: undefined, 
      concluida: false,
      dataConclusao: null,
      impedida: false,
      detalhesDia: novaAtiv.detalhesDia || "", // Preserva/adiciona novos detalhes
      dataCriacao: hojeStr,
      dataEntradaBacklog: (novaAtiv.telaDestino === 'backlog' || novaAtiv.telaDestino === 'hoje') 
        ? hojeStr 
        : null
    };

    // Adiciona como um NOVO item no localStorage. 
    // A tarefa antiga do "Feito Ontem" permanece 100% INTACTA!
    ativStore.adicionarAtividade(novaCopiaReutilizada);

  } else if (editandoId.value) {
    // === EDIÇÃO NORMAL DE TAREFA PENDENTE ===
    const dadosSalvar = {
      ...novaAtiv,
      smart: { ...novaAtiv.smart },
      concluida: false,
      dataConclusao: null,
      impedida: Boolean(novaAtiv.impedida),
      dataEntradaBacklog: (novaAtiv.telaDestino === 'backlog' || novaAtiv.telaDestino === 'hoje') 
        ? hojeStr 
        : novaAtiv.dataEntradaBacklog
    };

    ativStore.atualizarAtividade(editandoId.value, dadosSalvar);

  } else {
    // === NOVO CADASTRO ===
    const dadosNovos = {
      ...novaAtiv,
      smart: { ...novaAtiv.smart },
      concluida: false,
      dataConclusao: null,
      impedida: false,
      dataEntradaBacklog: (novaAtiv.telaDestino === 'backlog' || novaAtiv.telaDestino === 'hoje') 
        ? hojeStr 
        : null
    };

    ativStore.adicionarAtividade(dadosNovos);
  }

  limparFormulario();
};



const excluirAtividadeEdicao = () => {
  if (editandoId.value && confirm("Tem certeza que deseja deletar permanentemente esta atividade?")) {
    ativStore.excluirAtividade(editandoId.value);
    limparFormulario();
  }
};

const limparFormulario = () => {
  editandoId.value = null;
  novaAtiv.titulo = '';
  novaAtiv.descricao = '';
  novaAtiv.devId = '';
  novaAtiv.smart = { S: false, M: false, A: false, R: false, T: false };
  novaAtiv.duracao = 'medio prazo';
  novaAtiv.prioridade = 'Normal';
  novaAtiv.risco = 'baixo';
  novaAtiv.dependencia = 'Não';
  novaAtiv.dependenciaAtividadeId = '';
  novaAtiv.telaDestino = 'cadastro';
  termoBusca.value = '';
};
</script>

<style scoped>
.painel-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}
@media (max-width: 900px) {
  .painel-grid { grid-template-columns: 1fr; }
}
.card-secao {
  background: #fbfbfb;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}
.header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.btn-limpar {
  background: #34495e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
}
.busca-container {
  margin-bottom: 20px;
  position: relative;
}
.input-busca {
  width: 100%;
  padding: 10px;
  border: 2px solid #3498db;
  border-radius: 6px;
  box-sizing: border-box;
}
.resultados-busca {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 0 0 6px 6px;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}
.item-busca {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
}
.item-busca:hover {
  background: #ebf5fb;
}
.status-badge {
  font-size: 0.75em;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
.status-badge.disponível { background: #2ecc71; color: white; }
.status-badge.selecionado { background: #95a5a6; color: white; }

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.form-row input {
  flex: 1;
  padding: 8px;
}
.lista-simples {
  list-style: none;
  padding: 0;
}
.lista-simples li {
  display: flex;
  justify-content: space-between;
  background: white;
  padding: 8px;
  border: 1px solid #eee;
  margin-bottom: 5px;
  border-radius: 4px;
  font-size: 0.9em;
}
.form-scrum {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.form-group-row {
  display: flex;
  gap: 10px;
}
@media (max-width: 600px) {
  .form-group-row { flex-direction: column; }
}
label {
  font-size: 0.85em;
  font-weight: bold;
  margin-bottom: 4px;
  color: #2c3e50;
}
input, select, textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  background: #f1f2f6;
  padding: 10px;
  border-radius: 6px;
}
.smart-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8em;
  cursor: pointer;
}
.botoes-form-acoes {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.btn-sucesso {
  flex: 2;
  background: #2ecc71;
  color: white;
  border: none;
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1em;
}
.btn-deletar {
  flex: 1;
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
}
.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-danger-link {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
}
</style>