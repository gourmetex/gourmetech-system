<template>
    <div class="delete-ingredient-quantity-modal-content">
        <form class="edit-roles" id="informations-form" @submit.prevent="saveStock()">
            <div class="form-group">
                <label for="ingredient">Item</label>
                <select id="ingredient" name="ingredient" v-model="selected_ingredient.id" required>
                    <option value="">* Selecione *</option>
                    <option v-for="(item, index) in ingredients" :key="index" :value="item.id">{{ item.nome }}</option>
                </select>
            </div>
            <div class="form-group">
                <label for="quantity">Quantidade {{ "(" +  selected_ingredient.unidade_medida + ")" }}</label>
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
    props: ["ingredient"],
    data() {
        return {
            quantity: "",
            savingStock: false,
            ingredients: [],
            selected_ingredient: {
                id: ""
            }
        }
    },
    methods: {
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

            api.post("/products/ingredients").then((response) => {
                self.ingredients = response.data.returnObj;
                self.selected_ingredient = self.ingredients.find((ingredient) => { return ingredient.id == self.ingredient });
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