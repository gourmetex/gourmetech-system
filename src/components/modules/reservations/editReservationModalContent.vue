<template>
    <div class="edit-reservation-modal-content">
        <form class="edit-customer" id="informations-form" @submit.prevent="saveReservation()">
            <div class="form-group">
                <label for="nome">Está no nome de</label>
                <input type="text" name="nome" v-model="reservation.nome" placeholder="Ex. João" maxlength="45" required>
            </div>
            <div class="form-group">
                <label for="quantidade_pessoas">Quantidade de pessoas</label>
                <input type="number" name="quantidade_pessoas" id="quantidade_pessoas" v-model="reservation.quantidade_pessoas" required>
            </div>
            <div class="form-group">
                <label for="data_reserva">Data</label>
                <input type="datetime-local" name="data_reserva" id="data_reserva" v-model="reservation.data_reserva" required>
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
    name: "editReservationModalContent",
    mixins: [globalMethods],
    props: ["reservationid"],
    data() {
        return {
            reservation: {
                nome: "",
                quantidade: null,
                data: null
            },
            savingReservation: false
        }
    },
    methods: {
        returnReservation: function () {
            let self = this;

            if (self.reservationid == null) {
                return;
            } 

            api.get("/reservations/return_reservation/" + self.reservationid).then((response) => {
                self.reservation = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
        saveReservation: function () {
            let self = this;

            if (self.savingReservation) return;

            self.savingReservation = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            let path = "new_reservation";

            if (self.reservationid != null) {
                path = "edit_reservation/" + self.reservationid;
            }

            api.post("/reservations/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.savingCustomer = false;
            })
        }
    },
    mounted: function () {
        this.returnReservation();        
    }
}
</script>
<style scoped>
</style>