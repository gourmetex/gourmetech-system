<template>
    <div class="reports-component">
        <div class="page-title"><h1>Relatórios</h1><p>Acompanhe os resultados por período.</p></div>
        <div v-if="companyId" class="company-context">
            <span class="material-icons">apartment</span>
            <div><strong>Empresa vinculada</strong><p>{{ companyName || 'Empresa #' + companyId }}</p></div>
            <router-link to="/home/reports">Ver minha empresa</router-link>
        </div>
        <div class="report-types" aria-label="Tipos de relatório">
            <button v-for="item in relatoriosTipos" :key="item.codigo" type="button" class="report-type"
                :class="{ active: reportType === item.codigo }" :aria-pressed="reportType === item.codigo"
                @click="selecionaRelatorio(item.codigo)">
                <span class="material-icons">{{ item.icon }}</span><span>{{ item.title }}</span>
            </button>
        </div>
        <div v-if="error" class="report-message error" role="alert">{{ error }}</div>
        <LoadingState v-if="loading" message="Gerando relatório" />
        <div v-else-if="!relatorio.dados && !error" class="report-message">Selecione um relatório para começar.</div>
        <section v-if="relatorio.dados && !loading" class="report-panel">
            <div class="report-heading">
                <div><span class="eyebrow">VISÃO GERAL</span><h2>{{ relatorio.title }}</h2><p>{{ periodLabel }}</p></div>
                <form class="report-filters" @submit.prevent="search">
                    <label>Tipo<select v-model="dateRange"><option value="anual">Anual</option><option value="semanal">Semanal</option></select></label>
                    <label>Competência<input v-if="dateRange === 'anual'" type="number" v-model="year" min="1000" max="9999" required /><input v-else type="week" v-model="week" required /></label>
                    <button type="submit" class="btn btn-primary">Buscar</button>
                    <button type="button" class="btn btn-gray" @click="exportToExcel">Exportar</button>
                </form>
            </div>
            <div class="report-summary" v-if="relatorio.dados.labels.length">
                <div v-for="dataset in relatorio.dados.datasets" :key="dataset.label" class="summary-card">
                    <span>{{ dataset.label }}</span><strong>{{ formatReportData(sumDataset(dataset)) }}</strong><small>Total no período</small>
                </div>
            </div>
            <div v-if="relatorio.dados.labels.length" class="chart-panel">
                <div class="chart-heading"><h3>Distribuição dos resultados</h3><p>Valores por {{ relatorio.codigo === 'cancelamentos' ? 'motivo' : (loadedDateRange === 'anual' ? 'mês' : 'dia') }}</p></div>
                <div class="chart-area"><chartComponent :chartData="relatorio.dados" :chartType="relatorio.tipo" :chartReportType="relatorio.codigo" /></div>
            </div>
            <div v-else class="report-message">Não há dados para o período selecionado.</div>
        </section>
    </div>
</template>
<script>
import chartComponent from '@/components/chartComponent.vue';
import LoadingState from '@/components/LoadingState.vue';
import api from '@/configs/api';
import * as XLSX from 'xlsx';

