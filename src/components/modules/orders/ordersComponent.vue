<template>
    <div class="orders-component">
        <div class="page-title">
            <h1>Vendas</h1>
        </div>  
        <actionButtons add_text="ADICIONAR PEDIDO" exclude_text="CANCELAR PEDIDO" edit_text="EDITAR PEDIDO" :disabledbuttons="orderDisabledButtons" @add="addOrder()" @exclude="cancelOrder()" @edit="editOrder()">
            <button
                class="btn btn-secondary action-button"
                :disabled="!canSendToSeparation"
                v-on:click="sendToSeparation()"
            >
                <span class="material-icons">send</span> ENVIAR PARA SEPARAÇÃO
            </button>
        </actionButtons>
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de vendas</h2>
            </div>
            <dataTable :dataobj="orders" rowsperpage="7" searchText="item" :loaded="contentLoaded" rowkey="comanda" :selectedrow="editId" :preserveview="true">
                <grid-column prop="comanda" label="Nº Comanda" align="center" v-slot="props">
                    <p class="clicable" v-on:click="selectRow($event)">{{ props.item.comanda }}</p>
                </grid-column>
                <grid-column prop="cliente" label="Cliente"></grid-column>
                <grid-column prop="delivery" label="Delivery" v-slot="props" v-if="checkModulePermission('shipping')">
                    {{ props.item.delivery == 1 ? "Sim" : "Não" }}
                </grid-column>
                <grid-column prop="valor_parcial" label="Valor Parcial"></grid-column>
                <grid-column prop="valor_final" label="Valor Final"></grid-column>
                <grid-column prop="status" label="Status do pedido" align="center" v-slot="props">
                    <newBadge :background="chooseOrderStatusColor(props.item)" :text="props.item.status" />
                </grid-column>
                <grid-column prop="recibo" label="Recibo" align="left" v-slot="props">
                    <button v-if="props.item.raw_status === 'Finalizado'" class="btn btn-gray small"
                        title="Baixar recibo" v-on:click="downloadReceipt(props.item)">
                        <span class="material-icons">receipt_long</span>
                    </button>
                </grid-column>
            </dataTable>
        </div>
        <modal
            v-if="showModal"
            :class="{ 'cancel-order-dialog': showCancelOrderModalContent }"
            :modaltitle="modalTitle"
            :modalbutton1="modalButton1"
            :excludepath="confirmModal ? null : ('/orders/' + editId)"
            :modalbutton2="modalButton2"
            :modalButton3="modalButton3"
            :confirm="confirmModal"
            :confirmtext="confirmText"
            @confirmCallback="handleConfirmCallback()"
            @closeModal="closeModalFunction(); returnOrders();"
        >
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
import newBadge from "../../newBadge.vue";

