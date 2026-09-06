<template>
    <div class="resolve-kitchen-item-content">
        <div class="response">{{ response }}</div>

        <form @submit.prevent="handleSubmit">
            <!-- ETAPA 1: o que foi separado -->
            <div v-if="step === 'choice'">
                <div class="info-group">
                    <h3>Item</h3>
                    <p><strong>{{ item.nome }}</strong> &middot; comanda #{{ item.id_comanda }} &middot; quantidade {{ item.quantidade_restante }}</p>
                </div>

                <div class="info-group">
                    <h3>O que você separou?</h3>

                    <button type="button" class="choice-btn" @click="choosePrincipal">
                        <span class="choice-icon">✓</span>
                        Separei o principal ({{ item.nome }})
                    </button>

                    <button type="button" class="choice-btn" v-if="showSubstituteChoice" @click="chooseSubstituteFlow">
                        <span class="choice-icon">⇄</span>
                        <template v-if="item.substituto">Separei o substituto {{ item.substituto.nome }}</template>
                        <template v-else>Separei um substituto parecido</template>
                    </button>

                    <button type="button" class="choice-btn choice-btn-danger" @click="chooseCancelFlow">
                        <span class="choice-icon">✕</span>
                        <template v-if="showSubstituteChoice">Não tinha nenhum dos dois</template>
                        <template v-else>Não tinha o principal</template>
                    </button>
                </div>
            </div>

            <!-- ETAPA 2 (substituto/similar): escolher qual substituto foi separado -->
            <div v-else-if="step === 'pick-substitute'">
                <div class="info-group">
                    <h3>Escolha o substituto</h3>
                    <p class="hint">Só aparecem produtos com preço igual ou menor que o original; a diferença é estornada ao cliente.</p>

                    <p v-if="loadingCandidates">Carregando opções...</p>
                    <p v-else-if="!substituteCandidates.length" class="hint">
                        Nenhum substituto disponível no momento. Volte e selecione "Não tinha nenhum dos dois".
                    </p>
                    <div v-else class="candidate-list">
                        <label
                            v-for="candidate in substituteCandidates"
                            :key="candidate.id"
                            class="candidate-row"
                            :class="{ selected: selectedSubstituteId === candidate.id }"
                        >
                            <input type="radio" :value="candidate.id" v-model="selectedSubstituteId" />
                            <img v-if="candidate.image" :src="candidate.image" class="candidate-photo" />
                            <div class="candidate-info">
                                <strong>{{ candidate.name }}</strong>
                                <p>
                                    {{ formatCurrency(candidate.price) }}
                                    <span v-if="candidate.refund_if_chosen > 0" class="candidate-refund"> · estorna {{ formatCurrency(candidate.refund_if_chosen) }}</span>
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- ETAPA 2a (cancelar): motivo e estoque - fluxo ja existente -->
            <div v-else-if="step === 'form'">
                <div class="info-group">
                    <h3>Motivo *</h3>
                    <label v-for="(reason, index) in reasons" :key="index" class="option-label">
                        <input type="radio" :value="reason" v-model="selectedReason" />
                        <span>{{ reason }}</span>
                    </label>
                </div>

                <div class="info-group" v-if="isAutoRestore">
                    <h3>Estoque do prato</h3>
                    <p class="hint">
                        <span v-if="quantidadeFeita > 0">
                            {{ formatNumber(quantidadeFeita) }} unidade(s) deste prato ja tinham sido preparadas
                            nesta comanda e serao devolvidas ao estoque automaticamente.
                        </span>
                        <span v-else>
                            Nenhuma unidade deste prato tinha sido preparada ainda nesta comanda, entao nao ha
                            nada para devolver ao estoque.
                        </span>
                    </p>
                </div>

                <div class="info-group" v-if="isOther">
                    <h3>Estoque do prato</h3>
                    <label class="option-label">
                        <input type="checkbox" v-model="restoreToStock" />
                        <span>Devolver ao estoque a quantidade ja preparada deste prato</span>
                    </label>
                    <p class="hint" v-if="restoreToStock">
                        <span v-if="quantidadeFeita > 0">
                            {{ formatNumber(quantidadeFeita) }} unidade(s) serao devolvidas ao estoque.
                        </span>
                        <span v-else>
                            Nenhuma unidade deste prato tinha sido preparada ainda, entao nao ha nada para devolver.
                        </span>
                    </p>
                </div>

                <div class="info-group" v-if="isOutOfStock">
                    <h3>Estoque dos ingredientes</h3>

                    <p class="hint" v-if="ingredients.length">
                        Informe quanto <strong>ainda resta</strong> de cada ingrediente. O app usa esse saldo para
                        liberar ou bloquear o item em novas compras.
                    </p>
                    <p class="hint" v-else>
                        Este prato nao tem ingredientes cadastrados, entao nao ha estoque para ajustar. O
                        cancelamento sera registrado apenas com o motivo.
                    </p>

                    <div v-if="ingredients.length">
                        <label class="option-label">
                            <input type="checkbox" v-model="updateStock" />
                            <span>Atualizar o estoque com as quantidades informadas</span>
                        </label>

                        <div class="ingredient-list" :class="{ disabled: !updateStock }">
                            <div v-for="ingredient in ingredients" :key="ingredient.id" class="ingredient-row">
                                <div class="ingredient-name">
                                    <strong>{{ ingredient.nome }}</strong>
                                    <small>
                                        em estoque: {{ formatNumber(ingredient.quantidade_disponivel) }} {{ ingredient.unidade_medida }}
                                        &middot; consumo por unidade: {{ formatNumber(ingredient.quantidade_necessaria) }}
                                    </small>
                                </div>
                                <input
                                    type="number"
                                    class="input-form"
                                    min="0"
                                    step="0.001"
                                    :disabled="!updateStock"
                                    v-model="ingredient.nova_quantidade"
                                />
                            </div>
                        </div>

                        <button type="button" class="btn btn-gray mt-2" :disabled="!updateStock" @click="markUnavailable">
                            Zerar tudo (marcar item como indisponivel)
                        </button>

                        <div class="availability" :class="willBeUnavailable ? 'unavailable' : 'available'" v-if="updateStock">
                            <span v-if="willBeUnavailable">
                                Com essas quantidades o item <strong>ficara indisponivel</strong> para novas compras no app.
                            </span>
                            <span v-else>
                                Com essas quantidades o item <strong>continua disponivel</strong> no app
                                ({{ maxPortions }} unidade(s) ainda podem ser vendidas).
                            </span>
                        </div>
                    </div>
                </div>

                <div class="info-group">
                    <h3>Observacao (opcional)</h3>
                    <input type="text" class="input-form w-100" v-model="observation" placeholder="Detalhe o que aconteceu" maxlength="180" />
                </div>
            </div>

            <!-- ETAPA 3: confirmacao final, sempre -->
            <div v-else>
                <div class="info-group confirm-box" v-if="resolution === 'principal'">
                    <h3>Confirmar item separado</h3>
                    <p>
                        O item <strong>{{ item.nome }}</strong> da comanda <strong>#{{ item.id_comanda }}</strong>
                        vai para "Pronto" e o estoque dos ingredientes sera baixado.
                    </p>
                </div>

                <div class="info-group confirm-box" v-else-if="resolution === 'substituto'">
                    <h3>Confirmar substituição</h3>
                    <p>
                        <strong>{{ item.nome }}</strong> sera substituido por <strong>{{ selectedSubstituteName }}</strong>
                        na comanda <strong>#{{ item.id_comanda }}</strong>. O item original sera cancelado e o
                        substituto vai direto para "Pronto".
                    </p>
                    <p class="mt-2" v-if="loadingCandidates">Calculando diferença de preço...</p>
                    <p class="mt-2" v-else-if="selectedSubstituteRefund > 0">
                        <strong>R$ {{ selectedSubstituteRefund.toFixed(2) }}</strong> serao estornados ao cliente quando o pedido for entregue
                        (substituto mais barato que o original).
                    </p>
                    <p class="mt-2" v-else>Sem diferença a estornar (mesmo preço ou substituto sem preço menor).</p>
                </div>

                <div class="info-group confirm-box" v-else>
                    <h3>Confirme o cancelamento</h3>
                    <p>
                        O item <strong>{{ item.nome }}</strong> da comanda <strong>#{{ item.id_comanda }}</strong>
                        sera cancelado e sai da fila da cozinha. Essa acao nao pode ser desfeita.
                    </p>
                    <p class="mt-2"><strong>Motivo:</strong> {{ fullReason }}</p>

                    <p class="mt-2 warning" v-if="isLastDish">
                        Este e o ultimo item ativo da comanda: cancelar aqui cancela o pedido inteiro
                        e, se ja tiver sido pago, dispara o estorno automatico.
                    </p>

                    <div class="mt-2" v-if="stockChanges.length">
                        <strong>Estoque que sera alterado:</strong>
                        <ul>
                            <li v-for="change in stockChanges" :key="change.id">
                                {{ change.nome }}: {{ formatNumber(change.de) }} &rarr; {{ formatNumber(change.para) }} {{ change.unidade }}
                            </li>
                        </ul>
                        <p :class="willBeUnavailable ? 'warning' : ''">
                            <span v-if="willBeUnavailable">O item ficara indisponivel no app apos a confirmacao.</span>
                            <span v-else>O item continua disponivel no app.</span>
                        </p>
                    </div>
                    <p class="mt-2" v-else-if="willAutoRestoreDish">
                        <strong>Estoque do prato:</strong> {{ formatNumber(quantidadeFeita) }} unidade(s) ja
                        preparada(s) serao devolvidas ao estoque.
                    </p>
                    <p class="mt-2" v-else><strong>Estoque:</strong> nenhuma alteracao.</p>
                </div>
            </div>

            <button type="submit" id="submit-kitchen-resolve-hidden" style="display:none"></button>
        </form>
    </div>
