<template>
    <div class="cancel-shipping-content">
        <div class="response">{{ response }}</div>

        <form @submit.prevent="handleSubmit">
            <!-- ETAPA 1: motivo e itens que voltam ao estoque -->
            <div v-if="step === 'form'">
                <div class="info-group">
                    <h3>Entrega</h3>
                    <p>Entrega #{{ shippingid }} &middot; comanda #{{ comandaid }} &middot; {{ formatCurrency(valortotal) }}</p>
                </div>

                <div class="info-group">
                    <h3>Motivo do cancelamento</h3>
                    <input type="text" class="input-form w-100" v-model="reason" placeholder="Descreva o motivo (opcional)" maxlength="180" />
                </div>

                <div class="info-group">
                    <h3>Itens já preparados</h3>
                    <p class="hint" v-if="restorableItems.length">
                        Selecione o que sobrou pronto e pode voltar ao estoque. Por padrão nada fica marcado -
                        devolver comida já preparada é exceção.
                    </p>
                    <p class="hint" v-else>
                        Nenhum item desta comanda chegou a ser preparado. O cancelamento não vai devolver nada ao
                        estoque.
                    </p>

                    <div class="restorable-item" v-for="item in restorableItems" :key="item.id_prato">
                        <label class="option-label">
                            <input type="checkbox" v-model="item.selected" />
                            <img v-if="item.imagem" :src="item.imagem" class="restorable-item-image" />
                            <span>{{ item.nome }}</span>
                        </label>

                        <div class="restorable-item-quantity" v-if="item.selected">
                            <label :for="'qty-' + item.id_prato">Quantidade a devolver</label>
                            <input
                                type="number"
                                class="input-form"
                                min="0"
                                :max="item.quantidade_feita"
                                step="0.001"
                                :id="'qty-' + item.id_prato"
                                v-model="item.quantidade_selecionada"
                            />
                            <small>preparado(s): {{ formatNumber(item.quantidade_feita) }}</small>
                        </div>

                        <ul class="restorable-item-ingredients" v-if="item.selected && item.ingredientes.length">
                            <li v-for="ingredient in item.ingredientes" :key="ingredient.id">
                                + {{ formatNumber(scaledIngredientQuantity(item, ingredient)) }} {{ ingredient.unidade_medida }} de {{ ingredient.nome }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- ETAPA 2: confirmacao -->
            <div v-else>
                <div class="info-group confirm-box">
                    <h3>Confirme o cancelamento</h3>
                    <p>
                        A venda <strong>#{{ comandaid }}</strong> será cancelada e
                        <strong>{{ formatCurrency(valortotal) }}</strong> serão estornados integralmente ao cliente,
                        incluindo a taxa de entrega. Esta ação não pode ser desfeita.
                    </p>
                    <p class="mt-2" v-if="reason"><strong>Motivo:</strong> {{ reason }}</p>

                    <div class="mt-2" v-if="selectedItems.length">
                        <strong>Estoque que será devolvido:</strong>
                        <ul>
                            <li v-for="item in selectedItems" :key="item.id_prato">
                                {{ item.nome }}: {{ formatNumber(item.quantidade_selecionada) }}
                            </li>
                        </ul>
                    </div>
                    <p class="mt-2" v-else><strong>Estoque:</strong> nenhum item devolvido.</p>
                </div>
            </div>

            <button type="submit" id="submit-cancel-shipping-hidden" style="display:none"></button>
        </form>
    </div>
</template>
<script>
import api from "../../../configs/api";
import $ from 'jquery';
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "cancelShippingModalContent",
    props: ["shippingid", "comandaid", "valortotal"],
    mixins: [globalMethods],
    data() {
        return {
            step: "form",
            reason: "",
            restorableItems: [],
            sending: false
        }
    },
    computed: {
        selectedItems() {
            return this.restorableItems.filter((item) => item.selected && this.parseQuantity(item.quantidade_selecionada) > 0);
        }
    },
    methods: {
        formatNumber(value) {
            const number = Number(value) || 0;
            return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
        },
        parseQuantity(value) {
            const number = Number(String(value ?? "").replace(",", "."));
            return isNaN(number) || number < 0 ? 0 : number;
        },
        // Previa de quanto de cada ingrediente volta, proporcional a quantidade selecionada
        // (a API devolve o total pra quantidade_feita inteira; aqui so escalamos pra previa).
        scaledIngredientQuantity(item, ingredient) {
            if (!item.quantidade_feita) return 0;
            const ratio = this.parseQuantity(item.quantidade_selecionada) / item.quantidade_feita;
            return ingredient.quantidade_total * ratio;
        },
        getRestorableItems() {
            api.get("/orders/" + this.comandaid + "/restorable-items").then((response) => {
                this.restorableItems = (response.data.returnObj || []).map((item) => ({
                    ...item,
                    selected: false,
                    quantidade_selecionada: item.quantidade_feita
                }));
            }).catch((error) => {
                this.setResponse(error.response?.data || "Não foi possível carregar os itens preparados", "error");
            });
        },
        handleSubmit() {
            if (this.step === "form") {
                this.goToConfirmation();
            } else {
                this.submitCancellation();
            }
        },
        goToConfirmation() {
            if (this.selectedItems.some((item) => this.parseQuantity(item.quantidade_selecionada) > item.quantidade_feita)) {
                this.setResponse("A quantidade a devolver não pode ser maior do que a preparada", "error");
                return;
            }

            this.resetResponse();
            this.step = "confirm";
            this.$emit("stepChange", "Confirmar Cancelamento");
            $("#modal-submit-button").removeAttr("disabled").removeClass("btn-loading");
        },
        submitCancellation() {
            if (this.sending) return;

            this.sending = true;

            const payload = {
                reason: this.reason.trim() || null,
                items_to_restore: this.selectedItems.map((item) => ({
                    id_prato: item.id_prato,
                    quantidade_restaurar: this.parseQuantity(item.quantidade_selecionada)
                }))
            };

            api.patch("/shipping/cancel/" + this.shippingid, payload).then((response) => {
                this.setResponse(response.data, "success");
                this.$emit("savedContent");
            }).catch((error) => {
                this.sending = false;
                this.step = "form";
                this.$emit("stepChange", "Continuar");
                this.setResponse(error.response?.data || "Erro ao cancelar a entrega", "error");
            });
        }
    },
    mounted: function () {
        this.getRestorableItems();

        $("#modal-submit-button").off("click").on("click", function () {
            $("#submit-cancel-shipping-hidden").click();
        });
    }
}
</script>
<style scoped>
.cancel-shipping-content {
    text-align: left;
}

.info-group {
    margin-bottom: 20px;
}

.hint {
    font-size: 0.85rem;
    opacity: 0.85;
    margin-bottom: 10px;
}

.option-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.restorable-item {
    padding: 10px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.restorable-item-image {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 4px;
}

.restorable-item-quantity {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    margin-left: 42px;
}

.restorable-item-quantity input {
    width: 100px;
}

.restorable-item-quantity small {
    opacity: 0.75;
}

.restorable-item-ingredients {
    margin: 8px 0 0 42px;
    font-size: 0.82rem;
    opacity: 0.85;
    list-style: none;
}

.confirm-box ul {
    margin: 8px 0 0 18px;
    list-style: disc;
}

.mt-2 {
    margin-top: 10px;
}

.w-100 {
    width: 100%;
}
</style>
