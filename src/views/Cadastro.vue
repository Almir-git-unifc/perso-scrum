<template>
  <DefaultLayout>
    <!-- BLOCO DE BACKUP E RESTAURAÇÃO -->
    <div class="card-secao backup-box">
      <h3>💾 Backup e Restauração dos Dados</h3>
      <p>Exporte o estado atual do seu Kanban/Scrum para um arquivo JSON ou restaure um backup prévio.</p>
      
      <div class="botoes-backup">
        <button @click="ativStore.exportarDadosJSON()" class="btn-backup exportar">
          📥 Baixar Backup (.JSON)
        </button>

        <label class="btn-backup importar">
          📤 Importar / Popular Dados
          <input 
            type="file" 
            accept=".json" 
            @change="ativStore.importarDadosJSON" 
            style="display: none;" 
          />
        </label>
      </div>
    </div>

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

            <!-- SEÇÃO DE ATRIBUTOS E METODOLOGIAS -->
            <div class="secao-atributos">
              <!-- ATRIBUTOS SMART -->
              <div class="grupo-atributos">
                <label class="label-secao">Critérios SMART:</label>
                <div class="linha-checkboxes">
                  <label class="item-checkbox tooltip-container">
                    <input type="checkbox" v-model="novaAtiv.smart.especifico" />
                    <span class="checkmark"></span> [S] Específico
                    <span class="tooltip-text">
                      <strong>S - Specific:</strong> O objetivo está claro e sem ambiguidades sobre o que deve ser feito?
                    </span>
                  </label>

                  <label class="item-checkbox tooltip-container">
                    <input type="checkbox" v-model="novaAtiv.smart.mensuravel" />
                    <span class="checkmark"></span> [M] Mensurável
                    <span class="tooltip-text">
                      <strong>M - Measurable:</strong> É possível medir o progresso ou saber claramente quando foi concluído?
                    </span>
                  </label>

                  <label class="item-checkbox tooltip-container">
                    <input type="checkbox" v-model="novaAtiv.smart.atingivel" />
                    <span class="checkmark"></span> [A] Atingível
                    <span class="tooltip-text">
                      <strong>A - Achievable:</strong> A meta é realista e possível de ser alcançada com os recursos atuais?
                    </span>
                  </label>

                  <label class="item-checkbox tooltip-container">
                    <input type="checkbox" v-model="novaAtiv.smart.relevante" />
                    <span class="checkmark"></span> [R] Relevante
                    <span class="tooltip-text">
                      <strong>R - Relevant:</strong> Essa atividade traz impacto real para os objetivos estratégicos?
                    </span>
                  </label>

                  <label class="item-checkbox tooltip-container">
                    <input type="checkbox" v-model="novaAtiv.smart.temporal" />
                    <span class="checkmark"></span> [T] Temporal (Prazo)
                    <span class="tooltip-text">
                      <strong>T - Time-bound:</strong> Existe uma data limite ou prazo definido para conclusão?
                    </span>
                  </label>
                </div>
              </div>

              <!-- MATRIZ EISENHOWER -->
              <div class="grupo-atributos margin-top-secao">
                <label class="label-secao">Matriz Eisenhower (Prioridade/Urgência):</label>
                <div class="linha-checkboxes">
                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.eisenhower === 'fazer_agora' }]">
                    <input type="radio" name="eisenhower" value="fazer_agora" v-model="novaAtiv.eisenhower" />
                    <span class="radio-mark"></span> 🔥 Fazer Agora
                    <span class="tooltip-text">
                      <strong>Urgente & Importante:</strong> Problemas imprevistos, prazos críticos e crises imediatas.
                    </span>
                  </label>

                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.eisenhower === 'agendar' }]">
                    <input type="radio" name="eisenhower" value="agendar" v-model="novaAtiv.eisenhower" />
                    <span class="radio-mark"></span> 📅 Agendar
                    <span class="tooltip-text">
                      <strong>Não Urgente, mas Importante:</strong> Planejamento, melhorias, estudo e tarefas estratégicas.
                    </span>
                  </label>

                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.eisenhower === 'delegar' }]">
                    <input type="radio" name="eisenhower" value="delegar" v-model="novaAtiv.eisenhower" />
                    <span class="radio-mark"></span> 🤝 Delegar
                    <span class="tooltip-text">
                      <strong>Urgente, mas Não Importante:</strong> Interrupções, algumas reuniões ou solicitações de terceiros.
                    </span>
                  </label>

                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.eisenhower === 'eliminar' }]">
                    <input type="radio" name="eisenhower" value="eliminar" v-model="novaAtiv.eisenhower" />
                    <span class="radio-mark"></span> 🗑️ Eliminar
                    <span class="tooltip-text">
                      <strong>Nem Urgente, Nem Importante:</strong> Distrações, tarefas desnecessárias ou desperdício de tempo.
                    </span>
                  </label>
                </div>
              </div>

              <!-- PRIORIZAÇÃO MOSCOW -->
              <div class="grupo-atributos margin-top-secao">
                <label class="label-secao">Priorização MoSCoW:</label>
                <div class="linha-checkboxes">
                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.moscow === 'must' }]">
                    <input type="radio" name="moscow" value="must" v-model="novaAtiv.moscow" />
                    <span class="radio-mark"></span> 🛑 Obrigatório (Must)
                    <span class="tooltip-text">
                      <strong>Must have:</strong> Indispensável. O projeto ou entrega não funciona sem este item.
                    </span>
                  </label>

                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.moscow === 'should' }]">
                    <input type="radio" name="moscow" value="should" v-model="novaAtiv.moscow" />
                    <span class="radio-mark"></span> ⚠️ Importante (Should)
                    <span class="tooltip-text">
                      <strong>Should have:</strong> Muito relevante, adiciona grande valor, mas há contornabilidade temporária.
                    </span>
                  </label>

                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.moscow === 'could' }]">
                    <input type="radio" name="moscow" value="could" v-model="novaAtiv.moscow" />
                    <span class="radio-mark"></span> 💡 Se possível (Could)
                    <span class="tooltip-text">
                      <strong>Could have:</strong> Desejável ou "agradável de ter" (Nice-to-have), feito se houver tempo extra.
                    </span>
                  </label>

                  <label :class="['item-checkbox tooltip-container', { selecionado: novaAtiv.moscow === 'wont' }]">
                    <input type="radio" name="moscow" value="wont" v-model="novaAtiv.moscow" />
                    <span class="radio-mark"></span> 🚫 Agora não (Won't)
                    <span class="tooltip-text">
                      <strong>Won't have:</strong> Não será feito neste ciclo/Sprint. Fica para entregas ou versões futuras.
                    </span>
                  </label>
                </div>
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

            <!-- Botões Dinâmicos de Ação -->
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

// Objeto reativo com a estrutura alinhada ao template
const novaAtiv = reactive({
  titulo: '',
  descricao: '',
  devId: '',
  smart: { 
    especifico: false, 
    mensuravel: false, 
    atingivel: false, 
    relevante: false, 
    temporal: false 
  },
  eisenhower: 'agendar',
  moscow: 'should',
  duracao: 'medio prazo15min',
  prioridade: 'Normal',
  risco: 'baixo',
  dependencia: 'Não',
  dependenciaAtividadeId: '',
  telaDestino: 'cadastro'
});

const obterDataHojeString = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const atividadesFiltradas = computed(() => {
  if (!termoBusca.value.trim()) return [];
  
  const hojeStr = obterDataHojeString();
  const termo = termoBusca.value.toLowerCase();

  return ativStore.atividades
    .filter(a => a.titulo.toLowerCase().includes(termo))
    .map(a => {
      let statusCalculado = 'Disponível';

      if (a.telaDestino === 'backlog') {
        statusCalculado = 'Já selecionado';
      } else if (a.telaDestino === 'hoje') {
        if (!a.concluida) {
          statusCalculado = 'Já selecionado';
        } else if (a.concluida && a.dataConclusao === hojeStr) {
          statusCalculado = 'Já selecionado';
        }
      }

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
  
  // Garante a cópia segura das propriedades do SMART com fallback
  novaAtiv.smart = {
    especifico: Boolean(ativ.smart?.especifico),
    mensuravel: Boolean(ativ.smart?.mensuravel),
    atingivel: Boolean(ativ.smart?.atingivel),
    relevante: Boolean(ativ.smart?.relevante),
    temporal: Boolean(ativ.smart?.temporal)
  };
  
  novaAtiv.eisenhower = ativ.eisenhower || 'agendar';
  novaAtiv.moscow = ativ.moscow || 'should';
  novaAtiv.duracao = ativ.duracao;
  novaAtiv.prioridade = ativ.prioridade;
  novaAtiv.risco = ativ.risco;
  novaAtiv.dependencia = ativ.dependencia;
  novaAtiv.dependenciaAtividadeId = ativ.dependenciaAtividadeId;
  novaAtiv.telaDestino = ativ.telaDestino;
  termoBusca.value = '';
};

const salvarDev = () => {
  if (!novoDevNome.value.trim()) return;
  cadastroStore.adicionarDev(novoDevNome.value);
  novoDevNome.value = '';
};

const salvarAtividade = () => {
  const hojeStr = obterDataHojeString();

  const jaExisteHoje = ativStore.atividades.some(a => 
    a.titulo.trim().toLowerCase() === novaAtiv.titulo.trim().toLowerCase() &&
    a.telaDestino === novaAtiv.telaDestino &&
    !a.concluida
  );

  if (jaExisteHoje && !editandoId.value) {
    alert(`A tarefa "${novaAtiv.titulo}" já está presente na tela ${novaAtiv.telaDestino.toUpperCase()} hoje!`);
    return;
  }

  const ativOriginal = editandoId.value 
    ? ativStore.atividades.find(a => a.id === editandoId.value) 
    : null;

  const ehReutilizacao = ativOriginal && ativOriginal.concluida;

  if (ehReutilizacao) {
    const novaCopiaReutilizada = {
      ...novaAtiv,
      smart: { ...novaAtiv.smart },
      id: undefined, 
      concluida: false,
      dataConclusao: null,
      impedida: false,
      detalhesDia: novaAtiv.detalhesDia || "",
      dataCriacao: hojeStr,
      dataEntradaBacklog: (novaAtiv.telaDestino === 'backlog' || novaAtiv.telaDestino === 'hoje') 
        ? hojeStr 
        : null
    };

    ativStore.adicionarAtividade(novaCopiaReutilizada);

  } else if (editandoId.value) {
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
  novaAtiv.smart = { 
    especifico: false, 
    mensuravel: false, 
    atingivel: false, 
    relevante: false, 
    temporal: false 
  };
  novaAtiv.eisenhower = 'agendar';
  novaAtiv.moscow = 'should';
  novaAtiv.duracao = 'medio prazo15min';
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

.backup-box {
  margin-bottom: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
}

.backup-box h3 {
  margin-top: 0;
  font-size: 1.05rem;
  color: #2d3748;
}

.backup-box p {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 12px;
}

.botoes-backup {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-backup {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-backup.exportar {
  background-color: #3182ce;
  color: white;
}

.btn-backup.exportar:hover {
  background-color: #2b6cb0;
}

.btn-backup.importar {
  background-color: #38a169;
  color: white;
}

.btn-backup.importar:hover {
  background-color: #2f855a;
}

/* --- ESTRUTURA DOS ATRIBUTOS --- */
.secao-atributos {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin: 15px 0;
}

.margin-top-secao {
  margin-top: 16px;
}

.label-secao {
  display: block;
  font-weight: bold;
  font-size: 0.9rem;
  color: #2d3748;
  margin-bottom: 8px;
}

.linha-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.item-checkbox {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #4a5568;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.item-checkbox:hover {
  border-color: #3182ce;
  background-color: #ebf8ff;
}

.item-checkbox input {
  margin-right: 6px;
  cursor: pointer;
}

/* --- ESTILO DE TOOLTIP EXPLICATIVO --- */
.tooltip-container {
  position: relative;
}

.tooltip-text {
  visibility: hidden;
  width: 220px;
  background-color: #2d3748;
  color: #ffffff;
  text-align: left;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.78rem;
  line-height: 1.3;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);

  position: absolute;
  z-index: 100;
  bottom: 125%; 
  left: 50%;
  transform: translateX(-50%);

  opacity: 0;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #2d3748 transparent transparent transparent;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.tooltip-text strong {
  color: #63b3ed;
  display: block;
  margin-bottom: 2px;
}
</style>