</template>
<script>
import api from "../../../configs/api";
import $ from 'jquery';
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "resolveKitchenItemModalContent",
    props: ["orderid", "item", "initialresolution"],
    mixins: [globalMethods],
    data() {
        return {
            step: "choice",
            resolution: null,

            // substituto/similar
            substituteCandidates: [],
            selectedSubstituteId: this.item?.substituto?.id || null,
            loadingCandidates: false,

            // cancelar (fluxo existente)
            reasons: [],
            outOfStockReason: "",
            stockPolicy: {},
            quantidadeFeita: 0,
            restoreToStock: false,
            selectedReason: "",
            observation: "",
            aGranel: false,
            ingredients: [],
            updateStock: true,

            sending: false
        }
    },
    computed: {
        // 'especifico'/'similar' de vendas do app: mostra a opcao de substituto. Em
        // 'especifico' o substituto ja veio escolhido pelo cliente (item.substituto); em
        // 'similar' a cozinha escolhe agora (pick-substitute).
        showSubstituteChoice() {
            return Number(this.item?.from_app) === 1
                && ['especifico', 'similar'].includes(this.item?.preferencia_indisponivel);
        },
        selectedSubstituteName() {
            if (this.item?.substituto && this.item.substituto.id === this.selectedSubstituteId) {
                return this.item.substituto.nome;
            }

            const candidate = this.substituteCandidates.find((c) => c.id === this.selectedSubstituteId);
            return candidate?.name || "substituto";
        },
        selectedSubstituteRefund() {
            const candidate = this.substituteCandidates.find((c) => c.id === this.selectedSubstituteId);
            return Number(candidate?.refund_if_chosen) || 0;
        },
        isOutOfStock() {
            return this.selectedReason !== "" && this.selectedReason === this.outOfStockReason;
        },
        isAutoRestore() {
            return this.stockPolicy[this.selectedReason] === "devolver";
        },
        isOther() {
            return this.stockPolicy[this.selectedReason] === "perguntar";
        },
        willAutoRestoreDish() {
            return (this.isAutoRestore || (this.isOther && this.restoreToStock)) && this.quantidadeFeita > 0;
        },
        isLastDish() {
            return Number(this.item?.total_active_dishes || 0) <= 1;
        },
        fullReason() {
            const observation = (this.observation || "").trim();
            return observation ? `${this.selectedReason}: ${observation}` : this.selectedReason;
        },
        stockChanges() {
            if (!this.isOutOfStock || !this.updateStock) {
                return [];
            }

            return this.ingredients
                .map((ingredient) => ({
                    id: ingredient.id,
                    nome: ingredient.nome,
                    unidade: ingredient.unidade_medida,
                    de: Number(ingredient.quantidade_disponivel) || 0,
                    para: this.parseQuantity(ingredient.nova_quantidade)
                }))
                .filter((change) => change.para !== null && Math.abs(change.para - change.de) >= 0.0001);
        },
        maxPortions() {
            if (!this.ingredients.length) {
                return 0;
            }

            const portions = this.ingredients.map((ingredient) => {
                const current = Number(ingredient.quantidade_disponivel) || 0;
                const informed = this.parseQuantity(ingredient.nova_quantidade);
                const available = this.updateStock && informed !== null ? informed : current;
                const needed = Number(ingredient.quantidade_necessaria) || 0;

                if (this.aGranel || needed <= 0) {
                    return available > 0 ? Infinity : 0;
                }

                return Math.floor(available / needed);
            });

            const smallest = Math.min(...portions);
            return smallest === Infinity ? 1 : smallest;
        },
        willBeUnavailable() {
            return this.ingredients.length > 0 && this.maxPortions <= 0;
        }
    },
    methods: {
        formatNumber(value) {
            const number = Number(value) || 0;
            return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
        },
        parseQuantity(value) {
            if (value === "" || value === null || value === undefined) {
                return null;
            }

            const number = Number(String(value).replace(",", "."));
            return isNaN(number) || number < 0 ? null : number;
        },
        markUnavailable() {
            this.ingredients.forEach((ingredient) => { ingredient.nova_quantidade = 0; });
        },
        setSubmitLabel(label) {
            this.$emit("stepChange", label);

            // modal.vue desabilita e marca #modal-submit-button como "btn-loading" a cada
            // clique (submitInformations(), via v-on:click - o .off("click") do mounted()
            // so troca o listener jQuery, nao o listener do Vue). Sem isto, o botao fica
            // travado depois do primeiro clique de qualquer etapa.
            $("#modal-submit-button").removeAttr("disabled").removeClass("btn-loading");
        },
        choosePrincipal() {
            this.resolution = "principal";
            this.step = "confirm";
            this.setSubmitLabel("Confirmar");
        },
        chooseSubstituteFlow() {
            this.resolution = "substituto";

            // busca os candidatos sempre, mesmo com substituto pre-definido (especifico) -
            // e o que alimenta o valor do estorno mostrado na confirmacao.
            this.loadSubstituteCandidates();

            if (this.item?.substituto) {
                this.selectedSubstituteId = this.item.substituto.id;
                this.step = "confirm";
                this.setSubmitLabel("Confirmar substituição");
                return;
            }

            this.step = "pick-substitute";
            this.setSubmitLabel("Continuar");
        },
        chooseCancelFlow() {
            this.resolution = "cancelar";
            this.step = "form";
            this.setSubmitLabel("Continuar");
            this.getIngredients();
        },
        loadSubstituteCandidates() {
            this.loadingCandidates = true;

            api.get("/kitchen/orders/" + this.orderid + "/substitutes").then((response) => {
                this.substituteCandidates = response.data.returnObj || [];
            }).catch((error) => {
                this.substituteCandidates = [];
                this.setResponse(error.response?.data || "Nao foi possivel carregar os substitutos", "error");
            }).then(() => {
                this.loadingCandidates = false;
            });
        },
        getIngredients() {
            api.get("/kitchen/orders/" + this.orderid + "/ingredients").then((response) => {
                const data = response.data.returnObj || {};

                this.reasons = data.motivos || [];
                this.outOfStockReason = data.motivo_estoque || "";
                this.stockPolicy = data.stock_policy || {};
                this.quantidadeFeita = Number(data.quantidade_feita) || 0;
                this.aGranel = !!data.a_granel;
                this.ingredients = (data.ingredientes || []).map((ingredient) => ({
                    ...ingredient,
                    nova_quantidade: ingredient.quantidade_disponivel
                }));
            }).catch((error) => {
                this.setResponse(error.response?.data || "Nao foi possivel carregar os ingredientes do item", "error");
            });
        },
        handleSubmit() {
            if (this.step === "choice") {
                this.setResponse("Escolha uma das opções acima", "error");
                return;
            }

            if (this.step === "pick-substitute") {
                if (!this.selectedSubstituteId) {
                    this.setResponse("Escolha qual substituto foi separado", "error");
                    return;
                }

                this.resetResponse();
                this.step = "confirm";
                this.setSubmitLabel("Confirmar substituição");
                return;
            }

            if (this.step === "form") {
                this.goToConfirmation();
                return;
            }

            this.submitResolution();
        },
        goToConfirmation() {
            if (!this.selectedReason) {
                this.setResponse("Selecione o motivo do cancelamento", "error");
                return;
            }

            if (this.stockChanges.some((change) => change.para === null)) {
                this.setResponse("Informe uma quantidade valida para cada ingrediente", "error");
                return;
            }

            this.resetResponse();
            this.step = "confirm";
            this.setSubmitLabel("Confirmar cancelamento");
        },
        submitResolution() {
            if (this.sending) {
                return;
            }

            this.sending = true;

            const payload = { resolution: this.resolution };

            if (this.resolution === "substituto") {
                payload.substitute_id = this.selectedSubstituteId;
            }

            if (this.resolution === "cancelar") {
                payload.reason = this.selectedReason;
                payload.observation = (this.observation || "").trim();
                payload.stock_updates = this.stockChanges.map((change) => ({
                    id_ingrediente: change.id,
                    quantidade_disponivel: change.para
                }));
                payload.restore_to_stock = this.isOther ? this.restoreToStock : undefined;
            }

            api.post("/kitchen/orders/" + this.orderid + "/resolve", payload).then((response) => {
                this.setResponse(response.data, "success");
                this.$emit("savedContent");
            }).catch((error) => {
                this.sending = false;
                this.step = "choice";
                this.resolution = null;
                this.setSubmitLabel("Continuar");
                this.setResponse(error.response?.data || "Erro ao resolver o item", "error");
            });
        }
    },
    mounted: function () {
        $("#modal-submit-button").off("click").on("click", function () {
            $("#submit-kitchen-resolve-hidden").click();
        });

        // Atalho do botao CANCELAR no grid: pula direto pro fluxo de cancelamento,
        // sem passar pela etapa 1 (E, plan.md).
        if (this.initialresolution === "cancelar") {
            this.chooseCancelFlow();
        }
    }
}
</script>
<style scoped>
.resolve-kitchen-item-content {
    text-align: left;
}

