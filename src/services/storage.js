const STORAGE_KEYS = {
  DEV: 'scrum_devs',
  ATIVIDADE: 'scrum_atividades',
  IMPEDIMENTO_OPCOES: 'scrum_impedimento_opcoes'
};

export const storageService = {
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  set(key, value) {
    /** Method setter in localStorage */
    localStorage.setItem(key, JSON.stringify(value));
  },


  getDevs() {
    /** Method gedDevs in localStorage - Helpers específicos */
    return this.get(STORAGE_KEYS.DEV) || [];
  },
  saveDevs(devs) {
    this.set(STORAGE_KEYS.DEV, devs);
  },

  getAtividades() {
    /** Method getAtividades in localStorage */
    return this.get(STORAGE_KEYS.ATIVIDADE) || [];
  },
  saveAtividades(atividades) {
    this.set(STORAGE_KEYS.ATIVIDADE, atividades);
  }
};
