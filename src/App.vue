<template>
    <router-view/>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { useAtividadesStore } from './stores/atividades';

    const atividadesStore = useAtividadesStore();

    onMounted(() => {
    /** Method onMounted de App.vue = Dispara a leitura do localStorage assim que o componente principal for montado  */
    atividadesStore.carregarLocal();
    });
</script>
