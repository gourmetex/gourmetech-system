<template>
    <div class="kitchen-component">
        <div class="page-title kitchen-title">
            <div>
                <p class="eyebrow">OPERAÇÃO · COZINHA</p>
                <h1>Fila da cozinha</h1>
                <p class="page-description">Acompanhe os pedidos e organize a separação dos itens.</p>
            </div>
        </div>

        <!-- NIVEL 1: grid de vendas (D.3/D14) -->
        <div v-if="view === 'grid'">
            <div class="queue-overview" v-if="contentLoaded || orders.length">
                <div class="overview-item"><span class="overview-icon overview-icon-total material-icons">receipt_long</span><div><strong>{{ orders.length }}</strong><span>pedidos na fila</span></div></div>
                <div class="overview-item"><span class="overview-icon overview-icon-warning material-icons">schedule</span><div><strong>{{ countSla('warning') }}</strong><span>em atenção</span></div></div>
                <div class="overview-item"><span class="overview-icon overview-icon-danger material-icons">priority_high</span><div><strong>{{ countSla('danger') }}</strong><span>atrasados</span></div></div>
            </div>
            <div class="queue-toolbar">
                <div>
                    <h2>Pedidos em separação</h2>
                    <p>Selecione pedidos para imprimir as listas em lote.</p>
                </div>
                <button class="btn btn-secondary batch-print" type="button" :disabled="!selectedForPrint.length" @click="printBatch()">
                    <span class="material-icons">print</span>
                    IMPRIMIR ({{ selectedForPrint.length }})
                </button>
            </div>
            <div class="sla-legend" aria-label="Referência de tempo na fila">
                <span class="legend-title">TEMPO NA FILA</span>
                <span><i class="legend-dot dot-success"></i> No prazo ≤ 20 min</span>
                <span><i class="legend-dot dot-warning"></i> Atenção &gt; 20 até 30 min</span>
                <span><i class="legend-dot dot-danger"></i> Atrasado &gt; 30 min</span>
            </div>
            <div class="dishes-container queue-table">
                <dataTable ref="queueTable" :dataobj="orders" rowsperpage="10" searchText="" :loaded="contentLoaded" selectitems="true" @selected="selectedForPrint = $event">
                    <grid-column prop="id" label="Pedido / cliente" v-slot="props">
                        <button class="order-link" type="button" @click="openOrder(props.item)">
                            <span class="order-number">#{{ props.item.id }}</span>
                            <span class="order-customer">{{ props.item.nome_cliente || 'Cliente não informado' }}</span>
                        </button>
                    </grid-column>
                    <grid-column prop="from_app" label="Origem" align="center" v-slot="props">
                        <span class="origin-label" :class="props.item.from_app == 1 ? 'origin-app' : 'origin-local'">{{ props.item.from_app == 1 ? 'APP' : 'LOCAL' }}</span>
                    </grid-column>
                    <grid-column prop="mesa" label="Destino" v-slot="props">
                        <span class="destination"><span class="material-icons" aria-hidden="true">{{ props.item.tem_entrega ? 'delivery_dining' : (props.item.mesa ? 'restaurant' : 'storefront') }}</span>{{ formatLocationLabel(props.item) }}</span>
                    </grid-column>
                    <grid-column prop="itens_prontos" label="Progresso" v-slot="props">
                        <div class="progress-cell">
                            <span><strong>{{ resolvedCount(props.item) }}/{{ props.item.total_itens }}</strong> resolvidos</span>
                            <div class="progress-track" role="progressbar" :aria-valuenow="resolvedCount(props.item)" aria-valuemin="0" :aria-valuemax="Number(props.item.total_itens) || 0" :aria-label="resolvedCount(props.item) + ' de ' + props.item.total_itens + ' itens resolvidos'"><div class="progress-fill" :style="{ width: progressPercent(props.item) + '%' }"></div></div>
                            <small v-if="Number(props.item.itens_cancelados) > 0">{{ props.item.itens_cancelados }} cancelado(s)</small>
                        </div>
                    </grid-column>
                    <grid-column prop="segundos_na_fila" label="Tempo na fila" v-slot="props">
                        <div class="sla-cell" :class="'sla-' + slaLevel(elapsedQueue(props.item))">
                            <span class="sla-status"><i></i>{{ slaLabel(elapsedQueue(props.item)) }}</span>
                            <strong>{{ formatQueueTime(elapsedQueue(props.item)) }}</strong>
                        </div>
                    </grid-column>
                    <grid-column prop="acao" label="Ações" align="center" v-slot="props">
                        <div class="row-actions">
                            <button class="btn btn-primary small" type="button" @click="openOrder(props.item)">
                                <span class="material-icons">checklist</span> SEPARAR
                            </button>
                            <button class="btn btn-gray small print-action" type="button" title="Imprimir lista de separação" aria-label="Imprimir lista de separação" @click="printOne(props.item)">
                                <span class="material-icons">print</span>
                            </button>
                        </div>
                    </grid-column>
                </dataTable>
            </div>
        </div>

        <!-- NIVEL 2: sub-aba da venda, mesma tela -->
        <div v-if="view === 'detail' && selectedOrder">
            <button class="back-link" type="button" @click="backToGrid()"><span class="material-icons">arrow_back</span> Voltar para a fila</button>
            <div class="order-detail-header">
                <div>
                    <h2>Venda #{{ selectedOrder.id }} · {{ selectedOrder.nome_cliente }}</h2>
                    <p class="order-detail-subtitle">
                        <newBadge :status="selectedOrder.from_app == 1 ? 'info' : 'neutral'" :text="selectedOrder.from_app == 1 ? 'APP' : 'BALCÃO'" />
                        {{ formatLocationLabel(selectedOrder) }}
                        <span class="detail-sla" :class="'sla-' + slaLevel(elapsedQueue(selectedOrder))">{{ slaLabel(elapsedQueue(selectedOrder)) }} · {{ formatQueueTime(elapsedQueue(selectedOrder)) }}</span>
                    </p>
                </div>
                <div class="order-detail-actions">
                    <button class="btn btn-gray" @click="printOne(selectedOrder)">
                        <span class="material-icons">print</span>
                        IMPRIMIR
                    </button>
                </div>
            </div>

            <p class="detail-guidance">Inicie cada item e confirme o que foi separado. Se necessário, informe a falta ou substituição.</p>

            <div class="item-cards" v-if="orderItems.length">
                <div class="item-card" v-for="item in orderItems" :key="item.id">
                    <img v-if="item.imagem" :src="item.imagem" class="item-card-photo" />
                    <div v-else class="item-card-photo item-card-photo-placeholder">{{ (item.nome || '?').charAt(0).toUpperCase() }}</div>

                    <div class="item-card-info">
                        <h3>{{ item.nome }}</h3>
                        <p class="item-card-quantity">Qtd: {{ item.quantidade_restante }}</p>
                        <p class="item-card-obs" v-if="item.observacoes">Obs: {{ item.observacoes }}</p>

                        <div class="item-card-status item-card-cancelled" v-if="item.status === 'Cancelado'">
                            <newBadge status="danger" text="CANCELADO" />
                            <span>{{ formatCancellationReason(item.motivo_cancelamento) || 'Motivo não informado' }}</span>
                        </div>
                        <div class="item-card-status" v-else-if="item.status === 'Pronto'">
                            <newBadge status="success" text="PRONTO" />
                        </div>
                        <div class="item-card-status" v-else-if="item.status_preparo === 'Em preparo'">
                            <newBadge status="info" text="EM PREPARO" />
                            <span>⏱️ {{ formatElapsedTime(item.segundos_decorridos) }}</span>
                        </div>
                        <div class="item-card-status" v-else>
                            <newBadge status="warning" text="AGUARDANDO" />
                        </div>
                    </div>

                    <div class="item-card-buttons" v-if="item.status === 'Preparando'">
                        <button v-if="item.status_preparo !== 'Em preparo'" class="btn btn-yellow small" @click="startItem(item)">
                            INICIAR
                        </button>
                        <button v-else class="btn btn-primary small" @click="confirmItem(item)">
                            CONFIRMAR
                        </button>
                        <button class="btn btn-danger small" @click="cancelItem(item)">
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
import newBadge from "../../newBadge.vue";
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
            clockNow: Date.now(),
            showCancelOrderModalContent: false,
            showResolveItemModalContent: false,
            resolveInitialResolution: null,
            selectedComandaId: null,
            selectedDishId: null,
            selectedDish: null
        }
    },
    methods: {
        elapsedQueue(order) {
            if (order.segundos_na_fila === null || order.segundos_na_fila === undefined || order.segundos_na_fila === '') return null;
            const seconds = Number(order.segundos_na_fila);
            if (!Number.isFinite(seconds)) return null;
            return Math.max(0, seconds + Math.floor((this.clockNow - order.queueLoadedAt) / 1000));
        },
        slaLevel(seconds) {
            if (seconds === null || !Number.isFinite(seconds)) return 'unknown';
            if (seconds > 30 * 60) return 'danger';
            if (seconds > 20 * 60) return 'warning';
            return 'success';
        },
        slaLabel(seconds) {
            return { success: 'No prazo', warning: 'Atenção', danger: 'Atrasado', unknown: 'Sem tempo' }[this.slaLevel(seconds)];
        },
        countSla(level) {
            return this.orders.filter((order) => this.slaLevel(this.elapsedQueue(order)) === level).length;
        },
        formatQueueTime(seconds) {
            if (seconds === null || !Number.isFinite(seconds)) return 'Tempo indisponível';
            const minutes = Math.floor(seconds / 60);
            if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`;
            return `${minutes}min ${String(Math.floor(seconds % 60)).padStart(2, '0')}s`;
        },
        resolvedCount(order) {
            return (Number(order.itens_prontos) || 0) + (Number(order.itens_cancelados) || 0);
        },
        progressPercent(order) {
            const total = Number(order.total_itens) || 0;
            return total ? Math.min(100, Math.max(0, this.resolvedCount(order) / total * 100)) : 0;
        },
        formatCancellationReason(reason) {
            if (!reason) return reason;
            const labels = { 'Pedido lancado errado': 'Pedido lançado errado', 'Solicitacao do cliente': 'Solicitação do cliente' };
            const separator = reason.indexOf(':');
            const key = separator === -1 ? reason : reason.slice(0, separator);
            return (labels[key] || key) + (separator === -1 ? '' : reason.slice(separator));
        },
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
                this.$toast.error(error.response?.data || 'Não foi possível atualizar a fila da cozinha.');
            });
        },
        startItem(item) {
            let self = this;

            api.post("/kitchen/orders/" + item.id + "/start").then(() => {
                self.loadOrderItems();
            }).catch((error) => {
                this.$toast.error(error.response?.data || 'Não foi possível carregar os itens da venda.');
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
        printOne(order) {
            let self = this;

            api.get("/kitchen/orders/" + order.id + "/separation-sheet").then((response) => {
                const sheet = response.data.returnObj;

                const doc = { type: "separation", sheets: [sheet] };

                printService.print(self.$router, doc);
            }).catch((error) => {
                this.$toast.error(error.response?.data || 'Não foi possível carregar a lista de separação.');
            });
        },
        printBatch() {
            let self = this;

            if (!self.selectedForPrint.length) return;

            const ids = self.selectedForPrint.map((order) => order.id).join(",");

            api.get("/kitchen/separation-sheet?ids=" + ids).then((response) => {
                const sheets = response.data.returnObj || [];
                if (!sheets.length) {
                    this.$toast.error('Não há vendas disponíveis para impressão.');
                    return;
                }
                printService.print(self.$router, { type: "separation", sheets });
            }).catch((error) => {
                this.$toast.error(error.response?.data || 'Não foi possível carregar as listas de separação.');
            });
        },
        returnOrders(cleanCache = false) {
            let self = this;

            self.contentLoaded = false;

            api.get("/kitchen/orders" + (cleanCache ? "?clearCache=true" : "")).then((response) => {
                const selectedIds = new Set(self.selectedForPrint.map((order) => order.id));
                self.clockNow = Date.now();
                self.orders = (response.data.returnObj || []).map((order) => ({ ...order, queueLoadedAt: self.clockNow }));
                if (self.$refs.queueTable) {
                    self.$refs.queueTable.selectedItems = self.orders.filter((order) => selectedIds.has(order.id));
                }
                const updatedOrder = self.selectedOrder && self.orders.find((order) => order.id === self.selectedOrder.id);
                if (updatedOrder) self.selectedOrder = updatedOrder;
                self.contentLoaded = true;

                // A venda aberta pode ter saido do grid (ultimo item resolvido em outra
                // aba/usuario) - volta pro nivel 1 sozinho em vez de mostrar uma sub-aba
                // orfa.
                if (self.view === "detail" && self.selectedOrder && !self.orders.some((o) => o.id === self.selectedOrder.id)) {
                    self.backToGrid();
                }
            }).catch((error) => {
                this.$toast.error(error.response?.data || 'Não foi possível carregar a fila da cozinha.');
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
                this.clockNow = Date.now();
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
    beforeDestroy: function () {
        clearTimeout(this.refreshTimeout);
        clearInterval(this.timerInterval);
    },
    components: {
        dataTable,
        modal,
        cancelOrderModalContent,
        resolveKitchenItemModalContent,
        newBadge
    }
}
</script>
<style scoped>
.kitchen-title { margin-bottom: 24px; }
.kitchen-title h1 { margin: 4px 0 6px; }
.eyebrow { margin: 0; color: #a64a34; font-size: 11px; font-weight: 800; letter-spacing: .12em; }
.page-description { margin: 0; color: var(--ink-soft); font-size: 14px; }
.queue-overview { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 28px; }
.overview-item { display: flex; align-items: center; gap: 14px; min-height: 90px; padding: 16px 20px; background: var(--surface); border: 1px solid #e9e3da; border-radius: 12px; }
.overview-item > div { display: flex; flex-direction: column; gap: 3px; }
.overview-item strong { font-size: 25px; line-height: 1; color: #302b25; }
.overview-item div span { font-size: 13px; color: #70695f; }
.overview-icon { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 44px; border-radius: 12px; font-size: 22px; }
.overview-icon-total { color: #a64a34; background: #faeee9; }
.overview-icon-warning { color: #956506; background: #fdf3d9; }
.overview-icon-danger { color: #b73332; background: #fbe9e7; }
.queue-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
.queue-toolbar h2 { margin: 0 0 5px; font-size: 19px; }
.queue-toolbar p { margin: 0; font-size: 13px; color: var(--ink-soft); }
.batch-print { display: inline-flex; align-items: center; gap: 8px; }
.sla-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 20px; padding: 0 0 14px; color: #625b53; font-size: 12px; }
.sla-legend > span:not(.legend-title) { display: inline-flex; align-items: center; gap: 6px; }
.legend-title { color: #8b8176; font-size: 10px; letter-spacing: .08em; font-weight: 800; }
.legend-dot, .sla-status i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex: 0 0 8px; }
.dot-success { background: #32966a; }.dot-warning { background: #d69218; }.dot-danger { background: #d44b43; }
.queue-table ::v-deep .inner-table-content { border: 1px solid #e9e3da; border-radius: 12px; overflow: hidden; }
.queue-table ::v-deep .table th { color: #7a7167; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
.queue-table ::v-deep .table td { padding-top: 16px; padding-bottom: 16px; }
.order-link { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; border: 0; padding: 0; background: transparent; text-align: left; cursor: pointer; }
.order-number { color: #ad4b34; font-weight: 800; font-size: 15px; }
.order-customer { color: #3a342e; font-weight: 600; font-size: 13px; }
.order-link:hover .order-customer { text-decoration: underline; }
.origin-label { display: inline-block; border-radius: 6px; padding: 5px 9px; font-size: 10px; letter-spacing: .04em; font-weight: 800; }
.destination { display: inline-flex; align-items: center; gap: 7px; color: #5d564e; font-size: 13px; font-weight: 600; }
.destination .material-icons { color: #9c9083; font-size: 19px; }
.queue-table ::v-deep .table .row-actions .btn-primary .material-icons { color: #fff; font-size: 18px; }
.queue-table ::v-deep .table .row-actions .print-action { width: 38px; min-width: 38px; }
.queue-table ::v-deep .table .row-actions .print-action .material-icons { font-size: 18px; }
.progress-cell { min-width: 125px; max-width: 160px; color: #746c62; font-size: 12px; }
.progress-cell strong { color: #39332e; font-size: 13px; }
.progress-cell small { display: block; margin-top: 5px; color: #9a5c50; font-size: 11px; }
.progress-track { height: 6px; border-radius: 10px; background: #ece8e1; margin-top: 7px; overflow: hidden; }
.progress-fill { height: 100%; background: #c6553a; border-radius: inherit; }
.sla-cell { display: inline-flex; min-width: 116px; flex-direction: column; align-items: flex-start; gap: 4px; border-radius: 8px; padding: 8px 10px; }
.sla-cell strong { font-size: 14px; font-variant-numeric: tabular-nums; }
.sla-status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; }
.sla-success { color: #236c4d; background: #eaf6ef; }.sla-success i { background: #32966a; }
.sla-warning { color: #805600; background: #fff5dc; }.sla-warning i { background: #d69218; }
.sla-danger { color: #a62f2d; background: #fcebe9; }.sla-danger i { background: #d44b43; }
.sla-unknown { color: #716b63; background: #f1efeb; }.sla-unknown i { background: #9a938a; }
.back-link { display: inline-flex; align-items: center; gap: 5px; border: 0; padding: 0; margin-bottom: 18px; background: transparent; color: #a64a34; font-weight: 700; cursor: pointer; }
.back-link .material-icons { font-size: 18px; }
.detail-sla { padding: 5px 9px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.detail-guidance { margin: 0 0 16px; padding: 13px 16px; border-radius: 9px; background: #fff7e9; color: #765b36; font-size: 13px; }
@media (max-width: 768px) {
    .queue-overview { gap: 8px; }
    .overview-item { flex-direction: column; justify-content: flex-start; min-height: 122px; padding: 12px 6px; gap: 8px; text-align: center; }
    .overview-item > div { align-items: center; }
    .overview-icon { width: 32px; height: 32px; flex-basis: 32px; font-size: 18px; }
    .overview-item strong { font-size: 20px; }
    .overview-item div span { font-size: 11px; }
    .queue-table ::v-deep .inner-table-content { overflow: hidden; }
    .queue-table ::v-deep .table { min-width: 0; }
    .queue-table ::v-deep .table tbody tr { padding: 8px 12px; border: 0; border-bottom: 1px solid #e9e3da; }
    .queue-table ::v-deep .table td { grid-template-columns: minmax(90px, 1fr) minmax(0, 1.4fr); place-items: center start; padding: 10px 4px; text-align: left; }
    .queue-table ::v-deep .table td::before { text-align: left; color: #81766b; font-size: 11px; font-weight: 700; }
    .queue-table ::v-deep .table td:first-child { display: flex; width: auto !important; max-width: none !important; justify-content: flex-end; padding-bottom: 4px; }
    .queue-table ::v-deep .table td:first-child::before { content: 'Selecionar para impressão'; font-size: 11px; }
    .row-actions { justify-content: flex-start; }
    .order-detail-subtitle { flex-wrap: wrap; }
}
.row-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    flex-wrap: wrap;
}

.row-actions button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    white-space: nowrap;
}

.order-detail-actions button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
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

.item-card-status { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; color: var(--ink-soft); font-size: 13px; }
.item-card-status ::v-deep .badge { margin: 0; }

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
