<template>
    <div class="shipping-component">
        <div class="page-title">
            <h1>Entregas</h1>
        </div>
        <actionButtons add_text="ENVIAR PARA ENTREGA" add_icon="delivery_dining" exclude_text="CANCELAR ENTREGA" :disabledbuttons="shippingDisabledButtons"
            @add="sendShipping()" @exclude="cancelShipping()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de entregas</h2>
            </div>
            <dataTable :dataobj="shippings" rowsperpage="7" searchText="entrega" :loaded="contentLoaded" :selectedrow="editId" :preserveview="true">
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
        <modal v-if="showModal && !showCancelShippingModalContent" :modaltitle="modalTitle" :modalbutton1="modalButton1" :confirm="true"
            @confirmCallback="handleConfirmCallback()" :confirmtext="confirmText" :modalbutton2="modalButton2"
            :modalButton3="modalButton3" @closeModal="closeModalFunction();"></modal>
        <modal v-if="showCancelShippingModalContent" :modaltitle="modalTitle" :modalbutton1="modalButton1" :modalbutton2="modalButton2"
            @closeModal="closeModalFunction(); returnShippings();">
            <cancelShippingModalContent
                :shippingid="editId"
                :comandaid="selectedComandaId"
                :valortotal="selectedValorTotal"
                @stepChange="modalButton1 = $event"
                @savedContent="closeModalFunction(); returnShippings();"
            ></cancelShippingModalContent>
        </modal>
    </div>
</template>
<script>
import api from "../../../configs/api";
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../../modal.vue";
import newBadge from "../../newBadge.vue";
import cancelShippingModalContent from "./cancelShippingModalContent.vue";

export default {
    name: "shippingComponent",
    mixins: [globalMethods],
    data() {
        return {
            shippings: [],
            gridOptions: [],
            confirmText: "",
            confirmCallback: () => { },
            showCancelShippingModalContent: false,
            selectedComandaId: null,
            selectedValorTotal: 0,
            refreshInterval: null,
            refreshRequestId: 0,
            refreshInFlight: false,
            pageDestroyed: false
        }
    },
    computed: {
        selectedShipping() {
            return this.shippings.find((shipping) => shipping.id == this.editId);
        },
        canSendShipping() {
            return this.selectedShipping?.status === 'aguardando_envio';
        },
        canCancelShipping() {
            return ['aguardando_envio', 'em_rota'].includes(this.selectedShipping?.status);
        },
        shippingDisabledButtons() {
            const disabled = [];
            if (!this.canSendShipping) disabled.push(1);
            if (!this.canCancelShipping) disabled.push(2);
            return disabled;
        }
    },
    methods: {
        // C.2/C.3: cancelar a entrega passou a cancelar a comanda inteira, com estorno
        // integral - o antigo confirm de uma linha so nao dava espaco pra motivo nem pra
        // escolher o que volta ao estoque (D8), entao abre o modal dedicado.
        cancelShipping: function () {
            if (!this.canCancelShipping) return;
            const selected = this.selectedShipping;

            this.selectedComandaId = selected.comanda;
            this.selectedValorTotal = selected.valor_total;
            this.showCancelShippingModalContent = true;
            // O titulo nao pode conter a substring exata "Cancelar" (nem "Excluir"): e o que
            // modal.vue usa pra decidir entre mostrar o slot (conteudo custom) ou o modal
            // generico de exclusao - "Cancelamento" passa o teste, "Cancelar" nao.
            this.showModalFunction("Cancelamento da entrega", "Continuar", "Fechar");
        },
        sendShipping: function () {
            if (!this.canSendShipping) return;
            this.showCancelShippingModalContent = false;
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
                const response = error.response?.data;
                const message = typeof response === "string" ? response : response?.message;
                this.$toast.error(message || "Não foi possível enviar a entrega. Tente novamente.");
            })
        },
        returnShippings: async function (silent = false) {
            if (silent && (this.showModal || this.refreshInFlight)) return;
            const requestId = ++this.refreshRequestId;
            this.refreshInFlight = true;
            try {
                const response = await api.get("/shipping?clearCache=true");
                if (this.pageDestroyed || requestId !== this.refreshRequestId || (silent && this.showModal)) return;
                this.shippings = response.data.returnObj || [];
                if (this.editId != null && !this.shippings.some((shipping) => shipping.id == this.editId) && !this.showModal) {
                    this.descelectRows();
                }
            } catch (error) {
                if (!silent && !this.pageDestroyed && requestId === this.refreshRequestId) {
                    this.$toast.error(error.response?.data || "Não foi possível atualizar as entregas.");
                }
            } finally {
                if (!this.pageDestroyed && requestId === this.refreshRequestId) {
                    this.contentLoaded = true;
                    this.refreshInFlight = false;
                }
            }
        }
    },
    mounted: function () {
        this.returnShippings();
        this.disableActionsButtons(true, true, true);
        this.refreshInterval = setInterval(() => this.returnShippings(true), 30 * 1000);
    },
    beforeDestroy() {
        this.pageDestroyed = true;
        clearInterval(this.refreshInterval);
    },
    components: {
        actionButtons,
        dataTable,
        modal,
        newBadge,
        cancelShippingModalContent
    }
}
</script>
<style scoped></style>
