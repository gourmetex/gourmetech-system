<template>
    <div class="cancel-order-modal-content">
        <div class="response"></div>
        <form @submit.prevent="submitCancellation">
            <div class="info-group" v-if="order && order.cancel_status === 'requested'">
                <h3>Solicitação de Cancelamento (Cliente)</h3>
                <p><strong>Motivo:</strong> {{ order.cancel_reason }}</p>
                <p><strong>Regra financeira:</strong> será cobrada do cliente uma taxa fixa de R$ 5,00; o saldo do pagamento, inclusive a entrega, será estornado automaticamente. Se o Pix for pago após o cancelamento, o estorno também será automático.</p>
            </div>

            <div class="info-group" v-else>
                <h3>Regra financeira</h3>
                <p>Cancelamento pelo sistema: o cliente receberá o estorno integral, incluindo a taxa de entrega. A empresa absorverá a taxa de cancelamento de R$ 5,00, registrada nas contas a pagar.</p>
            </div>

            <div class="info-group">
                <h3>Devolução de Estoque</h3>
                <p v-if="restorableItems.length">
                    Selecione o que já foi preparado e sobrou pronto. Por padrão nada fica marcado - devolver
                    comida já preparada ao estoque é exceção.
                </p>
                <p v-else>Nenhum item desta comanda chegou a ser preparado. Não há nada para devolver ao estoque.</p>

                <div v-for="item in restorableItems" :key="item.id_prato" class="item-stock">
                    <label>
                        <input type="checkbox" v-model="item.returnToStock">
                        {{ item.nome }} (preparado: {{ formatNumber(item.quantidade_feita) }})
                    </label>
                </div>
            </div>

            <div class="info-group" v-if="!order || order.cancel_status !== 'requested'">
                <h3>Motivo do Cancelamento</h3>
                <input type="text" class="input-form w-100" v-model="reason" placeholder="Descreva o motivo" required />
            </div>

            <button type="submit" id="submit-cancellation-hidden" style="display:none"></button>
        </form>
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
                this.setResponse(error.response.data, "error");
            });
        },
        rejectCancellation: function () {
            api.post("/orders/reject_cancellation/" + this.order.id).then((response) => {
                this.setResponse(response.data, "success");
                this.$emit("savedContent");
            }).catch((error) => {
                this.setResponse(error.response.data, "error");
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
.info-group {
    margin-bottom: 20px;
}
.item-stock {
    margin: 10px 0;
}
</style>
