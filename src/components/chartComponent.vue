<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { Chart, Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, BarController, LineController } from "chart.js";

// Registrar os componentes necessários
Chart.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, BarController, LineController);

export default {
  name: "chartComponent",
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartType: {
      type: String,
      required: true,
    },
    chartTitle: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      chartInstance: null,
    };
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    getCSSColor(variable) {
      return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    },
    renderChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy(); // Destrói a instância anterior
      }

      if (this.chartData && this.chartData.datasets) {
        this.chartData.datasets.forEach(dataset => {
          if (dataset.backgroundColor.startsWith("--")) {
            dataset.backgroundColor = this.getCSSColor(dataset.backgroundColor);
          }
        });
      }

      this.chartInstance = new Chart(this.$refs.canvas, {
        type: this.chartType, // 'bar' ou 'line'
        data: this.chartData,
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: this.chartTitle,
                    font: {
                        size: 20,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let value = context.raw || 0;
                            return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
                        }
                    }
                }
            }
        }
    });
    },
  },
};
</script>

<style scoped>
canvas {
  width: 100%;
  max-height: calc(100vh - 300px);
  border: 1px solid var(--gray-3);
  border-radius: var(--radius-md);
  overflow: hidden;
  padding: var(--space-3);
}
</style>
