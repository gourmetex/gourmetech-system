<template>
    <div class="edit-ingredient-modal-content">
        <form class="edit-ingredient" id="informations-form" @submit.prevent="saveRole()">
            <div class="form-group">
                <label for="name">Nome do componente</label>
                <input type="text" name="name" id="name" v-model="ingredient.nome" required>
            </div>
            <div class="form-group">
                <label for="category">Categoria</label>
                <SearchableSelect 
                    :options="ingredients_categories" 
                    v-model="ingredient.categoria"
                    name="category" 
                    placeholder="Selecione a categoria..."
                />
            </div>
            <div class="form-group">
                <label for="measurement" style="display: flex; align-items: center; gap: var(--space-2);">Unidade de medida <span class="material-icons" title="Por padrão a unidade de medida é vinculada à categoria.">info</span></label>
                <select name="measurement" id="measurement" v-model="ingredient.unidade_medida" required>
                    <option value="">Escolha uma opção</option>
                    <option v-for="(unity, index) in unities_of_measurement" :key="index" :value="unity.id">{{ unity.nome }}</option>
                </select>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import api from "../../configs/api";
import SearchableSelect from '../SearchableSelect.vue';
import $ from 'jquery';

export default {
    name: "editIngredientModalContent",
    props: ["ingredientid"],
    components: {
        SearchableSelect 
    },
    data() {
        return {
            ingredient: {
                id: 0,
                nome: "",
                categoria: "",
                unidade_medida: ""
            },
            unities_of_measurement: [],
            ingredients_categories: [],
            savingIngredient: false
        }
    },
    watch: {
        'ingredient.categoria': function () {
            const selectedCategory = this.ingredients_categories.find((category) => { 
                return category.id == this.ingredient.categoria 
            });
            
            if (selectedCategory) {
                this.ingredient.unidade_medida = selectedCategory.unidade_medida_id;
            }
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
        returnUnitiesOfMeasurement: function () {
            let self = this;

            api.get("/products/unities_of_measurement").then((response) => {
                self.unities_of_measurement = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
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