<template>
    <div class="system-child-companies config-page">
        <dataTable :dataTable="linked_companies" :rowsPerPage="7" searchText="" :loaded="contentLoaded">
            <template slot="column-id" slot-scope="props">
                <p class="text-center">{{ props.item.id }}</p>
            </template>
            <template slot="column-nome" slot-scope="props">
                <p>{{ props.item.nome }}</p>
            </template>
            <template slot="column-endereço" slot-scope="props">
                <p>{{ props.item.endereco }}</p>
            </template>
            <template slot="column-ações" slot-scope="props">
                <button type="button" class="rounded-btn" title="Visualizar faturamento" v-on:click="goToReport(props.item.id)">
                    <span class="material-icons">insights</span>
                </button>
            </template>
        </dataTable>
    </div>
</template>
<script>
import { globalMethods } from '@/js/globalMethods';
import api from "../../configs/api.js";
import dataTable from "../dataTable.vue";

export default {
    name: "systemLinkedCompanies",
    mixins: [globalMethods],
    data() {
        return {
            linked_companies: []
        }
    },
    methods: {
        goToReport: function (company_id) {
            this.$router.push("/home/reports?type=linkedCompany&id=" + company_id);
        },
        returnLinkedCompanies: function () {
            let self = this;

            api.get("/companies/return_linked_companies").then((response) => {
                self.linked_companies = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        },
    },
    mounted: function () {
        this.returnLinkedCompanies();
    },
    components: {
        dataTable
    }
}
</script>
<style scoped>
</style>