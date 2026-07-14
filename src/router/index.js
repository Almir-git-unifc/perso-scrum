import { createRouter, createWebHistory } from 'vue-router'
import Cadastro from '../views/Cadastro.vue'
import Backlog from '../views/Backlog.vue'
import FazendoHoje from '../views/FazendoHoje.vue'
import FeitoOntem from '../views/FeitoOntem.vue'
import Impedimentos from '../views/Impedimentos.vue'
import MetasFuturas from '../views/MetasFuturas.vue'

const routes = [
    {
        path: '/',
        redirect: '/backlog'
    },

    {
        path: '/cadastro',
        component: Cadastro
    },

    {
        path: '/backlog',
        component: Backlog
    },

    {
        path: '/hoje',
        component: FazendoHoje
    },

    {
        path: '/ontem',
        component: FeitoOntem
    },

    {
        path: '/impedimentos',
        component: Impedimentos
    },

    {
        path: '/metas',
        component: MetasFuturas
    }

]

export default createRouter({
    history: createWebHistory(),
    routes

})