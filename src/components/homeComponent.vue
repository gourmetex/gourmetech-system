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
            <div class="div1">
                <div class="desktop-chart" @click="goToChart('faturamento')" style="cursor: pointer;">
                    <lottie-player background="transparent" speed="1" loop autoplay
                        v-show="loadingFaturamento"></lottie-player>
                    <chartComponent v-if="!loadingFaturamento" :chartData="faturamento.dados"
                        :chartType="faturamento.tipo" :chartReportType="faturamento.codigo"
                        :chartTitle="faturamento.dados.datasets[0].label" />
                </div>
            </div>
            <div class="div2">
                <div class="desktop-chart" @click="goToChart('despesas')" style="cursor: pointer;">
                    <lottie-player background="transparent" speed="1" loop autoplay
                        v-show="loadingDespesas"></lottie-player>
                    <chartComponent v-if="!loadingDespesas" :chartData="despesas.dados" :chartType="despesas.tipo"
                        :chartReportType="despesas.codigo" :chartTitle="despesas.dados.datasets[0].label" />
                </div>
            </div>
            <div class="div3">
                <div class="desktop-chart" @click="goToChart('vendas')" style="cursor: pointer;">
                    <lottie-player background="transparent" speed="1" loop autoplay
                        v-show="loadingVendas"></lottie-player>
                    <chartComponent v-if="!loadingVendas" :chartData="vendas.dados" :chartType="vendas.tipo"
                        :chartReportType="vendas.codigo" :chartTitle="vendas.dados.datasets[0].label" />
                </div>
                <div class="desktop-chart">
                    <label>Produtos mais vendidos (Semanal)</label>
                    <dataTable :dataobj="produtos_vendidos" rowsperpage="7" :loaded="!loadingProdutosVendidos">
                        <grid-column prop="nome" label="Nome"></grid-column>
                        <grid-column prop="quantidade_vendida" label="Qtd. Vendida" />
                        <grid-column prop="total_faturado" label="Faturamento" v-slot="props">
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
import loadingJson from "@/assets/animations/loading-component.json";
import api from "@/configs/api";
import { globalMethods } from "@/js/globalMethods";
import dataTable from "./dataTable.vue";

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
        dataTable
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

        const players = document.querySelectorAll("lottie-player");

        players.forEach((item) => {
            item.addEventListener("rendered", () => {
                item.load(
                    loadingJson
                );
            });
        })

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
    height: 100%;
    display: flex;
    flex-direction: column;

    & :deep(canvas) {
        max-height: 367px !important;
        height: 100% !important;
        width: 100% !important;
    }
}

.parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: var(--space-5);
    flex: 1;
    margin-top: var(--space-6);
}

.div1,
.div2,
.div3 {
    display: grid;
    gap: var(--space-3);
}

.div1 {
    grid-area: 1 / 1 / 3 / 4;
}

.div2 {
    grid-area: 3 / 1 / 5 / 4;
}

.div3 {
    grid-area: 1 / 4 / 5 / 6;
}

.desktop-chart {
    width: 100%;
    height: fit-content;
}

@media (max-width: 768px) {
    .parent {
        grid-template-columns: 1fr;
        grid-template-rows: unset;
        padding: var(--space-6) 0;
    }

    .div1,
    .div2,
    .div3 {
        width: 100%;
        grid-area: unset;
        gap: var(--space-6);
    }
}
</style>