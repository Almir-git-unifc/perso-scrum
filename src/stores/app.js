import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => ({
        titulo: 'Meu Scrum',
        versao: '1.0'
    }),

    getters: {
        nomeCompleto(state){
            return `${state.titulo} ${state.versao}`
        }
    }
})