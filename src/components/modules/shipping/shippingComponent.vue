<template>
    <div class="shipping-component">
        <div class="page-title">
            <h1>Entregas</h1>
        </div> 
        <actionButtons add_text="FINALIZAR ENTREGA" exclude_text="CANCELAR ENTREGA" :disabledbuttons="disabledButtons" @add="finishShipping()" @exclude="cancelShipping()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de entregas</h2>
            </div>
            <dataTable :dataTable="shippings" :rowsPerPage="7" searchText="entrega" :loaded="contentLoaded">
                <template slot="column-id" slot-scope="props">
                    <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.id }}</p>
                </template>
                <template slot="column-nº-comanda" slot-scope="props">
                    <p>{{ props.item.comanda }}</p>
                </template>
                <template slot="column-cliente" slot-scope="props">
                    <p>{{ props.item.nome_cliente }}</p>
                </template>
                <template slot="column-data-criação" slot-scope="props">
                    <p>{{ formatDateFromNow(props.item.data_criacao) }}</p>
                </template>
                <template slot="column-valor-total" slot-scope="props">
                    <p>{{ formatCurrency(props.item.valor_total) }}</p>
                </template>
                <template slot="column-status" slot-scope="props">
                    <newBadge class="text-center" :background="props.item.status == 'pendente' ? 'var(--yellow)' : props.item.status == 'cancelado' ? 'var(--red)' : 'var(--green)'" :text="capitalize(props.item.status)" />
                </template>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :confirm="true" @confirmCallback="confirmCallback()" :confirmtext="confirmText" :modalbutton2="modalButton2" :modalButton3="modalButton3" @closeModal="closeModalFunction(); returnShippings();"></modal>
    </div>
</template>
<script>
import api from "../../../configs/api";
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../../modal.vue";
import newBadge from "../../newBadge.vue";

export default {
    name: "shippingComponent",
    mixins: [globalMethods],
    data() {
        return {
            shippings: [],
            gridOptions: [],
            confirmText: "",
            confirmCallback: () => {}
        }
    },
    methods: {
        cancelShipping: function () {
            this.confirmText = "Tem certeza que deseja cancelar a entrega?";
            this.showModalFunction("Cancelar entrega", "Cancelar", "Fechar");

            let self = this;

            this.confirmCallback = () => {
                api.patch("/shipping/cancel/" + self.editId);
            }
        },
        finishShipping: function () {
            this.confirmText = "Tem certeza que deseja finalizar a entrega?";
            this.showModalFunction("Finalizar entrega", "Finalizar", "Cancelar");

            let self = this;

            this.confirmCallback = () => {
                api.patch("/shipping/finish/" + self.editId);
            }
        },
        returnShippings: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/shipping").then((response) => {
                self.shippings = response.data.returnObj;
                self.contentLoaded = true;
                self.editId = null;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnShippings();
        this.disableActionsButtons(true, true, true);
    },
    components: {
        actionButtons,
        dataTable,
        modal,
        newBadge
    }
}
</script>
<style scoped>
</style>