export default {
    name: "ordersComponent",
    mixins: [globalMethods],
    data() {
        return {
            orders: [],
            showEditOrderModalContent: false,
            showCancelOrderModalContent: false,
            confirmModal: false,
            confirmText: "",
            confirmCallback: () => {},
            gridOptions: [],
            refreshInterval: null,
            refreshRequestId: 0,
            refreshInFlight: false,
            pageDestroyed: false
        }
    },
    computed: {
        selectedOrder() {
            return this.orders.find((order) => order.comanda == this.editId);
        },
        canCancelOrder() {
            if (!this.selectedOrder) return false;
            if (this.selectedOrder.can_cancel !== undefined && this.selectedOrder.can_cancel !== null) {
                return Number(this.selectedOrder.can_cancel) === 1;
            }
            return !['Finalizado', 'Cancelado'].includes(this.selectedOrder.status);
        },
        orderDisabledButtons() {
            return this.canCancelOrder ? this.disabledButtons : [...new Set([...this.disabledButtons, 2])];
        },
        // D.2: so faz sentido pra venda do app que o webhook ja colocou aguardando o envio
        // manual - venda local nunca passa por 'Aguardando separação' (D.1), entao nunca
        // habilita o botao.
        canSendToSeparation() {
            const selected = this.selectedOrder;
            return !!selected && Number(selected.from_app) === 1 && selected.raw_status === 'Aguardando separação';
        }
    },
    methods: {
        sendToSeparation: function () {
            if (!this.canSendToSeparation) return;

            this.resetModalContents();
            this.confirmModal = true;
            this.confirmText = `Deseja realmente enviar a comanda #${this.editId} para a separação?`;
            this.showModalFunction("Confirmar Envio", "Enviar para separação", "Cancelar");

            let self = this;
            this.confirmCallback = () => {
                return api.post("/orders/" + self.editId + "/separation").then(() => {
                    self.setResponse("Pedido enviado para separação com sucesso!", "success");
                    self.returnOrders();
                }).catch((error) => {
                    self.setResponse(error.response?.data || "Erro ao enviar para separação", "error");
                });
            };
        },
        handleConfirmCallback: function () {
            Promise.resolve(this.confirmCallback()).then(() => {
                this.returnOrders();
            }).catch((error) => {
                console.log(error);
            });
        },
        downloadReceipt: function (order) {
            let self = this;

            api.get(`/orders/${order.comanda}/receipt`, { responseType: "blob" }).then((response) => {
                const blob = new Blob([response.data], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `recibo-pedido-${order.comanda}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }).catch(() => {
                self.setResponse("Erro ao baixar recibo", "error");
            });
        },
        chooseOrderStatusColor: function (order) {
            const colorMap = {
                'Aguardando separação': 'var(--yellow)',
                'Em separação': 'var(--blue)',
                'Em andamento': 'var(--blue)',
                'Aguardando envio': 'var(--yellow)',
                'Em rota': 'var(--blue)',
                'Finalizado': 'var(--green)',
                'Cancelado': 'var(--red)',
                'Cancelamento Solicitado': 'var(--orange)'
            };

            return colorMap[order.status] || 'var(--gray)';
        },
        resetModalContents: function () {
            this.showEditOrderModalContent = false;
            this.showCancelOrderModalContent = false;
            this.confirmModal = false;
            this.confirmText = "";
            this.confirmCallback = () => {};
        }, 
        cancelOrder: function () {
            if (!this.canCancelOrder) return;
            this.resetModalContents();
            const selectedOrder = this.selectedOrder;
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
        returnOrders: async function (silent = false) {
            if (silent && (this.showModal || this.refreshInFlight)) return;
            const requestId = ++this.refreshRequestId;
            this.refreshInFlight = true;
            try {
                const response = await api.get("/orders");
                if (this.pageDestroyed || requestId !== this.refreshRequestId || (silent && this.showModal)) return;
                this.orders = response.data.returnObj || [];
                if (this.editId != null && !this.orders.some((order) => order.comanda == this.editId) && !this.showModal) {
                    this.descelectRows();
                }
            } catch (error) {
                if (!silent && !this.pageDestroyed && requestId === this.refreshRequestId) {
                    this.$toast.error(error.response?.data || "Não foi possível atualizar as vendas.");
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
        this.returnOrders();
        this.disableActionsButtons(false, true, true);
        this.refreshInterval = setInterval(() => this.returnOrders(true), 30 * 1000);
    },
    beforeDestroy() {
        this.pageDestroyed = true;
        clearInterval(this.refreshInterval);
    },
    components: {
        actionButtons,
        dataTable,
        modal,
        editOrderModalContent,
        cancelOrderModalContent,
        newBadge
    }
}
</script>
<style scoped>
.receipt-button { margin: 0; }
@media (max-width: 480px) {
    .cancel-order-dialog ::v-deep .modal-footer { flex-wrap: wrap; }
    .cancel-order-dialog ::v-deep .modal-footer .btn { flex: 1 1 auto; min-width: 0; margin: 0; }
}
</style>
