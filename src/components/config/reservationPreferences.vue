<template>
    <div class="reservations config-page">
        <div class="panel">
            <form id="reservation-preferences" @submit.prevent="saveContent()">
                <div class="preferences-group" datalabel="automatic_preferences">
                    <h3 class="preference-title">Reservas abrem mesa automaticamente ao chegar na data e horário da reserva?</h3>
                    <div class="radio-group">
                        <input type="radio" name="automatic_reservation" value="reserva_manual" id="manual-reservation">
                        <label for="manual-reservation">Manual</label>
                    </div>
                    <div class="radio-group">
                        <input type="radio" name="automatic_reservation" value="reserva_automatica" id="automatic-reservation">
                        <label for="automatic-reservation">Automático</label>
                    </div>
                </div>
                <div class="footer">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-gray" v-on:click="cancel()">Cancelar</button>
                </div>
            </form>
        </div>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import { globalMethods } from "@/js/globalMethods";
import $ from 'jquery';
import api from "../../configs/api";

export default {
    name: "financialConfig",
    mixins: [globalMethods],
    data() {
        return {
        }
    },
    methods: {
        saveContent: function () {
            let self = this;

            let data = $("#reservation-preferences").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            api.post("/reservations/preferences", data).then(() => {
                self.setResponse("Preferências atualizadas com sucesso", "success");
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        },
        returnPreferences: function () {
            let self = this;

            api.get("/reservations/preferences").then((results) => {
                self.preferences = results.data.returnObj;
                self.loadPreferences();
            })
        }
    },
    mounted: function () {
        this.returnPreferences();
    },
    components: {
        
    }
}
</script>
<style scoped>
</style>