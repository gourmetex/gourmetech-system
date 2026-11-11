<template>
    <div class="cancel-order-modal-content">
        <div class="response">{{ response }}</div>
        <form v-if="order" @submit.prevent="submitCancellation">
            <div class="request-card" v-if="order.cancel_status === 'requested'">
                <span class="material-icons request-icon" aria-hidden="true">person_outline</span>
                <div class="request-content">
                    <p class="section-kicker">SOLICITAÇÃO DO CLIENTE</p>
                    <h3>Motivo do cancelamento</h3>
                    <p class="request-reason">{{ order.cancel_reason || 'Motivo não informado' }}</p>
                </div>
            </div>

            <div class="financial-card">
                <span class="material-icons financial-icon" aria-hidden="true">account_balance_wallet</span>
                <div>
                    <h3>O que acontece com o pagamento</h3>
                    <p v-if="order.cancel_status === 'requested'">Será cobrada do cliente uma taxa fixa de <strong>R$ 5,00</strong>. O saldo do pagamento, incluindo a entrega, será estornado automaticamente. Se o Pix for pago após o cancelamento, o estorno também será automático.</p>
                    <p v-else>O cliente receberá o estorno integral, incluindo a taxa de entrega. A empresa absorverá a taxa de cancelamento de <strong>R$ 5,00</strong>, registrada nas contas a pagar.</p>
                </div>
            </div>

            <section class="stock-section" aria-labelledby="stock-title">
                <div class="section-heading">
                    <div><p class="section-kicker">ITENS PREPARADOS</p><h3 id="stock-title">Devolução ao estoque</h3></div>
                    <span v-if="restorableItems.length" class="optional-label">OPCIONAL</span>
                </div>
                <p class="section-description" v-if="restorableItems.length">Selecione apenas os itens que sobraram prontos e podem voltar ao estoque. Por padrão, nenhum item vem marcado.</p>
                <p class="section-description" v-else>Nenhum item desta comanda chegou a ser preparado. Não há nada para devolver ao estoque.</p>

                <div v-if="restorableItems.length" class="stock-list">
                    <label v-for="item in restorableItems" :key="item.id_prato" class="item-stock" :class="{ 'item-stock-selected': item.returnToStock }">
                        <input type="checkbox" v-model="item.returnToStock">
                        <span class="stock-item-name">{{ item.nome }}</span>
                        <span class="stock-quantity">Preparado: <strong>{{ formatNumber(item.quantidade_feita) }}</strong></span>
                    </label>
                </div>
            </section>

            <div class="reason-section" v-if="order.cancel_status !== 'requested'">
                <label for="cancellation-reason">Motivo do cancelamento <span>*</span></label>
                <input id="cancellation-reason" type="text" class="input-form w-100" v-model="reason" placeholder="Descreva o motivo" required />
            </div>

            <button type="submit" id="submit-cancellation-hidden" style="display:none"></button>
        </form>
        <p v-else class="loading-order">Carregando informações do cancelamento...</p>
    </div>
