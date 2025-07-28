<template>
    <div class="kitchen-component">
        <div class="page-title">
            <h1>Fila da cozinha</h1>
        </div>  
        <actionButtons add_text="FINALIZAR PRATO" exclude_text="CANCELAR PRATO" :disabledbuttons="disabledButtons" @add="finishDish()" @exclude="cancelDish()" />
        <div class="dishes-container">
            <dataTable :dataTable="orders" :rowsPerPage="7" searchText="" :loaded="contentLoaded">
                <template slot="column-id" slot-scope="props">
                    <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.id }}</p>
                </template>
                <template slot="column-comanda" slot-scope="props">
                    <p class="text-center">{{ props.item.id_comanda }}</p>
                </template>
                <template slot="column-mesa" slot-scope="props">
                    <p class="text-center">{{ props.item.mesa }}</p>
                </template>
                <template slot="column-prato" slot-scope="props">
                    <p>{{ props.item.nome }}</p>
                </template>
                <template slot="column-quantidade" slot-scope="props">
                    <p class="text-center">{{ props.item.quantidade_restante }}</p>
                </template>
                <template slot="column-observações" slot-scope="props">
                    <p>{{ props.item.observacoes }}</p>
                </template>
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
<style scoped>
</style>