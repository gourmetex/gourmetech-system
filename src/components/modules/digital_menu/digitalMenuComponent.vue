<template>
    <div class="digital-menu">
        <div class="page-title">
            <h1>Menu digital</h1>
        </div>
        <actionButtons add_text="ABRIR MESA" exclude_text="FECHAR MESA" edit_text="EDITAR MESA"
            :disabledbuttons="disabledButtons" @add="openTable()" @exclude="closeTable()" @edit="editTable()" />
        <div class="digital-menu-container">
            <dataTable :dataobj="digitalMenu" rowsperpage="7" searchText="item" :loaded="contentLoaded">
                <grid-column prop="comanda" label="Comanda" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.comanda }}</p>
                </grid-column>
                <grid-column prop="mesa" label="Mesa" align="center"></grid-column>
                <grid-column prop="cliente" label="Cliente"></grid-column>
                <grid-column prop="status_pedido" label="Status Pedido"></grid-column>
                <grid-column prop="valor_parcial" label="Valor Parcial" align="center"></grid-column>
                <grid-column prop="tempo_permanencia" label="Tempo Permanência" align="center"></grid-column>
                <grid-column prop="status_mesa" label="Status Mesa" align="center" v-slot="props">
                    <newBadge :background="props.item.status_mesa == 1 ? 'var(--green-2)' : 'var(--red)'"
                        :text="props.item.status_mesa == 1 ? 'Disponível' : 'Ocupada'" class="text-center" />
                </grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/orders/' + editId"
            :modalbutton2="modalButton2" :modalButton3="modalButton3"
            @closeModal="closeModalFunction(); returnMenuDigital();">
            <editOrderModalContent v-if="showEditOrderModalContent" :payment="payment" :orderid="editId"
                @savedContent="closeModalFunction(); returnMenuDigital();"></editOrderModalContent>
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
<style scoped></style>