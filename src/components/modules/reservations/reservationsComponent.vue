<template>
    <div class="reservations-component">
        <div class="page-title">
            <h1>Reservas</h1>
        </div>
        <actionButtons add_text="ADICIONAR RESERVA" exclude_text="EXCLUIR RESERVA" edit_text="EDITAR RESERVA"
            :disabledbuttons="disabledButtons" @add="createReservation()" @exclude="deleteReservation()"
            @edit="editReservation()" />
        <div class="reservations-container">
            <dataTable :dataobj="reservationsList" rowsperpage="7" searchText="item" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
                </grid-column>
                <grid-column prop="nome" label="Nome"></grid-column>
                <grid-column prop="data_reserva" label="Data e Hora"></grid-column>
                <grid-column prop="quantidade_pessoas" label="Qtd. Pessoas" align="center"></grid-column>
                <grid-column prop="status" label="Status"></grid-column>
                <grid-column prop="tipo" label="Ações" align="center" v-slot="props">
                    <button class="btn btn-primary rounded-btn small" @click="openReservations(props.item.id)"
                        title="Abrir mesa">
                        <span class="material-icons"
                            style="color: var(--white); font-size: var(--fontsize-sm);">open_in_new</span>
                    </button>
                </grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1"
            :excludepath="'/reservations/' + editId" :modalbutton2="modalButton2" :modalButton3="modalButton3"
            @closeModal="closeModalFunction(); returnReservations();">
            <editReservationModalContent v-if="showEditReservationModalContent" :reservationid="editId"
                @savedContent="closeModalFunction(); returnReservations();"></editReservationModalContent>
        </modal>
    </div>
</template>
<script>
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import editReservationModalContent from "./editReservationModalContent.vue";
import modal from "../../modal.vue";
import api from "../../../configs/api";

export default {
    name: "reservationsComponent",
    mixins: [globalMethods],
    data() {
        return {
            gridOptions: [],
            reservationsList: [],
            showEditReservationModalContent: false
        }
    },
    methods: {
        openReservations: function (reservation_id) {
            let self = this;
            api.post("/reservations/open_reservation", { reservation_id: parseInt(reservation_id) }).then(() => {
                self.$router.push("/home/digital_menu");
            })
        },
        resetModalContents: function () {
            this.showEditReservationModalContent = false;
        },
        createReservation: function () {
            this.resetModalContents();
            this.showModalFunction("Adicionar reserva", "Adicionar", "Cancelar");
            this.showEditReservationModalContent = true;
            this.editId = null;
        },
        deleteReservation: function () {
            this.resetModalContents();
            this.showModalFunction("Excluir reserva", "Excluir", "Cancelar");
        },
        editReservation: function () {
            this.resetModalContents();
            this.showModalFunction("Editar reserva", "Salvar", "Cancelar");
            this.showEditReservationModalContent = true;
        },
        returnReservations: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/reservations").then((response) => {
                self.reservationsList = response.data.returnObj;
                self.contentLoaded = true;
            })
        }
    },
    mounted: function () {
        this.returnReservations();
        this.disableActionsButtons(false, true, true);
    },
    components: {
        actionButtons,
        dataTable,
        modal,
        editReservationModalContent
    }
}
</script>
<style scoped></style>