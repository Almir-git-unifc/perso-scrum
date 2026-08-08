<template>
  <div>
    <div class="logo">
      <h2>Scrum App</h2>
      <img src="/Scrum.svg" alt="Logo Diario App" class="logo-img" />
    </div>
    <nav>
      <RouterLink to="/cadastro">Cadastro</RouterLink>
      <RouterLink to="/backlog">Backlog</RouterLink>
      <RouterLink to="/hoje">Fazendo Hoje</RouterLink>
      <RouterLink to="/ontem">Feito Ontem</RouterLink>
      <RouterLink to="/impedimentos">Impedimentos</RouterLink>
      <RouterLink to="/metas">Idéias Futuras</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.logo,
nav {
  background: #34495e;
}

nav {
  width: 250px;
  height: 100vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 15px;
  color: white;
}

a {
  color: white;
  padding: 15px;
  text-decoration: none;
}

a.router-link-active {
  background: #2c3e50;
}

</style>
