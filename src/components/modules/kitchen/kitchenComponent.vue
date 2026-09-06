<template>
    <div class="kitchen-component">
        <div class="page-title">
            <h1>Fila da cozinha</h1>
        </div>

        <!-- NIVEL 1: grid de vendas (D.3/D14) -->
        <div v-if="view === 'grid'">
            <div class="grid-actions">
                <button class="btn btn-primary" :disabled="!selectedForPrint.length" @click="printBatch()">
                    <span class="material-icons">print</span>
                    IMPRIMIR ({{ selectedForPrint.length }})
                </button>
            </div>
            <div class="dishes-container">
                <dataTable :dataobj="orders" rowsperpage="10" searchText="" :loaded="contentLoaded" selectitems="true" @selected="selectedForPrint = $event">
                    <grid-column prop="id" label="Nº" align="center" v-slot="props">
                        <p class="clicable text-center" @click="openOrder(props.item)">{{ props.item.id }}</p>
                    </grid-column>
                    <grid-column prop="nome_cliente" label="Cliente" v-slot="props">
                        <p class="clicable" @click="openOrder(props.item)">{{ props.item.nome_cliente }}</p>
                    </grid-column>
                    <grid-column prop="from_app" label="Origem" align="center" v-slot="props">
                        <span class="origin-badge" :class="props.item.from_app == 1 ? 'origin-app' : 'origin-local'">
                            {{ props.item.from_app == 1 ? 'APP' : 'BALCÃO' }}
                        </span>
                    </grid-column>
                    <grid-column prop="mesa" label="Mesa/Entrega" align="center" v-slot="props">
                        {{ formatLocationLabel(props.item) }}
                    </grid-column>
                    <grid-column prop="itens_prontos" label="Itens" align="center" v-slot="props">
                        {{ props.item.itens_prontos }}/{{ props.item.total_itens }}
                    </grid-column>
                    <grid-column prop="segundos_na_fila" label="Tempo na fila" align="center" v-slot="props">
                        {{ formatElapsedTime(props.item.segundos_na_fila) }}
                    </grid-column>
                    <grid-column prop="acao" label="" align="center" v-slot="props">
                        <button class="btn btn-gray small" @click="printOne(props.item)">
                            <span class="material-icons">print</span>
                        </button>
                    </grid-column>
                </dataTable>
            </div>
        </div>

        <!-- NIVEL 2: sub-aba da venda, mesma tela -->
        <div v-if="view === 'detail' && selectedOrder">
            <div class="order-detail-header">
                <div>
                    <h2>Venda #{{ selectedOrder.id }} · {{ selectedOrder.nome_cliente }}</h2>
                    <p class="order-detail-subtitle">
                        <span class="origin-badge" :class="selectedOrder.from_app == 1 ? 'origin-app' : 'origin-local'">
                            {{ selectedOrder.from_app == 1 ? 'APP' : 'BALCÃO' }}
                        </span>
                        {{ formatLocationLabel(selectedOrder) }}
                    </p>
                </div>
                <div class="order-detail-actions">
                    <button class="btn btn-gray" @click="printOne(selectedOrder)">
                        <span class="material-icons">print</span>
                        IMPRIMIR
                    </button>
                    <button class="btn btn-gray" @click="backToGrid()">VOLTAR</button>
                </div>
            </div>

            <div class="item-cards" v-if="orderItems.length">
                <div class="item-card" v-for="item in orderItems" :key="item.id">
                    <img v-if="item.imagem" :src="item.imagem" class="item-card-photo" />
                    <div v-else class="item-card-photo item-card-photo-placeholder">{{ (item.nome || '?').charAt(0).toUpperCase() }}</div>

                    <div class="item-card-info">
                        <h3>{{ item.nome }}</h3>
                        <p class="item-card-quantity">Qtd: {{ item.quantidade_restante }}</p>
                        <p class="item-card-obs" v-if="item.observacoes">Obs: {{ item.observacoes }}</p>

                        <p class="item-card-cancelled" v-if="item.status === 'Cancelado'">
                            <span class="status-badge badge-cancelled">CANCELADO</span>
                            {{ item.motivo_cancelamento || 'Motivo não informado' }}
                        </p>
                        <p class="item-card-ready" v-else-if="item.status === 'Pronto'">
                            <span class="status-badge badge-ready">PRONTO</span>
                        </p>
                        <p class="item-card-timer" v-else-if="item.status_preparo === 'Em preparo'">
                            <span class="status-badge badge-in-progress">EM PREPARO</span>
                            ⏱️ {{ formatElapsedTime(item.segundos_decorridos) }}
                        </p>
                        <p v-else>
                            <span class="status-badge badge-waiting">AGUARDANDO</span>
                        </p>
                    </div>

                    <div class="item-card-buttons" v-if="item.status === 'Preparando'">
                        <button v-if="item.status_preparo !== 'Em preparo'" class="btn btn-yellow small" @click="startItem(item)">
                            INICIAR
                        </button>
                        <button v-else class="btn btn-primary small" @click="confirmItem(item)">
                            CONFIRMAR
                        </button>
                        <button class="btn btn-red small" @click="cancelItem(item)">
                            CANCELAR
                        </button>
                    </div>
                </div>
            </div>
            <div class="text-center" v-else>
                <h3>Todos os itens desta venda já foram resolvidos.</h3>
            </div>
        </div>

        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :modalbutton2="modalButton2" :modalButton3="modalButton3" @closeModal="closeModalFunction(); afterModalClose();">
            <cancelOrderModalContent v-if="showCancelOrderModalContent" :orderid="selectedComandaId" @savedContent="closeModalFunction(); afterModalClose();"></cancelOrderModalContent>
            <resolveKitchenItemModalContent
                v-if="showResolveItemModalContent"
                :orderid="selectedDishId"
                :item="selectedDish"
                :initialresolution="resolveInitialResolution"
                @stepChange="modalButton1 = $event"
                @savedContent="closeModalFunction(); afterModalClose();"
            ></resolveKitchenItemModalContent>
        </modal>
    </div>
