<template>

<div class="layout">
    <GlobalMenu/>
    <main>
        <slot/>
    </main>
</div>
</template>

<script setup>
import GlobalMenu from '../components/GlobalMenu.vue'
</script>

<style scoped>
.layout{
    display:flex;
    min-height:100vh;
}

main{
    flex:1;
    padding:20px;
}
</style>