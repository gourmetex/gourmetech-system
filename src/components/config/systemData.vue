<template>
    <div class="system-data config-page">
        <form @submit.prevent="saveContent()" id="system-data-form">
            <div class="form-group">
                <label for="cep">Cep</label>
                <input type="text" name="cep" id="cep" @input="searchAddress()" placeholder="Ex. 00.000-000">
            </div>
            <div class="form-group">
                <label for="address">Endereço</label>
                <input type="text" name="endereco" id="address" maxlength="45">
            </div>
            <div class="form-group">
                <label for="numero">Número</label>
                <input type="number" name="numero" id="numero">
            </div>
            <div class="form-group">
                <label for="complement">Complemento</label>
                <input type="text" name="complemento" id="complement" maxlength="50">
            </div>
            <div class="footer">
                <button type="submit" class="btn btn-primary">Salvar</button>
                <button type="button" class="btn btn-gray" v-on:click="cancel()">Cancelar</button>
            </div>
        </form>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import { globalMethods } from '@/js/globalMethods';
import api from "../../configs/api.js";
import $ from 'jquery';
import Inputmask from "inputmask";

export default {
    name: "systemData",
    mixins: [globalMethods],
    data() {
        return {
        }
    },
    methods: {
        searchAddress: function () {
            if ($("#cep").val().indexOf("_") == -1) {
                this.searchCEP($("#cep").val()).then((results) => {
                    $("#address").val(results);
                })
            }
        },
        saveContent: function () {
            let self = this;

            let data = $("#system-data-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            api.patch("/companies", data).then(() => {
                self.setResponse("Informações atualizadas com sucesso", "success");
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        },
    },
    mounted: function () {
        Inputmask("99.999-999").mask(document.getElementById("cep"));

        $("#address").val(this.$root.company.endereco);
        $("#complement").val(this.$root.company.complemento);
        $("#cep").val(this.$root.company.cep);
        $("#numero").val(this.$root.company.numero);
    }
}
</script>
<style scoped>
</style>