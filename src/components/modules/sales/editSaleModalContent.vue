<template>
    <div class="edit-sale-modal-content">
        <form class="edit-sale" id="informations-form" @submit.prevent="saveSale()">
            <div class="form-group">
                <label for="nome">Nome da promoção</label>
                <input type="text" name="nome" v-model="sale.nome_promocao" required>
            </div>
            <div class="form-group">
                <label for="descricao">Descrição</label>
                <textarea name="descricao" v-model="sale.descricao"></textarea>
            </div>
            <div class="form-group">
                <label for="produto">Produto</label>
                <select id="produto" name="id_produto" v-model="sale.id_produto" required>
                    <option value="">* Selecione *</option>
                    <option :value="product.id" v-for="product in products" :key="product.id">{{ product.nome }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label for="dia_semana">Dia da semana</label>
                <select id="dia_semana" name="dia_semana" v-model="sale.dia_semana" required>
                    <option value="">* Selecione *</option>
                    <option :value="day.numero" v-for="day in weekDays" :key="day.numero">{{ day.nome }}</option>
                </select>
            </div>
            <div class="form-group">
                <label for="porcentagem_desconto">Porcentagem de desconto</label>
                <input type="number" name="porcentagem_desconto" id="porcentagem_desconto" v-model="sale.porcentagem_desconto" min="1" max="100" required>
            </div>
            <div class="radio-group">
                <input 
                    type="checkbox" 
                    id="ativa"
                    v-model="sale.ativa"
                    name="ativa"
                >
                <label for="ativa">Ativa</label>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
        <p class="response big">{{ response }}</p>
    </div>
</template>
<script>
import api from "../../../configs/api";
import { globalMethods } from "@/js/globalMethods";
import $ from 'jquery';

export default {
    name: "editSaleModalContent",
    mixins: [globalMethods],
    props: ["saleid"],
    data() {
        return {
            sale: {
                id_promocao: null,
                nome_promocao: "",
                id_produto: "",
                imagem_produto: "",
                preco_produto: null,
                dia_semana: "",
                descricao: "",
                porcentagem_desconto: ""
            },
            savingSale: false,
            products: [],
            weekDays: [
                {
                    numero: 1,
                    nome: "Domingo"
                },
                {
                    numero: 2,
                    nome: "Segunda-feira"
                },
                {
                    numero: 3,
                    nome: "Terça-feira"
                },
                {
                    numero: 4,
                    nome: "Quarta-feira"
                },
                {
                    numero: 5,
                    nome: "Quinta-feira"
                },
                {
                    numero: 6,
                    nome: "Sexta-feira"
                },
                {
                    numero: 7,
                    nome: "Sábado"
                }
            ]
        }
    },
    methods: {
        returnSale: function () {
            let self = this;

            if (self.saleid == null) {
                return;
            }

            api.get("/sales/" + self.saleid).then((response) => {
                self.sale = response.data.returnObj;
            }).catch((error) => {
                console.error(error);
            })
        },
        saveSale: function () {
            let self = this;

            if (self.savingSale) return;

            self.savingSale = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            let path = "create_sale";

            if (self.saleid != null) {
                path = "edit_sale/" + self.saleid;
            }

            api.post("/sales/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            }).then(() => {
                self.savingSale = false;
            })
        },
        returnProducts: function () {
            api.get("/products").then((response) => {
                this.products = response.data.returnObj;
            }).catch((error) => {
                console.error(error.response.data)
            })
        }
    },
    mounted: function () {
        this.returnSale();
        this.returnProducts();
    }
}
</script>
<style scoped></style>