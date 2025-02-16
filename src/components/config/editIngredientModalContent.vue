<template>
    <div class="edit-ingredient-modal-content">
        <form class="edit-ingredient" id="informations-form" @submit.prevent="saveRole()">
            <div class="form-group">
                <label for="name">Nome do ingrediente</label>
                <input type="text" name="name" id="name" v-model="ingredient.nome" required>
            </div>
            <div class="form-group">
                <label for="category">Categoria</label>
                <select name="category" id="category" v-model="ingredient.categoria" required>
                    <option value="">Escolha uma opção</option>
                    <option v-for="(category, index) in ingredients_categories" :key="index" :value="category.id">{{ category.nome }}</option>
                </select>
            </div>
            <div class="form-group">
                <label for="measurement">Unidade de medida</label>
                <select name="measurement" id="measurement" v-model="ingredient.unidade_medida" required>
                    <option value="">Escolha uma opção</option>
                    <option v-for="(unity, index) in unity_measurement" :key="index" :value="unity.id">{{ unity.nome }}</option>
                </select>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import api from "../../configs/api";
import $ from 'jquery';

export default {
    name: "editIngredientModalContent",
    props: ["ingredientid"],
    data() {
        return {
            ingredient: {
                id: 0,
                nome: "",
                categoria: "",
                unidade_medida: ""
            },
            unity_measurement: [],
            ingredients_categories: [],
            savingIngredient: false
        }
    },
    methods: {
        saveRole: function () {
            let self = this;

            if (self.savingIngredient) return;

            self.savingIngredient = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["id"] = self.ingredientid;

            let path = "create_ingredient";

            if (self.ingredient.id != 0) {
                path = "edit_ingredient";
            }

            api.post("/products/ingredients/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.savingIngredient = false;
            })
        },
        returnIngredient: function () {
            let self = this;
            
            if (self.ingredientid == 0 || self.ingredientid == null) return;

            api.get("/products/ingredients/" + self.ingredientid).then((response) => {
                self.ingredient = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnIngredientsCategories: function () {
            let self = this;

            api.get("/products/ingredient_categories").then((response) => {
                self.ingredients_categories = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnUnitiesOfMeasurement: function () {
            let self = this;

            api.get("/products/unities_of_measurement").then((response) => {
                self.unity_measurement = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnUnitiesOfMeasurement();
        this.returnIngredientsCategories();
        this.returnIngredient();
    }
}
</script>
<style scoped>
</style>