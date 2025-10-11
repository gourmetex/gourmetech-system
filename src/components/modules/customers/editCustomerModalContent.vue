<template>
    <div class="edit-customer-modal-content">
        <form class="edit-customer" id="informations-form" @submit.prevent="saveCustomer()">
            <div class="form-group">
                <label for="nome">Nome do cliente</label>
                <input type="text" name="nome" v-model="customer.nome" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" v-model="customer.email" placeholder="Ex. cliente@dominio.com.br" required>
            </div>
            <div class="form-group">
                <label for="telefone">Telefone</label>
                <input type="text" name="telefone" id="telefone" v-model="customer.telefone" @focusout="inputTelCheck($event)" required>
            </div>
            <div class="form-group">
                <label for="cpfCnpj">CPF/CNPJ</label>
                <input type="text" name="cpfCnpj" id="cpfCnpj" @keypress="formatCpfCnpj($event)" required>
            </div>
            <div class="radio-group">
                <input type="checkbox" id="especial" v-model="customer.especial">
                <label for="especial">Cliente especial</label>
            </div>
            <div class="form-group" v-if="customer.especial">
                <label for="porcentagem_desconto">Porcentagem do desconto (%)</label>
                <input type="number" name="porcentagem_desconto" id="porcentagem_desconto" v-model="customer.porcentagem_desconto" required>
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
    name: "editCustomerModalContent",
    mixins: [globalMethods],
    props: ["customerid"],
    data() {
        return {
            customer: {
                nome: "",
                email: "",
                telefone: "",
                cpfCnpj: "",
                especial: false,
                porcentagem_desconto: null
            },
            savingCustomer: false
        }
    },
    methods: {
        returnCustomer: function () {
            let self = this;

            if (self.customerid == null) {
                return;
            } 

            api.get("/customers/" + self.customerid).then((response) => {
                self.customer = response.data.returnObj;
                $("#cpfCnpj").val(self.customer.cpfCnpj);
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        },
        saveCustomer: function () {
            let self = this;

            if (self.savingCustomer) return;

            self.savingCustomer = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["telefone"] = self.formatTelToSubmit($("#telefone").val());

            let path = "new_customer";

            if (self.customerid != null) {
                path = "edit_customer/" + self.customerid;
            }

            api.post("/customers/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            }).then(() => {
                self.savingCustomer = false;
            })
        }
    },
    mounted: function () {
        this.returnCustomer();        
    }
}
</script>
<style scoped>
</style>