export default {
    name: 'reportsComponent',
    components: { chartComponent, LoadingState },
    data() {
        return {
            reportType: '', companyId: null, companyName: '', requestId: 0,
            relatoriosTipos: [
                { codigo: 'faturamento', title: 'Faturamento', icon: 'bar_chart' },
                { codigo: 'despesas', title: 'Despesas', icon: 'request_quote' },
                { codigo: 'vendas', title: 'Vendas', icon: 'shopping_bag' },
                { codigo: 'cancelamentos', title: 'Cancelamentos', icon: 'cancel' }
            ],
            relatorio: { title: '', dados: null, tipo: 'bar', codigo: '' },
            loading: false, error: '', loadedDateRange: 'anual', loadedRange: '', dateRange: 'anual', year: new Date().getFullYear(), week: '', range: new Date().getFullYear()
        };
    },
    computed: {
        periodLabel() { return this.loadedDateRange === 'anual' ? 'Ano ' + this.loadedRange : 'Semana ' + this.loadedRange; }
    },
    watch: { '$route.query': { handler() { this.checkUrl(); }, deep: true } },
    mounted() { this.checkUrl(); },
    methods: {
        sumDataset(dataset) { return dataset.data.reduce((sum, value) => sum + (Number(value) || 0), 0); },
        formatReportData(value) {
            const number = Number(value) || 0;
            return ['faturamento', 'despesas', 'cancelamentos'].includes(this.relatorio.codigo)
                ? number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : number.toLocaleString('pt-BR');
        },
        search() { this.range = this.dateRange === 'anual' ? this.year : this.week; this.selecionaRelatorio(this.reportType); },
        async selecionaRelatorio(tipo) {
            const selected = this.relatoriosTipos.find(item => item.codigo === tipo);
            if (!selected) return;
            const requestId = ++this.requestId;
            this.reportType = tipo; this.loading = true; this.error = ''; this.relatorio.dados = null;
            try {
                const data = { type: tipo, competence: this.dateRange, range: this.range };
                if (this.companyId) data.company_id = this.companyId;
                const response = await api.post('/reports', data);
                if (requestId !== this.requestId) return;
                this.loadedDateRange = data.competence; this.loadedRange = data.range;
                this.relatorio = { title: selected.title, dados: response.data.returnObj, tipo: 'bar', codigo: tipo };
            } catch (error) {
                if (requestId !== this.requestId) return;
                this.error = 'Não foi possível carregar o relatório. Verifique o período e tente novamente.';
            } finally { if (requestId === this.requestId) this.loading = false; }
        },
        async checkUrl() {
            const query = this.$route.query;
            this.requestId++; this.loading = false; this.error = ''; this.relatorio.dados = null;
            this.companyId = query.company_id || (query.type === 'linkedCompany' ? query.id : null);
            this.companyName = '';
            if (query.competence && query.range) {
                this.dateRange = query.competence; this.range = query.range;
                if (this.dateRange === 'anual') this.year = query.range; else this.week = query.range;
            }
            if (this.companyId) {
                const companyId = this.companyId;
                try {
                    const response = await api.get('/companies/return_linked_companies');
                    if (String(this.companyId) !== String(companyId)) return;
                    const company = response.data.returnObj.find(item => String(item.id) === String(companyId));
                    if (!company) { this.error = 'Empresa vinculada não encontrada ou sem permissão de acesso.'; return; }
                    this.companyName = company.nome;
                } catch (error) { this.error = 'Não foi possível identificar a empresa vinculada.'; return; }
            }
            this.selecionaRelatorio(this.relatoriosTipos.some(item => item.codigo === query.type) ? query.type : 'faturamento');
        },
        exportToExcel() {
            const data = this.relatorio.dados;
            if (!data) return;
            const rows = [['Período', ...data.datasets.map(dataset => dataset.label)], ...data.labels.map((label, i) => [label, ...data.datasets.map(dataset => Number(dataset.data[i]) || 0)])];
            const sheet = XLSX.utils.aoa_to_sheet(rows);
            sheet['!cols'] = rows[0].map(() => ({ wch: 24 }));
            const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, 'Relatório');
            XLSX.writeFile(book, this.relatorio.title + (this.companyName ? ' - ' + this.companyName : '') + '.xlsx');
        }
    }
};
</script>
<style scoped>
.page-title p, .report-heading p, .chart-heading p { color: var(--ink-soft, #6b6255); margin: 5px 0 0; }
.company-context { display: flex; align-items: center; gap: 12px; padding: 14px 18px; margin-bottom: 20px; border: 1px solid #bad9ce; border-radius: 10px; background: #eff8f4; color: #225d4d; }
.company-context p { margin: 3px 0 0; } .company-context a { margin-left: auto; color: #225d4d; font-weight: 600; }
.report-types { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
.report-type { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--line, #e7e1d6); border-radius: 10px; background: #fff; color: #4d4840; font-weight: 600; cursor: pointer; text-align: left; }
.report-type .material-icons { padding: 9px; border-radius: 9px; background: #f3f1ed; color: #517961; }
.report-type:hover, .report-type.active { border-color: #318468; background: #f3faf6; color: #205d49; }
.report-panel { background: #fff; border: 1px solid var(--line, #e7e1d6); border-radius: 12px; padding: 24px; }
.report-heading { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
.report-heading h2, .chart-heading h3 { margin: 4px 0; } .eyebrow { font-size: 11px; letter-spacing: .1em; font-weight: 700; color: #578674; }
.report-filters { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; } .report-filters label { display: grid; gap: 6px; margin: 0; font-size: 12px; font-weight: 600; color: #6b6255; }
.report-filters input, .report-filters select { min-height: 42px; width: 145px; border: 1px solid #dedbd4; border-radius: 6px; padding: 8px; background: #fff; }
.report-filters .btn { min-width: auto; min-height: 42px; margin: 0; }
.report-summary { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0; } .summary-card { flex: 1 1 200px; display: grid; gap: 7px; padding: 18px; border: 1px solid #eeeae3; border-radius: 10px; background: #faf9f6; }
.summary-card span, .summary-card small { color: #746e64; } .summary-card strong { font-size: 24px; color: #253c33; }
.chart-panel { border: 1px solid #eeeae3; border-radius: 10px; padding: 20px; } .chart-heading p { font-size: 13px; } .chart-area { height: 340px; margin-top: 20px; }
.report-message { padding: 32px; text-align: center; color: #746e64; } .report-message.error { color: #a32626; background: #fff1f1; border-radius: 8px; }
@media (max-width: 800px) { .report-types { grid-template-columns: repeat(2, minmax(0, 1fr)); } .report-panel { padding: 16px; } .chart-area { height: 280px; } }
@media (max-width: 480px) { .report-type { padding: 10px; gap: 7px; } .company-context { flex-wrap: wrap; } .report-filters label { flex: 1 1 130px; } .report-filters input, .report-filters select { width: 100%; } }
</style>
