<template>
    <div class="kitchen-component">
        <div class="page-title">
            <h1>Fila da cozinha</h1>
        </div>
        <actionButtons add_text="FINALIZAR PRATO" exclude_text="CANCELAR PRATO" :disabledbuttons="disabledButtons"
            @add="finishDish()" @exclude="cancelDish()" />
        <div class="dishes-container">
            <dataTable :dataobj="orders" rowsperpage="7" searchText="" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
                </grid-column>
                <grid-column prop="id_comanda" label="Comanda" align="center"></grid-column>
                <grid-column prop="mesa" label="Mesa" align="center"></grid-column>
                <grid-column prop="nome" label="Prato"></grid-column>
                <grid-column prop="quantidade_restante" label="Quantidade" align="center"></grid-column>
                <grid-column prop="observacoes" label="Observações"></grid-column>
            </dataTable>
        </div>
    </div>
</template>
<script>
import api from "../../../configs/api";
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "kitchenComponent",
    mixins: [globalMethods],
    data() {
        return {
            orders: []
        }
    },
    watch: {
        editId: function () {
            if (this.editId == null) {
                this.disableActionsButtons(true, true, true);
            }
        }
    },
    methods: {
        cancelDish: function () {
            let self = this;

            api.delete("/kitchen/orders/" + self.editId).then(() => {
                self.returnDishes();
                self.editId = null;
            }).catch((error) => {
                console.log(error);
            })
        },
        finishDish: function () {
            let self = this;

            api.post("/kitchen/orders/" + self.editId).then(() => {
                self.returnDishes();
                self.editId = null;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnDishes: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/kitchen/orders").then((response) => {
                self.orders = response.data.returnObj;
                self.contentLoaded = true;
                self.reorganizeDishesObservations();
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                setTimeout(() => {
                    self.returnDishes();
                }, 60 * 1000)
            })
        },
        reorganizeDishesObservations: function () {
            for (let i = 0; i < this.orders.length; i++) {
                this.orders[i].observacoes = this.groupObservations(this.orders[i].observacoes);
            }
        }
    },
    mounted: function () {
        this.returnDishes();
        this.disableActionsButtons(true, true, true);
    },
    components: {
        actionButtons,
        dataTable
    }
}
</script>
<style scoped></style>