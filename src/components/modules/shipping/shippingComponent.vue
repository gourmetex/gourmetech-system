<template>
    <div class="shipping-component">
        <div class="page-title">
            <h1>Entregas</h1>
        </div>
        <actionButtons add_text="ENVIAR PARA ENTREGA" exclude_text="CANCELAR ENTREGA" :disabledbuttons="disabledButtons"
            @add="sendShipping()" @exclude="cancelShipping()" />
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
                        :background="chooseStatusColor(props.item.status)"
                        :text="formatShippingStatus(props.item.status)" class="text-center" />
                </grid-column>
                <grid-column prop="entregador" label="Entregador" v-slot="props">
                    <p>{{ props.item.entregador || "-" }}</p>
                </grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :confirm="true"
            @confirmCallback="handleConfirmCallback()" :confirmtext="confirmText" :modalbutton2="modalButton2"
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
                return api.patch("/shipping/cancel/" + self.editId);
            }
        },
        sendShipping: function () {
            this.confirmText = "Tem certeza que deseja enviar esta entrega para os entregadores?";
            this.showModalFunction("Enviar para entrega", "Enviar", "Cancelar");

            let self = this;

            this.confirmCallback = () => {
                return api.patch("/shipping/send/" + self.editId);
            }
        },
        formatShippingStatus: function (status) {
            const statusMap = {
                aguardando_envio: "Aguardando envio",
                em_rota: "Em rota",
                concluido: "Concluida",
                cancelado: "Cancelada"
            };

            return statusMap[status] || this.capitalize(status);
        },
        chooseStatusColor: function (status) {
            const colorMap = {
                aguardando_envio: "var(--yellow)",
                em_rota: "var(--blue)",
                concluido: "var(--green)",
                cancelado: "var(--red)"
            };

            return colorMap[status] || "var(--gray)";
        },
        handleConfirmCallback: function () {
            Promise.resolve(this.confirmCallback()).then(() => {
                this.returnShippings();
            }).catch((error) => {
                console.log(error);
            })
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
