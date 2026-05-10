<template>
    <div class="container">
      <div class="content">
        <!-- Ícone de bloqueio -->
        <span class="lock-icon">lock</span>
  
        <!-- Mensagem -->
        <h1 class="title">Acesso Negado</h1>
        <p class="message">Você não tem permissão para acessar esta área do sistema.</p>
  
        <!-- Contador regressivo -->
        <p class="countdown">
          Redirecionando em <span class="countdown-number">{{ countdown }}</span> segundos...
        </p>
      </div>
      <signatureComponent />
    </div>
  </template>
  
  <script>
    import signatureComponent from "../components/signatureComponent.vue";

  export default {
    name: "forbiddenPage",
    data() {
      return {
        countdown: 5 // Tempo inicial para redirecionamento
      };
    },
    components: {
        signatureComponent
    },
    methods: {
      goHome() {
        this.$router.push('/home'); // Redireciona imediatamente
      }
    },
    mounted() {
      // Inicia a contagem regressiva e redireciona após 5 segundos
      const interval = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--;
        } else {
          clearInterval(interval);
          this.goHome();
        }
      }, 1000);
    }
  };
  </script>
  
  <style scoped>
  /* CSS para a tela */
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--gray-3);
    padding: 20px;
  }
  
  .content {
    background-color: var(--white);
    padding: 40px;
    text-align: center;
    box-shadow: var(--boxshadow-default);
    border-radius: 15px;
    max-width: 400px;
    width: 100%;
  }
  
  .lock-icon {
    font-family: 'Material Icons';
    color: var(--orange);
    font-size: 80px;
    margin-bottom: 20px;
    animation: pulse 1s infinite;
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: var(--black);
    margin-bottom: 10px;
  }
  
  .message {
    color: var(gray);
    margin-bottom: 20px;
  }
  
  .countdown {
    color: var(gray-2);
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .countdown-number {
    font-weight: bold;
    color: var(--orange);
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  </style>
  