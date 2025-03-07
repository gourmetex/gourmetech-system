<template>
    <div class="inner-modal-content">
        <form class="add-order" id="informations-form" @submit.prevent="saveOrder()">
            <input type="hidden" id="submit_type" value="save">
            <div class="form-group-horizontal inputs-50">
                <div class="form-group" v-if="checkModulePermission('digital_menu')">
                    <label for="mesa">Mesa vinculada</label>
                    <input type="number" name="mesa" id="mesa" v-model="order.mesa">
                </div>
                <div class="form-group" :style="checkModulePermission('digital_menu') ? '' : 'width: 100%'">
                    <label for="id_cliente">Nome do cliente</label>
                    <ajaxAutoComplete @select="setCustomer($event)" ajaxtype="clientes" :entityid="order.id_cliente" :entityname="order.nome_cliente" :required="true" />
                </div>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
        <div class="order-dishes-container">
            <h3>Itens do pedido</h3>
            <div class="modal-edit-grid">
                <dataTable :dataTable="order.dishes" :rowsPerPage="2" searchText="" :loaded="contentLoaded">
                    <template slot="column-cód-do-item" slot-scope="props">
                        <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.id }}</p>
                    </template>
                    <template slot="column-nome-do-item" slot-scope="props">
                        <p>{{ props.item.nome }}</p>
                    </template>
                    <template slot="column-qtd" slot-scope="props">
                        <p class="text-center">{{ props.item.quantidade }}</p>
                    </template>
                    <template slot="column-obs" slot-scope="props">
                        <p>{{ props.item.observacoes }}</p>
                    </template>
                    <template slot="column-valor-do-item" slot-scope="props">
                        <p>{{ props.item.preco }}</p>
                    </template>
                    <template slot="column-status" slot-scope="props">
                        <p>{{ props.item.status }}</p>
                    </template>
                </dataTable>
                <div class="edit-buttons buttons-vertical">
                    <button type="button" class="rounded-btn btn-primary" v-on:click="addDish()">
                        <span class="material-icons">add</span>
                    </button>
                    <div class="dynamic-edit-buttons">
                        <button type="button" class="rounded-btn btn-red" v-on:click="excludeDish()">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="order-submit-informations" v-if="payment != false">
            <div class="payment">
                <div class="payment-inner">
                    <button class="btn btn-primary" v-on:click="openPaymentModal()">Pagamento</button>
                    <div class="payment-list">
                        <h3>Pix: {{ pix_payment }}</h3>
                        <h3>Cartão: {{ card_payment }}</h3>
                        <h3>Dinheiro: {{ cash_payment }}</h3>
                    </div>
                    <div class="payment-difference">
                        <h3>Desconto: {{ total_desconto }}</h3>
                        <h3 class="font-bold">Restante: {{ difference }}</h3>
                        <h3 class="font-bold" v-if="checkModulePermission('shipping')">Entrega: {{ delivery_amount }}</h3>
                    </div>
                </div>
                <h2 class="order-total">{{ order.total }}</h2>
            </div>
            <div class="delivery" v-if="checkModulePermission('shipping') && false">
                <button class="btn btn-blue">Entrega</button>
                <div class="delivery-content">
                    <div class="delivery-texts">
                        <h3>Rua Brasholanda, 556 - Weissópolis, Pinhais</h3>
                        <h3>Cep: 86930-000</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="small-modal" id="modal-dishes">
            <form class="add-dish" id="informations-form" @submit.prevent="submitAddDish()">
                <div class="form-group">
                    <label for="item">Item</label>
                    <select name="item" id="item" required>
                        <option value="">* Selecione *</option>
                        <option :value="item.id" v-for="(item, index) in dishes_list" :key="index">{{ item.nome }} {{ item.disponivel == 1 ? "" : "(Indisponível)" }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="quantidade">Quantidade</label>
                    <input type="number" name="quantidade" v-model="quantity" id="quantidade" required>
                </div>
                <div class="form-group">
                    <label for="observacoes">Observações</label>
                    <input type="text" name="observacoes" v-model="observations" id="observacoes">
                </div>
                <button type="submit" class="btn btn-primary w-100">Salvar</button>
            </form>
        </div>
        <div class="small-modal" id="modal-payment">
            <form class="add-payment" id="informations-form" @submit.prevent="submitAddPayment()">
                <div class="form-group">
                    <label for="metodo_pagamento">Método de pagamento</label>
                    <select name="metodo_pagamento" id="metodo_pagamento" required>
                        <option value="">* Selecione *</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="pix">Pix</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="valor_pago">Valor pago</label>
                    <input type="text" name="valor_pago" id="quantidade" v-model="amount_payed" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Adicionar</button>
            </form>
        </div>
        <div class="small-modal-wrapper" v-on:click="closeSmallModal()"></div>
        <p class="response big">{{ response }}</p>
    </div>
</template>
<script>
import api from "../../../configs/api";
import { globalMethods } from "@/js/globalMethods";
import $ from 'jquery';
import dataTable from "../../dataTable.vue";
import ajaxAutoComplete from "../../ajaxAutoComplete.vue";

export default {
    name: "editOrderModalContent",
    mixins: [globalMethods],
    props: ["orderid", "payment"],
    data() {
        return {
            savingOrder: false,
            order: {
                dishes: [],
                total: "R$ 0,00",
                nome_cliente: "",
                id_cliente: "",
                cep_entrega: "",
                mesa: ""
            },
            dishes_list: [],
            selected_dish: [],
            quantity: null,
            order_total: null,
            observations: "",
            delivery_amount: "R$ 0",
            card_payment: "R$ 0",
            cash_payment: "R$ 0",
            pix_payment: "R$ 0",
            amount_payed: "R$ 0",
            accumulatedQuantity: 0,
            cliente_nome: "",
            cliente_id: "",
            cliente_desconto: 0,
            total_desconto: "R$ 0",
            frozen_table: null
        }
    },
    computed: {
        total_amout() {
            let total = (this.formatDecimalValues(this.card_payment) + this.formatDecimalValues(this.cash_payment) + this.formatDecimalValues(this.pix_payment));
            return total;
        },
        difference() {
            let order_total = this.formatDecimalValues(this.order.total);
            let difference = order_total - this.total_amout;

            return difference.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        }
    },
    watch: {
        order_total: function () {
            this.calculateOrderTotal();
        },
        amount_payed: function () {
            var valor = this.amount_payed.replace(/\D/g, '');
            
            var valorNumerico = parseInt(valor) / 100;

            var valorFormatado = valorNumerico.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            this.amount_payed = valorFormatado;
        }
    },
    methods: {
        calculateOrderTotal: function () {
            let total = this.order_total;
            let desconto = ((parseInt(this.cliente_desconto) / 100) * total).toFixed(2);
            let totalWithDiscount = total - desconto;

            this.total_desconto = this.formatCurrency(desconto);
            this.order.total = this.formatCurrency(totalWithDiscount);
        },
        setCustomer: function (event) {
            this.cliente_desconto = event.porcentagem_desconto != undefined && event.porcentagem_desconto != "" ? event.porcentagem_desconto.replace("%", "") : 0;
            this.cliente_nome = event.nome;
            this.cliente_id = event.id;
            this.calculateOrderTotal();
        },
        openPaymentModal: function () {
            this.openSmallModal("#modal-payment");
        },
        addDish: function () {
            this.openSmallModal("#modal-dishes");
        },
        excludeDish: function () {
            let self = this;
            
            let excludedDish = self.order.dishes.find(obj => obj.id == self.editId);

            self.order.dishes = self.order.dishes.filter(obj => obj.id !== self.editId);
            let item_value = (this.formatDecimalValues(excludedDish.preco) * parseFloat(excludedDish.quantidade));

            this.order_total -= item_value;
            this.editId = null;

            this.closeSmallModal();
        },
        reorganizeDishesObservations: function () {
            for (let i = 0; i < this.order.dishes.length; i++) {
                this.order.dishes[i].observacoes = this.groupObservations(this.order.dishes[i].observacoes);
            }
        },
        submitAddDish: function () {
            let self = this;

            this.selectThisDish();
            this.resetResponse();
            
            if (this.quantity == 0 || this.selected_dish.disponivel != 1) {
                this.disposeSelectedDishAndCloseSmallModal();
                return;
            }

            let sameDish = this.order.dishes.filter(dish => dish.id == this.selected_dish.id);
            let dishObservations = sameDish.length > 0 ? sameDish[0].observacoes : null;
            
            if (dishObservations != null && dishObservations.trim() != "") {
                dishObservations += ", " + this.observations;
            } else {
                for (let i = 0; i < parseInt(this.quantity); i++) {
                    if (i == 0) {
                        dishObservations = this.observations;
                    } else {
                        dishObservations += ", " + this.observations;
                    }
                }
            }

            let gridDishObservations = this.groupObservations(dishObservations); 

            let newDishGrid = {
                id: this.selected_dish.id,
                nome: this.selected_dish.nome,
                quantidade: this.quantity,
                observacoes: gridDishObservations,
                preco: this.selected_dish.preco,
                status: "Preparando"
            }

            let selectedDishHaveInGrid = this.order.dishes.some(obj => obj.id == this.selected_dish.id);

            let accumulatedQuantity = this.quantity;

            if (this.order.dishes.length != 0 && selectedDishHaveInGrid) {
                this.order.dishes.map(obj => {
                    if (obj.id == this.selected_dish.id) {
                        accumulatedQuantity = (parseInt(obj.quantidade) + parseInt(this.quantity)).toString();
                    }
                })
            }

            let data = {
                id: this.selected_dish.id,
                quantidade: accumulatedQuantity
            }

            api.post("/products/quantity_avalilable", data).then(() => {
                if (self.order.dishes.length == 0 || !selectedDishHaveInGrid) {
                    self.order.dishes.push(newDishGrid);
                } else {
                    self.order.dishes.map(obj => {
                        if (obj.id == this.selected_dish.id) {
                            obj.quantidade = accumulatedQuantity;
                            obj.observacoes = gridDishObservations;
                        }
                    })

                    self.order.dishes.push({});
                    self.order.dishes.pop();
                }

                let total_value = (self.formatDecimalValues(newDishGrid.preco) * parseFloat(self.quantity));
                self.order_total += total_value;

                self.observations = "";
            }).catch((error) => {
                this.setResponse(error.response.data, "error");
            }).then(() => {
                this.disposeSelectedDishAndCloseSmallModal();
            })
        },
        disposeSelectedDishAndCloseSmallModal: function () {
            this.selected_dish = {};
            this.quantity = null;

            this.closeSmallModal();
        },  
        submitAddPayment: function () {
            let metodoPagamento = $("#metodo_pagamento").val();
            let amountPayed = this.amount_payed;

            switch (metodoPagamento) {
                case "dinheiro": 
                    this.cash_payment = amountPayed;
                    break;
                case "cartao":
                    this.card_payment = amountPayed;
                    break;
                case "pix":
                    this.pix_payment = amountPayed;
                    break;
            }

            this.amount_payed = "R$ 0";
            this.closeSmallModal();
        },
        selectThisDish: function () {
            let value = $("#item").val();

            let dish = this.dishes_list.find(obj => obj.id == parseInt(value));

            if (dish != undefined && dish != null) {
                this.selected_dish = dish;
            } else {
                this.selected_dish = {};
            }
        },
        saveOrder: function () {
            let self = this;
            if (self.savingOrder) return;

            let promises = [];

            this.resetResponse();

            let validTable = false;
            
            if (self.order.mesa != null) {
                promises.push(
                    api.get("/tables/valid_table/" + self.order.mesa).then((response) => {
                        if (response.data.returnObj || self.payment != false && self.order.mesa == "") {
                            validTable = true;
                        }
                    })
                )
            } else {
                promises.push(
                    new Promise((resolve) => {
                        resolve();
                    })
                )
            }
            
            let sameTable = self.frozen_table == self.order.mesa ? true : false;

            Promise.all(promises).then(() => {
                if (this.order.status == "Cancelado" || this.order.status == "Finalizado") {
                    self.$emit("savedContent", true);
                    return;
                }

                if (!validTable && !sameTable) {
                    this.setResponse("Número da mesa não existe ou ja está em uso", "error");
                    return;
                }

                if (this.order.dishes.length == 0) {
                    this.setResponse("O pedido não pode estar vazio", "error");
                    return;
                }

                if ($("#submit_type").val() == "finish" && this.formatDecimalValues(this.difference) != 0) {
                    this.setResponse("O pedido possui valor em aberto", "error");
                    return;
                }

                if ($(".ajax-autocomplete").attr("invalid") == "true") {
                    this.setResponse("Campo cliente não pode ser vazio", "error");
                    return;
                }

                self.savingOrder = true;

                let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                    obj[item.name] = item.value;
                    return obj;
                }, {});

                data["pratos"] = self.order.dishes;
                data["pagamento_pix"] = this.pix_payment;
                data["pagamento_cartao"] = this.card_payment;
                data["pagamento_dinheiro"] = this.cash_payment;
                data["cep_entrega"] = parseInt(this.order.cep_entrega);
                data["mesa"] = this.order.mesa == "" ? null : parseInt(this.order.mesa);
                data["save_type"] = $("#submit_type").val();
                data["cliente_nome"] = this.cliente_nome != null ? this.cliente_nome : $("#ajax-autocomplete-input").val();
                data["cliente_id"] = this.cliente_id;

                let path = "new_order";

                if (self.orderid != null) {
                    path = "edit_order/" + self.orderid;
                }

                api.post("/orders/" + path, data).then(() => {
                    self.$emit("savedContent", true);
                }).catch((error) => {
                    console.log(error);
                }).then(() => {
                    self.savingOrder = false;
                })
            })
        },
        returnAllDishes: function () {
            let self = this;

            api.get("/products").then((response) => {
                self.dishes_list = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnOrder: function () {
            let self = this;

            if (self.orderid == null) {
                self.contentLoaded = true;
                self.order.dishes = [];
                return;
            } 

            self.contentLoaded = false;

            api.get("/orders/" + self.orderid).then((response) => {
                self.contentLoaded = true;
                
                self.order = response.data.returnObj;

                self.order_total = self.order.total == null ? 0.0 : self.formatDecimalValues(self.order.total);
                self.pix_payment = self.formatCurrency(self.order.pagamento_pix);
                self.card_payment = self.formatCurrency(self.order.pagamento_cartao);
                self.cash_payment = self.formatCurrency(self.order.pagamento_dinheiro);
                self.cliente_nome = self.order.nome_cliente;
                self.cliente_id = self.order.id_cliente;
                self.cliente_desconto = self.order.porcentagem_desconto;

                let originalObj = self.order;
                let frozenObj = JSON.parse(JSON.stringify(originalObj));

                Object.freeze(frozenObj);

                self.frozen_table = frozenObj.mesa == '' ? null : frozenObj.mesa;

                self.calculateOrderTotal();
                self.reorganizeDishesObservations();
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnAllDishes();
        this.returnOrder();   
        
        if (this.payment == false) {
            $("#mesa").attr("required", "required");
        }
    },
    components: {
        dataTable,
        ajaxAutoComplete
    }
}
</script>
<style scoped>
.payment, .payment-inner, .delivery {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.delivery, .payment-inner {
    justify-content: flex-start;
    margin: var(--space-5) 0;
}

.modal-body .custom-grid-container {
    max-height: 160px;
}
.delivery-content, .payment-list, .payment-difference {
    margin: 0 var(--space-5);
}
</style>