.info-group {
    margin-bottom: 20px;
}

.choice-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    padding: 14px 16px;
    margin: 8px 0;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: #f7f7f7;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
}

.choice-btn:hover {
    background: #eee;
}

.choice-btn-danger {
    color: #8b1f18;
}

.choice-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
}

.candidate-list {
    display: grid;
    gap: 10px;
    margin-top: 10px;
}

.candidate-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 8px;
    border: 2px solid transparent;
    background: #f7f7f7;
    cursor: pointer;
}

.candidate-row.selected {
    border-color: #2e7d32;
}

.candidate-photo {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
}

.candidate-info p {
    margin: 2px 0 0;
    font-size: 0.85rem;
}

.candidate-refund {
    color: #2e7d32;
    font-weight: 600;
}

.option-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
    cursor: pointer;
}

.hint {
    font-size: 0.85rem;
    opacity: 0.85;
    margin-bottom: 10px;
}

.ingredient-list {
    margin-top: 10px;
}

.ingredient-list.disabled {
    opacity: 0.5;
}

.ingredient-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.ingredient-name {
    display: flex;
    flex-direction: column;
}

.ingredient-name small {
    font-size: 0.78rem;
    opacity: 0.75;
}

.ingredient-row input {
    width: 120px;
    text-align: right;
}

.availability {
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 0.88rem;
}

.availability.unavailable {
    background: #fdecea;
    border: 1px solid #f5c2c0;
    color: #8b1f18;
}

.availability.available {
    background: #eaf7ee;
    border: 1px solid #bfe3c9;
    color: #1e5c2f;
}

.confirm-box ul {
    margin: 8px 0 0 18px;
    list-style: disc;
}

.warning {
    color: #8b1f18;
    font-weight: 600;
}

.mt-2 {
    margin-top: 10px;
}

.w-100 {
    width: 100%;
}
</style>
