<template>
    <div class="home">
        <h1>{{ today }}</h1>
        <div class="parent">
            <div class="div1">
                <div class="desktop-chart">
                    <lottie-player background="transparent" speed="1" loop autoplay v-show="loadingFaturamento"></lottie-player>
                    <chartComponent v-if="!loadingFaturamento" :chartData="faturamento.dados" :chartType="faturamento.tipo"
                        :chartReportType="faturamento.codigo" :chartTitle="faturamento.dados.datasets[0].label" />
                </div>
            </div>
            <div class="div2">
                <div class="desktop-chart">
                    <lottie-player background="transparent" speed="1" loop autoplay v-show="loadingDespesas"></lottie-player>
                    <chartComponent v-if="!loadingDespesas" :chartData="despesas.dados" :chartType="despesas.tipo"
                        :chartReportType="despesas.codigo" :chartTitle="despesas.dados.datasets[0].label" />
                </div>
            </div>
            <div class="div3">
                <div class="desktop-chart">
                    <lottie-player background="transparent" speed="1" loop autoplay v-show="loadingVendas"></lottie-player>
                    <chartComponent v-if="!loadingVendas" :chartData="vendas.dados" :chartType="vendas.tipo"
                        :chartReportType="vendas.codigo" :chartTitle="vendas.dados.datasets[0].label" />
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

export default {
    name: "homeComponent",
    mixins: [globalMethods],
    data() {
        return {
            today: null,
            faturamento: {
                title: "Faturamento",
                dados: null,
                tipo: "bar"
            },
            despesas: {
                title: "Despesas",
                dados: null,
                tipo: "bar"
            },
            vendas: {
                title: "Vendas",
                dados: null,
                tipo: "bar"
            },
            loadingFaturamento: true,
            loadingDespesas: true,
            loadingVendas: true
        }
    },
    components: {
        chartComponent
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
                codigo: self.reportType,
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

        this.faturamento = {...await this.retornaRelatorio("faturamento", "semanal", semanaAtual)};
        this.loadingFaturamento = false;

        this.despesas = {...await this.retornaRelatorio("despesas", "semanal", semanaAtual)};
        this.loadingDespesas = false;

        this.vendas = {...await this.retornaRelatorio("vendas", "semanal", semanaAtual)};
        this.loadingVendas = false;
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
    place-items: center;
    border: 1px solid red;
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

@media (max-width: 768px) {
    .parent {
        grid-template-columns: 1fr;
        grid-template-rows: unset;
    }

    .div1,
    .div2,
    .div3 {
        width: 100%;
        grid-area: unset;
    }
}
</style>