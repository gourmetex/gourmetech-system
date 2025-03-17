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
                        <button type="button" class="btn btn-gray" style="margin-left: var(--space-5);" v-on:click="exportToExcel">Exportar</button>
                    </form>
                </div>
            </div>
            <chartComponent v-if="!loading" :chartData="relatorio.dados" :chartType="relatorio.tipo" :chartReportType="relatorio.codigo" :chartTitle="relatorio.dados.datasets[0].label" />
        </div>
    </div>
</template>
<script>
import chartComponent from '@/components/chartComponent.vue';
import loadingJson from "@/assets/animations/loading-component.json";
import api from "@/configs/api";
import * as XLSX from "xlsx";

export default {
    name: "reportsComponent",
    data() {
        return {
            reportType: "",
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
                },
                {
                    codigo: "vendas",
                    title: "Relatório de vendas",
                    icon: "monetization_on"
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
        formatReportData: function (data) {
            let formattedData;

            if (this.relatorio.codigo == "faturamento" || this.relatorio.codigo == "despesas") {
                formattedData = `R$ ${data.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
            } else {
                formattedData = data;
            }

            return formattedData;
        },
        exportToExcel() {
            if (!this.relatorio.dados) {
                alert("Não há dados para exportar.");
                return;
            }

            // Obtém os datasets e labels do gráfico
            const labels = this.relatorio.dados.labels;
            const datasets = this.relatorio.dados.datasets;

            // Monta os dados para o Excel
            let excelData = [];
            const headerRow = ["          ", ...datasets.map(ds => ds.label)];
            excelData.push(headerRow); // Cabeçalhos

            labels.forEach((label, index) => {
                let row = [label]; // Primeira coluna: rótulo (categoria)
                datasets.forEach(dataset => {
                    row.push(this.formatReportData(dataset.data[index]) || 0);
                });
                excelData.push(row);
            });

            // Cria a planilha
            const ws = XLSX.utils.aoa_to_sheet(excelData);

            // Aplica estilos aos cabeçalhos (negrito e alinhamento)
            const range = XLSX.utils.decode_range(ws["!ref"]);
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: 0, c: col }); // Cabeçalhos na primeira linha
                if (!ws[cellRef]) continue;
                ws[cellRef].s = { 
                    font: { bold: true }, // Negrito
                    alignment: { horizontal: "center", vertical: "center" } // Alinhamento
                };
            }

            // Ajuste de largura das colunas com base no conteúdo
            ws["!cols"] = headerRow.map(header => ({ wch: header.length + 5 })); // Define largura baseada no tamanho do texto

            // Aplica autofiltro para ordenação dos cabeçalhos
            ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

            // Cria o workbook e adiciona a planilha
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Relatório");

            // Salva o arquivo
            XLSX.writeFile(wb, `${this.relatorio.title || "Relatorio"}.xlsx`);
        },
        selecionaRelatorio: function (tipo) {
            let self = this;
            let reportType;
            let reportTitle;

            self.loading = true;
            self.reportType = tipo;

            switch (tipo) {
                case "faturamento":
                    reportType = "bar";
                    reportTitle = "Faturamento";
                    break;
                case "despesas":
                    reportType = "bar";
                    reportTitle = "Despesas";
                    break;
                case "vendas":
                    reportType = "bar";
                    reportTitle = "Vendas";
                    break;
            }

            self.retornaRelatorio(tipo, this.dateRange, this.range).then((response) => {
                self.relatorio.dados = response;
                self.relatorio.tipo = reportType;
                self.relatorio.codigo = self.reportType;
                self.relatorio.title = reportTitle;

                self.loading = false;
            })
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