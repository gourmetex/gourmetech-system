<template>
    <div class="kitchen-component">
        <div class="page-title">
            <h1>Fila da cozinha</h1>
        </div>
        <actionButtons 
            add_text="FINALIZAR PEDIDO" 
            exclude_text="CANCELAR PEDIDO" 
            edit_text="INICIAR PEDIDO"
            edit_icon="play_arrow"
            :disabledbuttons="disabledButtons"
            @add="finishDish()" 
            @exclude="cancelDish()" 
            @edit="startDish()" 
        />
        <div class="dishes-container">
            <dataTable :dataobj="orders" rowsperpage="7" searchText="" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" align="center" v-slot="props">
                    <p class="clicable text-center" @click="handleRowClick($event, props.item)">{{ props.item.id }}</p>
                </grid-column>
                <grid-column prop="id_comanda" label="Comanda" align="center"></grid-column>
                <grid-column prop="mesa" label="Mesa" align="center"></grid-column>
                <grid-column prop="nome" label="Pedido"></grid-column>
                <grid-column prop="quantidade_restante" label="Quantidade" align="center"></grid-column>
                <grid-column prop="status_preparo" label="Status" align="center" v-slot="props">
                    <span class="status-badge" :class="props.item.status_preparo === 'Em preparo' ? 'badge-in-progress' : 'badge-waiting'">
                        {{ props.item.status_preparo || 'Aguardando' }}
                    </span>
                </grid-column>
                <grid-column prop="tempo_decorrido" label="Tempo Decorrido" align="center" v-slot="props">
                    <span class="timer-badge" v-if="props.item.status_preparo === 'Em preparo'">
                        ⏱️ {{ formatElapsedTime(props.item) }}
                    </span>
                    <span class="timer-badge-waiting" v-else>
                        -
                    </span>
                </grid-column>
                <grid-column prop="observacoes" label="Observações"></grid-column>
            </dataTable>
        </div>

        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :modalbutton2="modalButton2" :modalButton3="modalButton3" @closeModal="closeModalFunction(); returnDishes();">
            <cancelOrderModalContent v-if="showCancelOrderModalContent" :orderid="selectedComandaId" @savedContent="closeModalFunction(); returnDishes();"></cancelOrderModalContent>
        </modal>
    </div>
</template>
<script>
import api from "../../../configs/api";
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import modal from "../../modal.vue";
import cancelOrderModalContent from "../orders/cancelOrderModalContent.vue";
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "kitchenComponent",
    mixins: [globalMethods],
    data() {
        return {
            orders: [],
            refreshTimeout: null,
            timerInterval: null,
            showCancelOrderModalContent: false,
            selectedComandaId: null
        }
    },
    watch: {
        editId: function (newVal) {
            if (newVal == null) {
                this.disableActionsButtons(true, true, true);
            } else {
                const selected = this.orders.find(o => o.id === newVal);
                this.updateButtonStates(selected);
            }
        }
    },
    methods: {
        handleRowClick: function (event, item) {
            this.selectRow(event);
            this.updateButtonStates(item);
        },
        updateButtonStates: function (item) {
            if (!item) {
                this.disableActionsButtons(true, true, true);
            } else if (item.status_preparo === 'Aguardando') {
                // Aguardando: Iniciar (3) = ENABLED, Finalizar (1) = DISABLED, Cancelar (2) = ENABLED
                this.disableActionsButtons(true, false, false);
            } else {
                // Em preparo: Iniciar (3) = DISABLED, Finalizar (1) = ENABLED, Cancelar (2) = ENABLED
                this.disableActionsButtons(false, false, true);
            }
        },
        startDish: function () {
            let self = this;
            if (!self.editId) return;

            api.post("/kitchen/orders/" + self.editId + "/start").then(() => {
                self.returnDishes();
                self.editId = null;
            }).catch((error) => {
                console.log(error);
            });
        },
        cancelDish: function () {
            let self = this;
            if (!self.editId) return;

            const selectedItem = self.orders.find(o => o.id === self.editId);
            if (!selectedItem) return;

            // Se este for o único item restante na comanda (total_active_dishes <= 1)
            if (selectedItem.total_active_dishes <= 1) {
                self.selectedComandaId = selectedItem.id_comanda;
                self.showCancelOrderModalContent = true;
                self.showModalFunction("Processar Cancelamento", "Confirmar Cancelamento", "Fechar");
            } else {
                // Cancela apenas este pedido individual na cozinha
                api.delete("/kitchen/orders/" + self.editId).then(() => {
                    self.returnDishes();
                    self.editId = null;
                }).catch((error) => {
                    console.log(error);
                });
            }
        },
        finishDish: function () {
            let self = this;
            if (!self.editId) return;

            api.post("/kitchen/orders/" + self.editId).then(() => {
                self.returnDishes();
                self.editId = null;
            }).catch((error) => {
                console.log(error);
            });
        },
        returnDishes: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/kitchen/orders").then((response) => {
                self.orders = response.data.returnObj || [];
                self.contentLoaded = true;
                self.reorganizeDishesObservations();
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                clearTimeout(self.refreshTimeout);
                self.refreshTimeout = setTimeout(() => {
                    self.returnDishes();
                }, 60 * 1000);
            });
        },
        reorganizeDishesObservations: function () {
            for (let i = 0; i < this.orders.length; i++) {
                this.orders[i].observacoes = this.groupObservations(this.orders[i].observacoes);
            }
        },
        formatElapsedTime: function (item) {
            if (item.segundos_decorridos === null || item.segundos_decorridos === undefined) return "-";
            const totalSecs = Math.max(0, Math.floor(item.segundos_decorridos));
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
        },
        startTimer: function () {
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                for (let i = 0; i < this.orders.length; i++) {
                    if (this.orders[i].status_preparo === 'Em preparo' && typeof this.orders[i].segundos_decorridos === 'number') {
                        this.orders[i].segundos_decorridos++;
                    }
                }
            }, 1000);
        }
    },
    mounted: function () {
        this.returnDishes();
        this.disableActionsButtons(true, true, true);
        this.startTimer();
    },
    unmounted: function () {
        clearTimeout(this.refreshTimeout);
        clearInterval(this.timerInterval);
    },
    components: {
        actionButtons,
        dataTable,
        modal,
        cancelOrderModalContent
    }
}
</script>
<style scoped>
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
    border: 1px solid #ffeeba;
}

.badge-in-progress {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.timer-badge {
    font-family: monospace;
    font-size: 0.9rem;
    font-weight: 700;
    color: #007bff;
    background: #e7f1ff;
    padding: 4px 8px;
    border-radius: 6px;
}

.timer-badge-waiting {
    color: #999;
}
</style>
