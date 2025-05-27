<template>
    <div class="shipping-config config-page">
        <div class="form-group">
            <label for="tax">Valor por KM</label>
            <input type="text" name="tax" id="tax" @input="inputMoneyCheck($event)" required>
        </div>
        <div class="map-container" v-if="mapLoaded">
            <mapComponent :radiuskm="config.radiuskm" :center="config.center" :blockmovement="true" @changerangevalue="newRadius = $event"></mapComponent>
        </div>
        <p class="response">{{ response }}</p>
        <div class="footer">
            <button type="submit" class="btn btn-primary" v-on:click="saveShippingConfig()">Salvar</button>
            <button type="button" class="btn btn-gray" v-on:click="cancel()">Cancelar</button>
        </div>
    </div>
</template>
<script>
import { globalMethods } from "@/js/globalMethods";
import api from "../../configs/api";
import $ from 'jquery';
import mapComponent from '../mapComponent.vue';

export default {
    name: "shippingConfig",
    mixins: [globalMethods],
    data() {
        return {
            config: {
                tax: "R$ 0,00",
                center: { lat: -25.427, lng: -49.273 },
                radiuskm: 5, // 5 km
            },
            mapLoaded: false,
            newRadius: 5
        }
    },
    methods: {
        saveShippingConfig: function () {
            let data = {
                tax: $("#tax").val(),
                radius: this.newRadius
            }

            let self = this;

            api.patch("/shipping/config", data).then(() => {
                self.setResponse("Informações atualizadas com sucesso", "success");
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        },
        returnShippingConfig: function () {
            let self = this;

            api.get("/shipping/config").then((response) => {
                self.config = response.data.returnObj;

                if (self.config.tax) {
                    $("#tax").val(self.formatCurrency(self.config.tax));
                }

                self.mapLoaded = true;
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        }
    },
    mounted: function () {
        this.returnShippingConfig();
    },
    components: {
        mapComponent
    }
}
</script>
<style scoped>
.map-container {
    margin-top: var(--space-6);
}
</style>