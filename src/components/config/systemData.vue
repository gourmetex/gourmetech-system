<template>
    <div class="system-data config-page">
        <form @submit.prevent="saveContent()" id="system-data-form">
            <div class="form-group">
                <label for="cep">Cep</label>
                <input type="text" name="cep" id="cep" @input="searchAddress($event)" placeholder="Ex. 00000-000" maxlength="9" inputmode="numeric">
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
            <div class="form-group">
                <label>Localização no mapa</label>
                <p>Se o endereço não for localizado automaticamente, arraste o pino até o local correto.</p>
                <mapComponent :center="location" :blockmovement="false" :showradius="false" @changecenter="setLocation"></mapComponent>
                <input type="hidden" name="latitude" :value="manualLocation ? location.lat : ''">
                <input type="hidden" name="longitude" :value="manualLocation ? location.lng : ''">
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
import mapComponent from '../mapComponent.vue';

export default {
    name: "systemData",
    mixins: [globalMethods],
    components: { mapComponent },
    data() {
        return {
            response: "",
            location: { lat: -25.427, lng: -49.273 },
            manualLocation: false
        }
    },
    methods: {
        formatCEP: function (value) {
            const cep = String(value || "").replace(/\D/g, "").slice(0, 8);

            return cep.length > 5 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;
        },
        setLocation: function (location) {
            this.location = { lat: Number(location.lat), lng: Number(location.lng) };
            this.manualLocation = true;
        },
        searchAddress: function (event) {
            const formattedCEP = this.formatCEP(event.target.value);
            const cep = formattedCEP.replace(/\D/g, '');

            if (event.target.value !== formattedCEP) {
                event.target.value = formattedCEP;
            }

            if (!cep.length) {
                this.resetResponse();
                return;
            }

            if (cep.length !== 8) {
                this.resetResponse();
                return;
            }

            this.searchCEP(cep).then((results) => {
                $("#address").val(results);
                this.resetResponse();
                this.geocodeApproximate(results).then(location => {
                    if (location) this.location = location;
                });
            }).catch(() => {
                $("#address").val("");
                this.setResponse("CEP inválido ou não encontrado.", "error");
            });
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
                self.setResponse(error.response?.data || "Não foi possível salvar as informações da empresa.", "error");
            })
        },
    },
    mounted: function () {
        $("#address").val(this.$root.company.endereco);
        $("#complement").val(this.$root.company.complemento);
        $("#cep").val(this.formatCEP(this.$root.company.cep));
        $("#numero").val(this.$root.company.numero);
        this.location = {
            lat: Number(this.$root.company.latitude) || -25.427,
            lng: Number(this.$root.company.longitude) || -49.273
        };
        this.manualLocation = this.$root.company.latitude !== null && this.$root.company.latitude !== "" &&
            this.$root.company.longitude !== null && this.$root.company.longitude !== "" &&
            Number.isFinite(Number(this.$root.company.latitude)) && Number.isFinite(Number(this.$root.company.longitude));
    }
}
</script>
<style scoped>
</style>
