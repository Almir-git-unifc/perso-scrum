export function useDatas() {
    /** calcular atrasos e filtrar o "Feito Ontem" */
  const obterDataHojeFormatada = () => {
    return new Date().toISOString().split('T')[0];
  };

  const obterDataOntemFormatada = () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    return ontem.toISOString().split('T')[0];
  };

 const calcularDiasDeAtraso = (parametro) => {
  if (!parametro) return 0;

  let dataInicialStr = '';
  let dataFinalObj = new Date();

  // 1. Extrai as strings corretas dependendo do parâmetro recebido
  if (typeof parametro === 'string') {
    dataInicialStr = parametro;
  } else if (typeof parametro === 'object') {
    if (parametro.concluida && parametro.dataConclusao) {
      // Se já concluiu, calcula até o dia da conclusão
      dataInicialStr = parametro.dataEntradaBacklog || parametro.dataCriacao;
      const partesFim = parametro.dataConclusao.split('-');
      // Cria a data local de forma segura (ano, mes - 1, dia)
      dataFinalObj = new Date(partesFim[0], partesFim[1] - 1, partesFim[2]);
    } else {
      // Se está em andamento, calcula até HOJE
      dataInicialStr = parametro.dataEntradaBacklog || parametro.dataCriacao;
    }
  }

  if (!dataInicialStr) return 0;

  // 2. Divide a string "YYYY-MM-DD" para evitar conversão automática para UTC
  const partesInicio = dataInicialStr.split('-');
  if (partesInicio.length !== 3) return 0;

  // Cria os objetos de data baseados estritamente no horário local do navegador
  const dataInicial = new Date(partesInicio[0], partesInicio[1] - 1, partesInicio[2]);
  const dataFinal = new Date(dataFinalObj.getFullYear(), dataFinalObj.getMonth(), dataFinalObj.getDate());

  // Zera as horas para garantir que estamos comparando apenas os dias inteiros
  dataInicial.setHours(0, 0, 0, 0);
  dataFinal.setHours(0, 0, 0, 0);

  // 3. Calcula a diferença absoluta em dias
  const diferencaEmMilissegundos = dataFinal.getTime() - dataInicial.getTime();
  const diferencaEmDias = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));

  return diferencaEmDias > 0 ? diferencaEmDias : 0;
};

  return {
    obterDataHojeFormatada,
    obterDataOntemFormatada,
    calcularDiasDeAtraso
  };
}
