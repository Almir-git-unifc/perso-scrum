import { defineStore } from 'pinia';

export const useAlertasStore = defineStore('alertas', {
    /** Method useAlertasStore = Gerencia oe stado do Scrum, e armazena alertas, cadastro e atividades */
  state: () => ({
    alertasPorTela: {}
  }),
  actions: {
    adicionarAlerta(tela, texto, tipo = 'info') {
      if (!this.alertasPorTela[tela]) {
        this.alertasPorTela[tela] = [];
      }

      if (this.alertasPorTela[tela].length >= 3) {
        /**Limita estritamente a 3 alertas por tela  */ 
        this.alertasPorTela[tela].shift(); /** alerta[tela].shift() Remove o mais antigo  */ 
      }
      this.alertasPorTela[tela].push({ id: Date.now(), texto, tipo });
    },
    removerAlerta(tela, id) {
      if (this.alertasPorTela[tela]) {
        this.alertasPorTela[tela] = this.alertasPorTela[tela].filter(a => a.id !== id);
      }
    }
  }
});
