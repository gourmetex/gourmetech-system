<template>
  <div class="select-personalizado" ref="wrapper">
    <label for="banco-select">{{ bancoSelecionado ? "Banco: " : "Selecione o Banco:" }}</label>
    <div class="control-container">
      <input
        v-model="filtro"
        type="text"
        placeholder="Buscar banco por nome ou código..."
        @focus="abrirLista"
        @input="filtrarBancos"
      />
      <div v-if="listaAberta" class="lista-bancos">
        <ul v-if="bancosFiltrados.length">
          <li
            v-for="banco in bancosFiltrados"
            :key="banco.ispb"
            @click="selecionarBanco(banco)"
          >
            {{ banco.code }} - {{ banco.fullName }}
          </li>
        </ul>
        <div v-else class="nenhum-encontrado">
          Nenhum banco encontrado.
        </div>
      </div>
    </div>
    <div v-if="bancoSelecionado" class="banco-selecionado">
      <p>Banco selecionado: <strong>{{ bancoSelecionado.fullName }}</strong> ({{ bancoSelecionado.code }})</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
    props: ["banco"],
  data() {
    return {
      bancos: [],
      bancosFiltrados: [],
      bancoSelecionado: null,
      filtro: '',
      listaAberta: false
    };
  },
  mounted() {
    this.fetchBancos();
    document.addEventListener('click', this.fecharAoClicarFora);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.fecharAoClicarFora);
  },
  watch: {
    bancos: {
        handler() {
            this.checkSelectedBank();
        }, 
        deep: true
    },
    banco: {
        handler() {
            this.checkSelectedBank();
        }, 
        deep: true
    }
  },
  methods: {
    checkSelectedBank: function () {
        if (this.banco) {
            let bancoFiltrado = this.bancos.filter(bank => bank.code == this.banco);

            if (bancoFiltrado.length) {
                this.bancoSelecionado = bancoFiltrado[0];
            }
        }
    },
    fecharAoClicarFora(event) {
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(event.target)) {
        this.listaAberta = false;
      }
    },
    async fetchBancos() {
      try {
        const response = await axios.get('https://brasilapi.com.br/api/banks/v1');
        this.bancos = response.data;
        this.bancosFiltrados = this.bancos;
      } catch (error) {
        console.error("Erro ao buscar a lista de bancos:", error);
      }
    },
    filtrarBancos() {
      if (!this.filtro) {
        this.bancosFiltrados = this.bancos;
        return;
      }
      const filtroLowerCase = this.filtro.toLowerCase();
      this.bancosFiltrados = this.bancos.filter(banco => {
        const nomeBanco = banco.fullName.toLowerCase();
        const codigoBanco = banco.code ? banco.code.toString() : '';
        return nomeBanco.includes(filtroLowerCase) || codigoBanco.includes(filtroLowerCase);
      });
    },
    abrirLista() {
      this.listaAberta = true;
      
      this.$nextTick(() => {
        document.querySelector(".lista-bancos").scrollIntoView({ behavior: "smooth" });
      })
    },
    selecionarBanco(banco) {
      this.bancoSelecionado = banco;
      this.filtro = banco.fullName;
      this.listaAberta = false;
      this.$emit("select", this.bancoSelecionado.code);
    }
  }
};
</script>

<style scoped>
.select-personalizado {
  max-width: 100%;
  margin: var(--space-6) 0;
  position: relative;
}

.control-container {
  position: relative;
}

.lista-bancos {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--gray-3);
  background-color: var(--white);
  border-radius: var(--radius-sm);
  box-shadow: var(--boxshadow-default);
}

.lista-bancos ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.lista-bancos li {
  padding: var(--space-4);
  cursor: pointer;
  color: var(--black);
  border-bottom: 1px solid var(--gray-high);
  font-size: var(--fontsize-sm);
}

.lista-bancos li:last-child {
  border-bottom: none;
}

.lista-bancos li:hover {
  background-color: var(--blue-high-2);
  color: var(--blue-low);
}

.banco-selecionado {
  margin-top: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--gray-3);
  border-radius: var(--radius-sm);
  background-color: var(--gray-high);
}

.nenhum-encontrado {
  padding: var(--space-4);
  text-align: center;
  color: var(--gray);
  font-size: var(--fontsize-sm);
}
</style>