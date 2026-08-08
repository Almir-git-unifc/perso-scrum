<template>
  <div class="layout">
    <GlobalMenu />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import GlobalMenu from "../components/GlobalMenu.vue";
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh; /* Ocupa exatamente a altura visível da tela */
  width: 100vw;
  overflow: hidden; /* Impede a rolagem na janela do navegador */
}

main {
  flex: 1; /* Ocupa todo o espaço restante na horizontal */
  height: 100vh; /* Força o main a ter a mesma altura da tela */
  overflow-y: auto; /* Faz Apenas o conteúdo interno do main rolar! */
  padding: 20px;
  box-sizing: border-box; /* Evita que o padding estoure a altura */
}
</style>
