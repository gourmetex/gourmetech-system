<template>
    <div class="delete-ingredient-quantity-modal-content">
        <form class="edit-roles" id="informations-form" @submit.prevent="saveStock()">
            <div class="form-group">
                <label for="ingredient">Item</label>
                <select id="ingredient" name="ingredient" @change="selectThisIngredient()" required>
                    <option value="">Qualquer</option>
                    <option v-for="(item, index) in ingredients" :key="index" :value="item.id[1]">{{ item.nome[1] }}</option>
                </select>
            </div>
            <div class="radio-group">
                <label for="quantity">Quantidade {{ selected_ingredient_measure_unit != "" ? `(${selected_ingredient_measure_unit})` : "" }}</label>
                <input type="text" name="quantity" id="quantity" required v-model="quantity" @keypress="formatDecimalValues(quantity)">
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import api from "../../../configs/api";
import { globalMethods } from "@/js/globalMethods";
import $ from 'jquery';

export default {
    name: "addIngredientQuantityModalContent",
    mixins: [globalMethods],
    data() {
        return {
            quantity: "",
            savingStock: false,
            ingredients: [],
            selected_ingredient_measure_unit: "",
            selected_ingredient: {}
        }
    },
    methods: {
        selectThisIngredient: function () {
            let value = $("#ingredient").val();
            let ingredient = this.ingredients.find(obj => obj.id[1] == value);

            if (ingredient != undefined && ingredient != null) {
                this.selected_ingredient = ingredient;
                this.selected_ingredient_measure_unit = ingredient.unidade_medida[1];
            } else {
                this.selected_ingredient = {};
                this.selected_ingredient_measure_unit = "";
            }
        },
        saveStock: function () {
            let self = this;

            if (self.savingStock) return;

            self.savingStock = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            api.post("/stock/remove_ingredient_quantity", data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.savingStock = false;
            })
        },
        returnAllIngredients: function () {
            let self = this;

            api.post("/dishes/ingredients").then((response) => {
                self.ingredients = response.data.returnObj.ingredients;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnAllIngredients();
    }
}
</script>
<style scoped>
</style>