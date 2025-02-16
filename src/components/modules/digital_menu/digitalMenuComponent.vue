<template>
    <div class="digital-menu">
        <div class="page-title">
            <h1>Menu digital</h1>
        </div>  
        <actionButtons add_text="ABRIR MESA" exclude_text="FECHAR MESA" edit_text="EDITAR MESA" :disabledbuttons="disabledButtons" @add="openTable()" @exclude="closeTable()" @edit="editTable()" />
        <div class="digital-menu-container">
            <dataTable :dataTable="digitalMenu" :rowsPerPage="7" searchText="item" :loaded="contentLoaded">
                <template slot="column-comanda" slot-scope="props">
                    <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.comanda }}</p>
                </template>
                <template slot="column-mesa" slot-scope="props">
                    <p class="text-center">{{ props.item.mesa }}</p>
                </template>
                <template slot="column-cliente" slot-scope="props">
                    <p>{{ props.item.cliente }}</p>
                </template>
                <template slot="column-status-pedido" slot-scope="props">
                    <p>{{ props.item.status_pedido }}</p>
                </template>
                <template slot="column-valor-parcial" slot-scope="props">
                    <p class="text-center">{{ props.item.valor_parcial }}</p>
                </template>
                <template slot="column-tempo-permanência" slot-scope="props">
                    <p class="text-center update-time">{{ props.item.tempo_permanencia }}</p>
                </template>
                <template slot="column-status-mesa" slot-scope="props">
                    <newBadge class="text-center" :background="props.item.status_mesa == 1 ? 'var(--green-2)' : 'var(--red)'" :text="props.item.status_mesa == 1 ? 'Disponível' : 'Ocupada'" />
                </template>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/orders/' + editId" :modalbutton2="modalButton2" :modalButton3="modalButton3" @closeModal="closeModalFunction(); returnMenuDigital();">
            <editOrderModalContent v-if="showEditOrderModalContent" :payment="payment" :orderid="editId" @savedContent="closeModalFunction(); returnMenuDigital();"></editOrderModalContent>
        </modal>
    </div>
</template>
<script>
import actionButtons from "../../actionButtons.vue";
import { globalMethods } from "@/js/globalMethods";
import api from "../../../configs/api";
import editOrderModalContent from "../orders/editOrderModalContent.vue";
import modal from "../../modal.vue";
import dataTable from "../../dataTable.vue";
import newBadge from "../../newBadge.vue";

export default {
    name: "digitalMenuComponent",
    mixins: [globalMethods],
    data() {
        return {
            digitalMenu: [],
            showEditOrderModalContent: false,
            payment: false
        }
    },
    methods: {
        resetModalContents: function () {
            this.showEditOrderModalContent = false;
        }, 
        openTable: function () {
            this.resetModalContents();
            this.showModalFunction("Abrir mesa", "Abrir", "Cancelar");
            this.showEditOrderModalContent = true;
            this.editId = null;
        },
        closeTable: function () {
            this.payment = true;
            this.resetModalContents();
            this.showModalFunction("Fechar mesa", "Salvar", "Cancelar", "Finalizar");
            this.showEditOrderModalContent = true;
        },
        editTable: function () {
            this.resetModalContents();
            this.showModalFunction("Editar mesa", "Salvar", "Cancelar");
            this.showEditOrderModalContent = true;
        },
        returnMenuDigital: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/digital_menu").then((response) => {
                self.digitalMenu = response.data.returnObj;
                self.contentLoaded = true;
            })
        }
    },
    mounted: function () {
        this.disableActionsButtons(false, true, true);
        this.returnMenuDigital();
    },
    components: {
        actionButtons,
        editOrderModalContent,
        modal,
        dataTable,
        newBadge
    }
}
</script>
<style scoped>
</style>