<template>
    <div class="orders-component">
        <div class="page-title">
            <h1>Vendas</h1>
        </div>  
        <actionButtons add_text="ADICIONAR PEDIDO" exclude_text="CANCELAR PEDIDO" edit_text="EDITAR PEDIDO" :disabledbuttons="disabledButtons" @add="addOrder()" @exclude="cancelOrder()" @edit="editOrder()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de vendas</h2>
            </div>
            <dataTable :dataobj="orders" rowsperpage="7" searchText="item" :loaded="contentLoaded">
                <grid-column prop="comanda" label="Nº Comanda" align="center" v-slot="props"> 
                    <p class="clicable" v-on:click="selectRow($event)">{{ props.item.comanda }}</p>
                </grid-column>
                <grid-column prop="cliente" label="Cliente"></grid-column>
                <grid-column prop="delivery" label="Delivery" v-slot="props" v-if="checkModulePermission('shipping')"> 
                    {{ props.item.delivery == 1 ? "Sim" : "Não" }}
                </grid-column>
                <grid-column prop="valor_parcial" label="Valor Parcial"></grid-column>
                <grid-column prop="valor_final" label="Valor Final"></grid-column>
                <grid-column prop="status" label="Status do pedido"></grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/orders/' + editId" :modalbutton2="modalButton2" :modalButton3="modalButton3" @closeModal="closeModalFunction(); returnOrders();">
            <editOrderModalContent v-if="showEditOrderModalContent" :orderid="editId" @savedContent="closeModalFunction(); returnOrders();"></editOrderModalContent>
            <cancelOrderModalContent v-if="showCancelOrderModalContent" :orderid="editId" @savedContent="closeModalFunction(); returnOrders();"></cancelOrderModalContent>
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
import cancelOrderModalContent from "./cancelOrderModalContent.vue";

export default {
    name: "ordersComponent",
    mixins: [globalMethods],
    data() {
        return {
            orders: [],
            showEditOrderModalContent: false,
            showCancelOrderModalContent: false,
            gridOptions: []
        }
    },
    methods: {
        resetModalContents: function () {
            this.showEditOrderModalContent = false;
            this.showCancelOrderModalContent = false;
        }, 
        cancelOrder: function () {
            this.resetModalContents();
            let selectedOrder = this.orders.find(o => o.id == this.editId);
            if (selectedOrder && selectedOrder.cancel_status === 'requested') {
                this.showModalFunction("Processar Cancelamento", "Aprovar", "Fechar", "Recusar");
            } else {
                this.showModalFunction("Processar Cancelamento", "Confirmar Cancelamento", "Fechar");
            }
            this.showCancelOrderModalContent = true;
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

                setTimeout(() => {
                    this.returnOrders();
                }, 60 * 1000)
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
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
        editOrderModalContent,
        cancelOrderModalContent
    }
}
</script>
<style scoped>
</style>