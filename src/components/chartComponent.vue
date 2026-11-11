<template><canvas ref="canvas"></canvas></template>
<script>
import { Chart, Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, BarController, LineController } from 'chart.js';
Chart.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, BarController, LineController);
export default {
  name: 'chartComponent',
  props: { chartData: { type: Object, required: true }, chartType: { type: String, required: true }, chartReportType: { type: String, required: true }, chartTitle: { type: String, default: '' } },
  data() { return { chartInstance: null }; },
  mounted() { this.renderChart(); },
  beforeDestroy() { if (this.chartInstance) this.chartInstance.destroy(); },
  watch: { chartData: { deep: true, handler() { this.renderChart(); } }, chartType() { this.renderChart(); } },
  methods: {
    formatValue(value) {
      return ['faturamento', 'despesas', 'cancelamentos'].includes(this.chartReportType)
        ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : Number(value).toLocaleString('pt-BR');
    },
    renderChart() {
      if (this.chartInstance) this.chartInstance.destroy();
      const palette = ['#348466', '#df9a51', '#6688ad', '#b76b70'];
      const datasets = this.chartData.datasets.map((dataset, index) => ({
        ...dataset, backgroundColor: palette[index % palette.length], borderColor: palette[index % palette.length],
        borderRadius: 5, maxBarThickness: 42, borderSkipped: false
      }));
      this.chartInstance = new Chart(this.$refs.canvas, {
        type: this.chartType, data: { ...this.chartData, datasets },
        options: {
          maintainAspectRatio: false, responsive: true,
          plugins: {
            legend: { display: datasets.length > 1, position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, padding: 18 } },
            title: { display: !!this.chartTitle, text: this.chartTitle, align: 'start', font: { size: 15, weight: '600' }, padding: { bottom: 16 } },
            tooltip: { backgroundColor: '#263a32', padding: 12, callbacks: { label: context => context.dataset.label + ': ' + this.formatValue(context.raw || 0) } }
          },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: '#746e64', maxRotation: 45 } },
            y: { beginAtZero: true, border: { display: false }, grid: { color: '#eeeae3' }, ticks: { color: '#746e64', padding: 10, callback: value => this.formatValue(value) } }
          }
        }
      });
    }
  }
};
</script>
<style scoped>canvas { width: 100%; height: 100%; max-height: calc(100vh - 300px); }</style>
