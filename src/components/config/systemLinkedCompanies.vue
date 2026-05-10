<template>
    <div class="system-child-companies config-page">
        <dataTable :dataobj="linked_companies" :loaded="loaded" rowsperpage="7" searchText="">
            <grid-column prop="id" label="ID" align="center"></grid-column>
            <grid-column prop="nome" label="Nome"></grid-column>
            <grid-column prop="endereco" label="Endereço"></grid-column>
            <grid-column prop="ações" label="Ações" v-slot="props" align="center">
                <button type="button" class="rounded-btn" title="Visualizar faturamento"
                    @click="goToReport(props.item.id)">
                    <span class="material-icons">insights</span>
                </button>
            </grid-column>
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
            linked_companies: [],
            loaded: false
        }
    },
    methods: {
        goToReport: function (company_id) {
            this.$router.push("/home/reports?type=linkedCompany&id=" + company_id);
        },
        returnLinkedCompanies: function () {
            let self = this;

            self.loaded = false;

            api.get("/companies/return_linked_companies").then((response) => {
                self.linked_companies = response.data.returnObj;
                self.loaded = true;
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
<style scoped></style>