</template>
<script>
import api from "../../../configs/api";
import dataTable from "../../dataTable.vue";
import modal from "../../modal.vue";
import cancelOrderModalContent from "../orders/cancelOrderModalContent.vue";
import resolveKitchenItemModalContent from "./resolveKitchenItemModalContent.vue";
import { globalMethods } from "@/js/globalMethods";
import { printService } from "@/js/printService";

export default {
    name: "kitchenComponent",
    mixins: [globalMethods],
    data() {
        return {
            view: "grid",
            orders: [],
            orderItems: [],
            selectedOrder: null,
            selectedForPrint: [],
            refreshTimeout: null,
            timerInterval: null,
            showCancelOrderModalContent: false,
            showResolveItemModalContent: false,
            resolveInitialResolution: null,
            selectedComandaId: null,
            selectedDishId: null,
            selectedDish: null
        }
    },
    methods: {
        formatLocationLabel(order) {
            if (order.tem_entrega) return "ENTREGA";
            if (order.mesa) return "Mesa " + order.mesa;
            return "Balcão";
        },
        formatElapsedTime(totalSecondsRaw) {
            if (totalSecondsRaw === null || totalSecondsRaw === undefined) return "-";
            const totalSecs = Math.max(0, Math.floor(totalSecondsRaw));
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
        },
        openOrder(order) {
            this.selectedOrder = order;
            this.view = "detail";
            this.loadOrderItems();
        },
        backToGrid() {
            this.view = "grid";
            this.selectedOrder = null;
            this.orderItems = [];
            this.returnOrders();
        },
        // Se o ultimo item desta venda acabou de ser resolvido, ela some do grid (D14) -
        // sem sentido continuar na sub-aba de uma venda que nao esta mais na fila.
        afterModalClose() {
            if (this.view === "detail" && this.selectedOrder) {
                this.loadOrderItems(true);
            } else {
                this.returnOrders();
            }
        },
        loadOrderItems(checkIfStillQueued = false) {
            let self = this;

            if (!self.selectedOrder) return;

            api.get("/kitchen/orders/" + self.selectedOrder.id + "/items").then((response) => {
                const items = (response.data.returnObj || []).map((item) => ({
                    ...item,
                    observacoes: self.groupObservations(item.observacoes)
                }));

                self.orderItems = items;

                const stillPending = items.some((item) => item.status === "Preparando");

                if (checkIfStillQueued && !stillPending) {
                    self.backToGrid();
                } else {
                    self.returnOrders(true);
                }
            }).catch((error) => {
                console.log(error);
            });
        },
        startItem(item) {
            let self = this;

            api.post("/kitchen/orders/" + item.id + "/start").then(() => {
                self.loadOrderItems();
            }).catch((error) => {
                console.log(error);
            });
        },
        // E (D12): CONFIRMAR abre o modal de resolucao - a cozinha declara o que separou
        // (principal / substituto / nenhum dos dois) em vez de finalizar direto.
        confirmItem(item) {
            this.showCancelOrderModalContent = false;
            this.showResolveItemModalContent = false;
            this.resolveInitialResolution = null;
            this.selectedDishId = item.id;
            this.selectedDish = item;
            this.showResolveItemModalContent = true;
            this.showModalFunction("Resolução do item", "Continuar", "Fechar");
        },
        cancelItem(item) {
            this.showCancelOrderModalContent = false;
            this.showResolveItemModalContent = false;

            if (Number(item.total_active_dishes) <= 1) {
                this.selectedComandaId = this.selectedOrder.id;
                this.showCancelOrderModalContent = true;
                this.showModalFunction("Processar Cancelamento", "Confirmar Cancelamento", "Fechar");
            } else {
                // E: atalho pro passo 2a do modal de resolucao, pulando a etapa de escolha.
                this.selectedDishId = item.id;
                this.selectedDish = item;
                this.resolveInitialResolution = "cancelar";
                this.showResolveItemModalContent = true;
                this.showModalFunction("Cancelamento do item", "Continuar", "Fechar");
            }
        },
        // D.5: monta o bloco de aviso de substituicao - hoje sempre null, ja que
        // preferencia_indisponivel/substituto so existem a partir da Fase 7 (B).
        buildSubstitutionBadge(item) {
            if (!item.preferencia_indisponivel || item.preferencia_indisponivel === 'cancelar') {
                if (item.preferencia_indisponivel === 'cancelar') {
                    return { type: 'danger', icon: '✕', text: 'SE NÃO TIVER → NÃO LEVAR NADA (cliente pediu)' };
                }
                return null;
            }

            if (item.substituto) {
                return { type: 'warning', icon: '⚠', text: `SE NÃO TIVER → LEVAR: ${item.substituto.nome}` };
            }

            return null;
        },
        buildChecklistItems(itens) {
            return itens.map((item) => ({
                image: item.imagem,
                title: item.nome,
                quantity: item.quantidade,
                unit: item.unidade,
                note: item.observacoes,
                badge: this.buildSubstitutionBadge(item)
            }));
        },
        printOne(order) {
            let self = this;

            api.get("/kitchen/orders/" + order.id + "/separation-sheet").then((response) => {
                const sheet = response.data.returnObj;

                const doc = {
                    title: "Lista de separação",
                    subtitle: `Venda #${sheet.comanda.id}`,
                    meta: [
                        { label: "Cliente", value: sheet.comanda.nome_cliente },
                        { label: "Origem", value: (sheet.comanda.from_app == 1 ? "APP" : "BALCÃO") + (sheet.comanda.tem_entrega ? " · ENTREGA" : (sheet.comanda.mesa ? " · MESA " + sheet.comanda.mesa : "")) }
                    ],
                    paper: "80mm",
                    blocks: [
                        { type: "checklist", items: self.buildChecklistItems(sheet.itens) },
                        { type: "signature", label: "Separado por" }
                    ],
                    footer: { text: "Confira antes de fechar a sacola" }
                };

                printService.print(self.$router, doc);
            }).catch((error) => {
                console.log(error);
            });
        },
        printBatch() {
            let self = this;

            if (!self.selectedForPrint.length) return;

            const ids = self.selectedForPrint.map((order) => order.id).join(",");

            api.get("/kitchen/separation-sheet?ids=" + ids).then((response) => {
                const sheets = response.data.returnObj || [];
                const blocks = [];

                sheets.forEach((sheet, index) => {
                    blocks.push({
                        type: "keyValue",
                        items: [
                            { label: "Venda", value: "#" + sheet.comanda.id },
                            { label: "Cliente", value: sheet.comanda.nome_cliente },
                            { label: "Origem", value: (sheet.comanda.from_app == 1 ? "APP" : "BALCÃO") + (sheet.comanda.tem_entrega ? " · ENTREGA" : (sheet.comanda.mesa ? " · MESA " + sheet.comanda.mesa : "")) }
                        ]
                    });
                    blocks.push({ type: "checklist", items: self.buildChecklistItems(sheet.itens) });
                    blocks.push({ type: "signature", label: "Separado por" });

                    if (index < sheets.length - 1) {
                        blocks.push({ type: "pageBreak" });
                    }
                });

                printService.print(self.$router, {
                    title: "Lista de separação (lote)",
                    paper: "80mm",
                    blocks
                });
            }).catch((error) => {
                console.log(error);
            });
        },
        returnOrders(cleanCache = false) {
            let self = this;

            self.contentLoaded = false;

            api.get("/kitchen/orders" + (cleanCache ? "?clearCache=true" : "")).then((response) => {
                self.orders = response.data.returnObj || [];
                self.contentLoaded = true;

                // A venda aberta pode ter saido do grid (ultimo item resolvido em outra
                // aba/usuario) - volta pro nivel 1 sozinho em vez de mostrar uma sub-aba
                // orfa.
                if (self.view === "detail" && self.selectedOrder && !self.orders.some((o) => o.id === self.selectedOrder.id)) {
                    self.backToGrid();
                }
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                clearTimeout(self.refreshTimeout);
                self.refreshTimeout = setTimeout(() => {
                    self.returnOrders();
                }, 60 * 1000);
            });
        },
        startTimer() {
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                for (let i = 0; i < this.orders.length; i++) {
                    if (typeof this.orders[i].segundos_na_fila === 'number') {
                        this.orders[i].segundos_na_fila++;
                    }
                }
                for (let i = 0; i < this.orderItems.length; i++) {
                    if (this.orderItems[i].status_preparo === 'Em preparo' && typeof this.orderItems[i].segundos_decorridos === 'number') {
                        this.orderItems[i].segundos_decorridos++;
                    }
                }
            }, 1000);
        }
    },
    mounted: function () {
        this.returnOrders();
        this.startTimer();
    },
    unmounted: function () {
        clearTimeout(this.refreshTimeout);
        clearInterval(this.timerInterval);
    },
    components: {
        dataTable,
        modal,
        cancelOrderModalContent,
        resolveKitchenItemModalContent
    }
}
</script>
<style scoped>
.grid-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--space-4);
}

