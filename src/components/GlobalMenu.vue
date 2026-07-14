<template>
<nav>
    <RouterLink to="/cadastro">Cadastro</RouterLink>
    <RouterLink to="/backlog">Backlog</RouterLink>
    <RouterLink to="/hoje">Fazendo Hoje</RouterLink>
    <RouterLink to="/ontem">Feito Ontem</RouterLink>
    <RouterLink to="/impedimentos">Impedimentos</RouterLink>
    <RouterLink to="/metas">Metas Futuras</RouterLink>
</nav>
</template>

<style scoped>
nav{
    width:250px;
    background:#34495e;
    display:flex;
    flex-direction:column;
}

a{
    color:white;
    padding:15px;
    text-decoration:none;
}

a.router-link-active{
    background:#2c3e50;
}
</style>