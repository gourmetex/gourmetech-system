<template>
    <div class="home">
        <div class="desktop-header">
            <div class="user">
                <div class="user-informations">
                    <h1>Olá, {{ $root.user.nome }}</h1>
                    <span>{{ today }}</span>
                </div>
            </div>
        </div>
        <div class="parent">
            <div class="left-charts">
                <div class="desktop-chart clickable" @click="goToChart('faturamento')">
                    <LoadingState v-if="loadingFaturamento" size="small" />
                    <chartComponent v-if="!loadingFaturamento" :chartData="faturamento.dados"
                        :chartType="faturamento.tipo" :chartReportType="faturamento.codigo"
                        :chartTitle="faturamento.dados.datasets[0].label" />
                </div>
                <div class="desktop-chart clickable" @click="goToChart('despesas')">
                    <LoadingState v-if="loadingDespesas" size="small" />
                    <chartComponent v-if="!loadingDespesas" :chartData="despesas.dados" :chartType="despesas.tipo"
                        :chartReportType="despesas.codigo" :chartTitle="despesas.dados.datasets[0].label" />
                </div>
            </div>
            <div class="right-charts">
                <div class="desktop-chart clickable" @click="goToChart('vendas')">
                    <LoadingState v-if="loadingVendas" size="small" />
                    <chartComponent v-if="!loadingVendas" :chartData="vendas.dados" :chartType="vendas.tipo"
                        :chartReportType="vendas.codigo" :chartTitle="vendas.dados.datasets[0].label" />
                </div>
                <div class="desktop-chart">
                    <h3 class="chart-header-title">Produtos mais vendidos (Semanal)</h3>
                    <dataTable :dataobj="produtos_vendidos" rowsperpage="7" :loaded="!loadingProdutosVendidos">
                        <grid-column prop="nome" label="Nome"></grid-column>
                        <grid-column prop="quantidade_vendida" label="Qtd" width="70px" align="center" />
                        <grid-column prop="total_faturado" label="Total" width="100px" align="right" v-slot="props">
                            {{ formatCurrency(props.item.total_faturado) }}
                        </grid-column>
                    </dataTable>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import moment from 'moment';
import chartComponent from '@/components/chartComponent.vue';
import api from "@/configs/api";
import { globalMethods } from "@/js/globalMethods";
import dataTable from "./dataTable.vue";
import LoadingState from "./LoadingState.vue";

export default {
    name: "homeComponent",
    mixins: [globalMethods],
    data() {
        return {
            today: null,
            produtos_vendidos: [],
            faturamento: {
                title: "Faturamento",
                dados: null,
                tipo: "bar",
                codigo: ""
            },
            despesas: {
                title: "Despesas",
                dados: null,
                tipo: "bar",
                codigo: ""
            },
            vendas: {
                title: "Vendas",
                dados: null,
                tipo: "bar",
                codigo: ""
            },
            loadingFaturamento: true,
            loadingDespesas: true,
            loadingVendas: true,
            loadingProdutosVendidos: true
        }
    },
    components: {
        chartComponent,
        dataTable,
        LoadingState
    },
    methods: {
        returnToday: function () {
            let today = moment().format("dddd") + ", " + moment().format("LL");
            return today;
        },
        retornaRelatorio: async function (type, competence, range) {
            let data = {
                type: type,
                competence: competence,
                range: range
            }

            let response = await api.post("/reports", data);

            let relatorio = {
                dados: response.data.returnObj,
                tipo: "bar",
                codigo: "bar",
                title: this.capitalize(type)
            }

            return relatorio;
        },
        getNumeroDaSemanaISO(data = new Date()) {
            const dataCopia = new Date(data.valueOf());

            dataCopia.setDate(dataCopia.getDate() + 4 - (dataCopia.getDay() || 7));

            const ano = dataCopia.getFullYear();
            const inicioDoAno = new Date(ano, 0, 1);
            const diferencaEmDias = (dataCopia - inicioDoAno) / 86400000;
            const semana = Math.ceil((diferencaEmDias + 1) / 7);
            const semanaFormatada = String(semana).padStart(2, '0');

            return `${ano}-W${semanaFormatada}`;
        },
        goToChart: function (tipo) {
            this.$router.push("/home/reports?type=" + tipo + "&competence=semanal&range=" + this.getNumeroDaSemanaISO())
        }
    },
    mounted: async function () {
        let semanaAtual = this.getNumeroDaSemanaISO();

        moment.locale("pt-br");

        this.today = this.returnToday();

        this.faturamento = { ...await this.retornaRelatorio("faturamento", "semanal", semanaAtual) };
        this.loadingFaturamento = false;

        this.despesas = { ...await this.retornaRelatorio("despesas", "semanal", semanaAtual) };
        this.loadingDespesas = false;

        this.vendas = { ...await this.retornaRelatorio("vendas", "semanal", semanaAtual) };
        this.loadingVendas = false;
        
        this.produtos_vendidos = await this.retornaRelatorio("produtos_vendidos", "semanal", semanaAtual).dados || [];
        this.loadingProdutosVendidos = false;
    }
}
</script>
<style scoped>
.home {
    min-height: 100%;
    overflow-y: auto;
    padding-bottom: var(--space-8);
}

.home ::v-deep canvas,
.home :deep(canvas) {
    max-height: 280px !important;
    width: 100% !important;
}

.desktop-header {
    margin-bottom: var(--space-2);
}

.parent {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: var(--space-5);
    margin-top: var(--space-4);
    align-items: start;
}

.left-charts,
.right-charts {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

.desktop-chart {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px rgba(43, 38, 32, 0.04);
    padding: var(--space-5);
    box-sizing: border-box;
    transition: transform 120ms ease, box-shadow 120ms ease;
    overflow: hidden;
}

.desktop-chart.clickable {
    cursor: pointer;
}

.desktop-chart.clickable:hover {
    box-shadow: 0 4px 14px rgba(43, 38, 32, 0.08);
    transform: translateY(-2px);
}

.chart-header-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 var(--space-2) 0;
}

@media (max-width: 1024px) {
    .parent {
        grid-template-columns: 1fr;
    }
}
</style>
