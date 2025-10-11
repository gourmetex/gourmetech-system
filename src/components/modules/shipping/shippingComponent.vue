<template>
    <div class="shipping-component">
        <div class="page-title">
            <h1>Entregas</h1>
        </div>
        <actionButtons add_text="FINALIZAR ENTREGA" exclude_text="CANCELAR ENTREGA" :disabledbuttons="disabledButtons"
            @add="finishShipping()" @exclude="cancelShipping()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de entregas</h2>
            </div>
            <dataTable :dataobj="shippings" rowsperpage="7" searchText="entrega" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
                </grid-column>
                <grid-column prop="comanda" label="Nº Comanda"></grid-column>
                <grid-column prop="nome_cliente" label="Cliente"></grid-column>
                <grid-column prop="data_criacao" label="Data Criação" v-slot="props">
                    <p>{{ formatDateFromNow(props.item.data_criacao) }}</p>
                </grid-column>
                <grid-column prop="valor_total" label="Valor Total" v-slot="props">
                    <p>{{ formatCurrency(props.item.valor_total) }}</p>
                </grid-column>
                <grid-column prop="status" label="Status" align="center" v-slot="props">
                    <newBadge
                        :background="props.item.status == 'pendente' ? 'var(--yellow)' : props.item.status == 'cancelado' ? 'var(--red)' : 'var(--green)'"
                        :text="capitalize(props.item.status)" class="text-center" />
                </grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :confirm="true"
            @confirmCallback="confirmCallback(); returnShippings();" :confirmtext="confirmText" :modalbutton2="modalButton2"
            :modalButton3="modalButton3" @closeModal="closeModalFunction();"></modal>
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
            confirmCallback: () => { }
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
<style scoped></style>