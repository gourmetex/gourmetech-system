<template>
    <div class="financial-component">
        <div class="page-title">
            <h1>Financeiro</h1>
        </div>  
        <actionButtons add_text="LANÇAR CONTA A RECEBER" exclude_text="EXCLUIR CONTA" edit_text="LANÇAR CONTA A PAGAR" :disabledbuttons="disabledButtons" add_icon="attach_money" edit_icon="money_off" @add="addAccountReceivable()" @exclude="deleteDebt()" @edit="addPayableAccount()" />
        <div class="financial-container">
            <div class="filter-container-header">
                <h2>Contas</h2>
                <div class="filters">
                    <form id="filter-form" @submit.prevent="search()">
                        <div class="filter-field">
                            <label for="categoria_conta">Categoria</label>
                            <select id="categoria_conta" name="categoria_conta">
                                <option value="">* Qualquer *</option>
                                <option v-for="(category, index) in debt_categories" :key="index" :value="category.id">{{ category.nome }}</option>
                            </select>
                        </div>
                        <div class="filter-field">
                            <label for="tipo_conta">Tipo</label>
                            <select id="tipo_conta" name="ccc.tipo_conta">
                                <option value="">* Qualquer *</option>
                                <option value="0">Conta a pagar</option>
                                <option value="1">Conta a receber</option>
                            </select>
                        </div>
                        <div class="filter-field">
                            <label for="data_inicio">Data início</label>
                            <input type="date" name="data_inicio" id="data_inicio">
                        </div>
                        <div class="filter-field">
                            <label for="data_fim">Data fim</label>
                            <input type="date" name="data_fim" id="data_fim">
                        </div>
                        <button type="submit" class="btn btn-primary">Buscar</button>
                    </form>
                </div>
            </div>
            <dataTable :dataTable="debts" :rowsPerPage="7" searchText="" :loaded="contentLoaded">
                <template slot="column-id" slot-scope="props">
                    <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.id }}</p>
                </template>
                <template slot="column-discriminacao" slot-scope="props">
                    <p>{{ props.item.discriminacao }}</p>
                </template>
                <template slot="column-valor" slot-scope="props">
                    <p>{{ props.item.valor }}</p>
                </template>
                <template slot="column-categoria" slot-scope="props">
                    <newBadge class="text-center" :background="props.item.cor" :text="props.item.nome" />
                </template>
                <template slot="column-tipo" slot-scope="props">
                    <p>{{ props.item.tipo }}</p>
                </template>
                <template slot="column-data" slot-scope="props">
                    <p class="text-center">{{ props.item.data_lancamento }}</p>
                </template>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :excludepath="'/financial/' + editId" :modalbutton1="modalButton1" :modalbutton2="modalButton2" :modalbutton3="modalButton3" @closeModal="closeModalFunction(); returnFinancial();">
            <postAccountReceivableModalContent v-if="showPostAccountReceivableModalContent" @savedContent="closeModalFunction(); returnFinancial();"></postAccountReceivableModalContent>
            <postPayableAccountModalContent v-if="showPostPayableAccountModalContent" @savedContent="closeModalFunction(); returnFinancial();"></postPayableAccountModalContent>
        </modal>
    </div>
</template>
<script>
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import newBadge from "../../newBadge.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../../modal.vue";
import postAccountReceivableModalContent from "./postAccountReceivableModalContent.vue";
import postPayableAccountModalContent from "./postPayableAccountModalContent.vue";
import api from "../../../configs/api";
import $ from 'jquery';

export default {
    name: "financialComponent",
    mixins: [globalMethods],
    data() {
        return {
            items: [],
            gridOptions: [],
            filters: [],
            showPostAccountReceivableModalContent: false,
            showPostPayableAccountModalContent: false,
            debts: [],
            debt_categories: []
        }
    },
    watch: {
        editId: function () {
            if (this.editId != null) {
                this.disableActionsButtons(false, false, false);
            } else {
                this.disableActionsButtons(false, true, false);
            }
        }
    },
    methods: {
        search: function () {
            let data = $("#filter-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                if (item.name.indexOf("data_") != -1 && item.value.trim() != "") {
                    obj[item.name] = "data_lancamento:" + item.value;
                } else {
                    obj[item.name] = parseInt(item.value);
                }
                
                return obj;
            }, {});
            this.filters = data;
            this.returnFinancial();
        },
        resetModalContents: function () {
            this.showPostAccountReceivableModalContent = false;
            this.showPostPayableAccountModalContent = false;
        },  
        addAccountReceivable: function () {
            this.resetModalContents();
            this.showModalFunction("Lançar conta a receber", "Lançar", "Cancelar");
            this.showPostAccountReceivableModalContent = true;
            this.descelectRows();
        },
        deleteDebt: function () {
            this.resetModalContents();
            this.showModalFunction("Excluir conta", "Excluir", "Cancelar");
        },
        addPayableAccount: function () {
            this.resetModalContents();
            this.showModalFunction("Lançar conta a pagar", "Lançar", "Cancelar");
            this.showPostPayableAccountModalContent = true;
            this.descelectRows();
        }, 
        returnFinancial: function () {
            let self = this;

            let data = {
                filters: self.filters
            }

            self.contentLoaded = false;

            api.post("/financial", data).then((response) => {
                self.debts = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnDebtCategories: function () {
            let self = this;

            api.get("/financial/debt_categories?all=true").then((response) => {
                self.debt_categories = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnFinancial();
        this.returnDebtCategories();
        this.disableActionsButtons(false, true, false);
    },
    components: {
        actionButtons,
        dataTable,
        newBadge,
        modal,
        postAccountReceivableModalContent,
        postPayableAccountModalContent
    }
}
</script>
<style scoped>
</style>