</template>
<script>
import api from "../../../configs/api";
import $ from 'jquery';
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "cancelOrderModalContent",
    props: ["orderid"],
    mixins: [globalMethods],
    data() {
        return {
            order: null,
            restorableItems: [],
            reason: ""
        }
    },
    methods: {
        formatNumber(value) {
            const number = Number(value) || 0;
            return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
        },
        getOrder: function () {
            api.get("/orders/" + this.orderid).then((response) => {
                this.order = response.data.returnObj;
            });

            // D8: so o que pedidos_feitos registra como preparado pode voltar ao estoque -
            // nunca a quantidade pedida (o backend ja clampa isso de novo, mas comecar daqui
            // evita marcar quantidade que nunca existiu).
            api.get("/orders/" + this.orderid + "/restorable-items").then((response) => {
                this.restorableItems = (response.data.returnObj || []).map((item) => ({
                    ...item,
                    returnToStock: false
                }));
            });
        },
        submitCancellation: function () {
            const itemsToRestore = this.restorableItems
                .filter(i => i.returnToStock)
                .map(i => ({ id_prato: i.id_prato, quantidade_restaurar: i.quantidade_feita }));

            const payload = {
                reason: this.order.cancel_status === 'requested' ? this.order.cancel_reason : this.reason,
                cancelled_by: this.order.cancel_status === 'requested' ? 'customer' : 'system',
                items_to_restore: itemsToRestore
            };

            api.delete("/orders/" + this.order.id, { data: payload }).then((response) => {
                this.setResponse(response.data, "success");
                this.$emit("savedContent");
            }).catch((error) => {
                this.setResponse(error.response?.data || "Não foi possível cancelar a venda.", "error");
            });
        },
        rejectCancellation: function () {
            api.post("/orders/reject_cancellation/" + this.order.id).then((response) => {
                this.setResponse(response.data, "success");
                this.$emit("savedContent");
            }).catch((error) => {
                this.setResponse(error.response?.data || "Não foi possível recusar o cancelamento.", "error");
            });
        }
    },
    mounted: function () {
        this.getOrder();

        let self = this;
        $("#modal-submit-button").off("click").on("click", function () {
            $("#submit-cancellation-hidden").click();
        });

        // Adiciona funcionalidade do botão de recusar (modalButton3) se for solicitação do app
        $("#modal-save-submit-button").off("click").on("click", function () {
            self.rejectCancellation();
        });
    }
}
</script>
<style scoped>
.cancel-order-modal-content {
    text-align: left;
}
.cancel-order-modal-content h3, .cancel-order-modal-content p { margin: 0; }
.request-card, .financial-card { display: flex; align-items: flex-start; gap: 13px; padding: 15px 16px; border-radius: 10px; }
.request-card { background: #f7f5f1; border: 1px solid #ebe6de; margin-bottom: 12px; }
.request-icon, .financial-icon { display: grid; place-items: center; flex: 0 0 36px; width: 36px; height: 36px; border-radius: 9px; font-size: 20px; }
.request-icon { color: #9d4836; background: #fae8e2; }
.financial-icon { color: #94650a; background: #f8e8c2; }
.request-content, .financial-card > div { min-width: 0; }
.section-kicker { color: #8d8174; font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.request-card h3, .financial-card h3, .stock-section h3 { color: #332d27; font-size: 15px; font-weight: 700; }
.request-card h3 { margin-top: 3px; }
.request-reason { margin-top: 6px !important; color: #62584f; font-size: 14px; overflow-wrap: anywhere; }
.financial-card { background: #fff8e9; border: 1px solid #f3e3bf; }
.financial-card p { margin-top: 5px; color: #6c5836; font-size: 13px; line-height: 1.55; }
.stock-section { margin-top: 24px; }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.section-heading h3 { margin-top: 4px; }
.optional-label { color: #857c72; font-size: 10px; letter-spacing: .06em; font-weight: 800; }
.section-description { color: #746b61; font-size: 13px; line-height: 1.5; margin-top: 7px !important; }
.stock-list { display: grid; gap: 8px; margin-top: 14px; }
.item-stock { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #e7e1d9; border-radius: 9px; cursor: pointer; background: #fff; }
.item-stock:hover { border-color: #c8b9a8; }
.item-stock-selected { background: #fdf6f2; border-color: #c66a51; }
.item-stock input { flex: 0 0 auto; width: 18px; height: 18px; margin: 0; accent-color: #bb503a; cursor: pointer; }
.stock-item-name { flex: 1; min-width: 0; color: #3b342d; font-size: 13px; font-weight: 700; overflow-wrap: anywhere; }
.stock-quantity { color: #81776c; font-size: 12px; white-space: nowrap; }
.stock-quantity strong { color: #514940; }
.reason-section { margin-top: 22px; }
.reason-section label { display: block; margin-bottom: 8px; color: #332d27; font-size: 14px; font-weight: 700; }
.reason-section label span { color: #b84435; }
.loading-order { color: #746b61; font-size: 14px; }
@media (max-width: 480px) {
    .request-card, .financial-card { gap: 10px; padding: 12px; }
    .item-stock { flex-wrap: wrap; gap: 8px 10px; }
    .stock-item-name { flex-basis: calc(100% - 28px); }
    .stock-quantity { padding-left: 28px; }
}
</style>
