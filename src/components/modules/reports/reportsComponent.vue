<template>
    <div class="reports-component">
        <div class="page-title">
            <h1>Relatórios</h1>
        </div> 
        <div class="relatorios-tipos">
            <div class="relatorio-tipo" v-for="(relatorio, index) in relatoriosTipos" :key="index" v-on:click="selecionaRelatorio(relatorio.codigo)">
                <i class="material-icons">{{relatorio.icon}}</i>
                <h3>{{relatorio.title}}</h3>
            </div>
        </div>
        <h2 v-if="!loading && relatorio.dados == null" class="text-center">Selecione um relatório</h2>

        <lottie-player id="loading" background="transparent" speed="1" loop autoplay v-show="loading"></lottie-player>

        <div class="relatorio-container" v-if="relatorio.dados != null">
            <div class="filter-container-header">
                <h2>{{ relatorio.title }}</h2>
                <div class="filters">
                    <form id="filter-form" @submit.prevent="search()">
                        <div class="filter-field">
                            <label for="tipo_range">Tipo</label>
                            <select v-model="dateRange" id="tipo_range">
                                <option value="anual">Anual</option>
                                <option value="semanal">Semanal</option>
                            </select>
                        </div>
                        <div class="filter-field">
                            <label>Competência</label>
                            <input v-if="dateRange === 'anual'" type="number" v-model="year" placeholder="Ano" required />
                            <input v-if="dateRange === 'semanal'" type="week" v-model="week" placeholder="Semana" required />
                        </div>
                        <button type="submit" class="btn btn-primary">Buscar</button>
                    </form>
                </div>
            </div>
            <chartComponent v-if="!loading" :chartData="relatorio.dados" :chartType="relatorio.tipo" :chartTitle="relatorio.dados.datasets[0].label" />
        </div>
    </div>
</template>
<script>
import chartComponent from '@/components/chartComponent.vue';
import loadingJson from "@/assets/animations/loading-component.json";
import api from "@/configs/api";

export default {
    name: "reportsComponent",
    data() {
        return {
            relatoriosTipos: [
                {
                    codigo: "faturamento",
                    title: "Relatório de faturamento",
                    icon: "bar_chart"
                },
                {
                    codigo: "despesas",
                    title: "Relatório de despesas",
                    icon: "request_quote"
                }
            ],
            relatorio: {
                title: "",
                dados: null,
                tipo: null
            },
            loading: false,
            dateRange: "anual",
            year: new Date().getFullYear(), 
            week: null,
            range: null
        }
    },
    methods: {
        search() {
            if (this.dateRange === 'anual') {
                this.range = this.year;
            } else if (this.dateRange === 'semanal') {
                this.range = this.week;
            }

            this.selecionaRelatorio(this.reportType);
        },
        selecionaRelatorio: function (tipo) {
            let self = this;

            self.loading = true;
            self.reportType = tipo;

            switch (tipo) {
                case "faturamento":
                self.retornaRelatorio(tipo, this.dateRange, this.range).then((response) => {
                    self.relatorio.dados = response;
                    self.relatorio.tipo = "bar";
                    self.relatorio.title = "Faturamento";

                    self.loading = false;
                })
                    
                    break;
            }
        },
        retornaRelatorio: function (type, competence, range) {
            let data = {
                type: type,
                competence: competence,
                range: range
            }

            return new Promise((resolve) => {
                api.post("/reports", data).then((response) => {
                    resolve(response.data.returnObj);
                })
            })
        }
    },
    mounted: function () {
        const player = document.querySelector("lottie-player");
        player.addEventListener("rendered", () => {
            player.load(
                loadingJson
            );
        });

        this.range = this.year;
    },
    components: {
        chartComponent
    }
}
</script>
<style scoped>
#loading {
    width: 200;
    margin: auto;
}

.relatorios-tipos, .relatorio-tipo {
    display: flex;
    gap: var(--space-3);
}

.relatorios-tipos {
    border-bottom: 1px solid var(--gray-3);
    padding-bottom: var(--space-3);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
}

.filter-container-header {
    margin-bottom: var(--space-8);
}

.relatorio-tipo {
    align-items: center;
    gap: var(--space-5);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;

    &:hover {
        background: var(--gray-3);
    }

    & i {
        width: 50px;
        height: 50px;
        min-width: 50px;
        min-height: 50px;
        max-width: 50px;
        max-height: 50px;
        background: var(--blue-high-2);
        border-radius: 50%;
        color: var(--blue);
        display: grid;
        place-items: center;
    }
}
</style>