<template>
    <router-view/>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { useAtividadesStore } from './stores/atividades';

    const atividadesStore = useAtividadesStore();

    onMounted(() => {
    /** Method onMounted de App.vue = Carrega os dados do localStorage na inicialização da aplicação  */
    atividadesStore.carregarLocal();
    });
</script>