.grid-actions button, .order-detail-actions button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
}

.origin-badge {
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
}

.origin-app {
    background: #d1ecf1;
    color: #0c5460;
}

.origin-local {
    background: #e2e3e5;
    color: #383d41;
}

.order-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
    gap: var(--space-4);
}

.order-detail-subtitle {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-2);
}

.order-detail-actions {
    display: flex;
    gap: var(--space-3);
}

.item-cards {
    display: grid;
    gap: var(--space-4);
}

.item-card {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-md);
    flex-wrap: wrap;
}

.item-card-photo {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    flex-shrink: 0;
}

.item-card-photo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gray-3);
    font-size: 1.5rem;
    font-weight: 700;
}

.item-card-info {
    flex: 1;
    min-width: 200px;
}

.item-card-info h3 {
    margin: 0 0 4px;
}

.item-card-quantity, .item-card-obs {
    margin: 2px 0;
    font-size: 0.9rem;
}

.item-card-buttons {
    display: flex;
    gap: var(--space-2);
}

.item-card-buttons button {
    white-space: nowrap;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-block;
}

.badge-waiting {
    background-color: #fff3cd;
    color: #856404;
}

.badge-in-progress {
    background-color: #d1ecf1;
    color: #0c5460;
}

.badge-ready {
    background-color: #d4edda;
    color: #155724;
}

.badge-cancelled {
    background-color: #f8d7da;
    color: #721c24;
}

.small {
    padding: 6px 10px;
    font-size: 0.85rem;
}

.text-center {
    text-align: center;
}
</style>
