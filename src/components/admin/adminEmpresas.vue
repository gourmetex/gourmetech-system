<template>
    <div class="admin-empresas">
        <div class="companies-header">
            <h2>Empresas</h2>
            <button type="button" class="btn btn-primary" v-on:click="editCompany()">Cadastrar empresa</button>
        </div>
        <div class="empresas-list">
            <dataTable :dataobj="companies" rowsperpage="7" searchText="item">
                <grid-column prop="id" label="ID" align="center">
                    <template v-slot="props">
                        <p class="clicable text-center" @click="editCompany(props.item.id)">{{ props.item.id }}</p>
                    </template>
                </grid-column>
                <grid-column prop="nome" label="Nome"></grid-column>
                <grid-column prop="ativa" label="Status" align="center">
                    <template v-slot="props">
                        <newBadge class="text-center"
                            :background="props.item.ativa == 1 ? 'var(--green-2)' : 'var(--red)'"
                            :text="props.item.ativa == 1 ? 'Ativa' : 'Inativa'" />
                    </template>
                </grid-column>
                <grid-column prop="membros" label="Membros" align="center"></grid-column>
                <grid-column prop="asaas_wallet_id" label="Asaas Wallet Id" width="1/5"></grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :modalbutton2="modalButton2"
            :modalbutton3="modalButton3" @closeModal="closeModalFunction()">
            <editCompanyModalContent v-if="showEditCompanieModalContent" :companies="companies" :companyid="companyId"
                @savedContent="closeModalFunction()"></editCompanyModalContent>
        </modal>
    </div>
</template>
<script>
import api from "../../configs/api";
import { globalMethods } from "@/js/globalMethods";
import dataTable from "../dataTable.vue";
import newBadge from "../newBadge.vue";
import modal from "../modal.vue";
import editCompanyModalContent from "./editCompanyModalContent.vue";

export default {
    name: "adminEmpresas",
    mixins: [globalMethods],
    data() {
        return {
            companies: [],
            showEditCompanieModalContent: false,
            companyId: null
        }
    },
    watch: {
        reloadGrid: function () {
            if (this.reloadGrid) {
                this.returnAllCompanies();
            }
        }
    },
    methods: {
        selectModal: function (event) {
            switch (event[2]) {
                case "company_edit":
                    this.editCompany(event);
                    break;
            }
        },
        editCompany: function (event) {
            this.showModalFunction("Editar empresa", "Salvar", "Cancelar");
            this.showEditCompanieModalContent = true;
            this.companyId = event;
        },
        returnAllCompanies: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/companies/return_all_companies").then((response) => {
                self.companies = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnAllCompanies();
    },
    components: {
        dataTable,
        newBadge,
        modal,
        editCompanyModalContent
    }
}
</script>
<style scoped>
.companies-header {
    display: flex;
    align-items: center;
}

.companies-header button {
    margin-left: var(--space-6);
}
</style>