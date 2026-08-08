import { defineStore } from 'pinia';
import { storageService } from '../services/storage';

export const useCadastroStore = defineStore('cadastro', {
    /** Method useCadastroStore = Gerencia a lista de cadastro e Devs */
  state: () => ({
    devs: storageService.getDevs()
  }),
  actions: {
    adicionarDev(nome) {
      const novoDev = { id: Date.now().toString(), nome };
      this.devs.push(novoDev);
      storageService.saveDevs(this.devs);
    },
    excluirDev(id) {
      this.devs = this.devs.filter(d => d.id !== id);
      storageService.saveDevs(this.devs);
    }
  }
});
