<template>
    <div class="orders-component">
        <div class="page-title">
            <h1>Pedidos</h1>
        </div>  
        <actionButtons add_text="ADICIONAR PEDIDO" exclude_text="CANCELAR PEDIDO" edit_text="EDITAR PEDIDO" :disabledbuttons="disabledButtons" @add="addOrder()" @exclude="cancelOrder()" @edit="editOrder()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de pedidos</h2>
            </div>
            <dataTable :dataTable="orders" :rowsPerPage="7" searchText="pedido" :loaded="contentLoaded">
                <template slot="column-nº-comanda" slot-scope="props">
                    <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.comanda }}</p>
                </template>
                <template slot="column-cliente" slot-scope="props">
                    <p>{{ props.item.cliente }}</p>
                </template>
                <template slot="column-delivery" slot-scope="props" v-if="checkModulePermission('shipping')">
                    <p>{{ props.item.delivery == 1 ? "Sim" : "Não" }}</p>
                </template>
                <template slot="column-valor-parcial" slot-scope="props">
                    <p>{{ props.item.valor_parcial }}</p>
                </template>
                <template slot="column-valor-final" slot-scope="props">
                    <p>{{ props.item.valor_final }}</p>
                </template>
                <template slot="column-status-do-pedido" slot-scope="props">
                    <p>{{ props.item.status }}</p>
                </template>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/orders/' + editId" :modalbutton2="modalButton2" :modalButton3="modalButton3" @closeModal="closeModalFunction(); returnOrders();">
            <editOrderModalContent v-if="showEditOrderModalContent" :orderid="editId" @savedContent="closeModalFunction(); returnOrders();"></editOrderModalContent>
        </modal>
    </div>
</template>
<script>
import api from "../../../configs/api";
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../../modal.vue";
import editOrderModalContent from "./editOrderModalContent.vue";

export default {
    name: "ordersComponent",
    mixins: [globalMethods],
    data() {
        return {
            orders: [],
            showEditOrderModalContent: false,
            gridOptions: []
        }
    },
    methods: {
        resetModalContents: function () {
            this.showEditOrderModalContent = false;
        }, 
        cancelOrder: function () {
            this.resetModalContents();
            this.showModalFunction("Cancelar pedido", "Cancelar", "Fechar");
        },
        addOrder: function () {
            this.resetModalContents();
            this.showModalFunction("Adicionar pedido", "Adicionar", "Cancelar");
            this.showEditOrderModalContent = true;
            this.editId = null;
        },
        editOrder: function () {
            this.resetModalContents();
            this.showModalFunction("Editar pedido", "Salvar", "Cancelar", "Finalizar");
            this.showEditOrderModalContent = true;
        },
        returnOrders: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/orders").then((response) => {
                self.orders = response.data.returnObj;
                self.contentLoaded = true;
                self.editId = null;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnOrders();
        this.disableActionsButtons(false, true, true);
    },
    components: {
        actionButtons,
        dataTable,
        modal,
        editOrderModalContent
    }
}
</script>
<style scoped>
</style>