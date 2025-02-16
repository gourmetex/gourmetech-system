<template>
    <div class="ingredients-config">
        <div class="filters">
            <form id="filter-form" @submit.prevent="search()">
                <div class="filter-field">
                    <label for="categoria">Categoria</label>
                    <select id="categoria" name="categoria">
                        <option value="">* Selecione *</option>
                        <option v-for="(category, index) in ingredients_categories" :key="index" :value="category.id">{{ category.nome }}</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Buscar</button>
            </form>
        </div>
        <dataTable :dataTable="ingredients" :rowsPerPage="7" searchText="" :loaded="contentLoaded">
            <template slot="column-id" slot-scope="props">
                <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.id }}</p>
            </template>
            <template slot="column-nome" slot-scope="props">
                <p>{{ props.item.nome }}</p>
            </template>
            <template slot="column-categoria" slot-scope="props">
                <p>{{ props.item.categoria }}</p>
            </template>
            <template slot="column-unidade_medida" slot-scope="props">
                <p>{{ props.item.unidade_medida }}</p>
            </template>
        </dataTable>
        <div class="edit-buttons">
            <button type="button" class="rounded-btn btn-primary" v-on:click="createNewIngredient()">
                <span class="material-icons">add</span>
            </button>
            <div class="dynamic-edit-buttons">
                <button type="button" class="rounded-btn btn-red" v-on:click="deleteIngredient()">
                    <span class="material-icons">delete</span>
                </button>
                <button type="button" class="rounded-btn btn-yellow" v-on:click="editIngredient()">
                    <span class="material-icons">edit</span>
                </button>
            </div>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/products/ingredients/' + editId" :modalbutton2="modalButton2" :modalbutton3="modalButton3" @closeModal="closeModalFunction(); returnAllIngredients();">
            <editIngredientModalContent v-if="showEditIngredientModalContent" :ingredientid="editId" @savedContent="closeModalFunction(); returnAllIngredients();"></editIngredientModalContent>
        </modal>
    </div>
</template>
<script>
import dataTable from "../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../modal.vue";
import editIngredientModalContent from "./editIngredientModalContent.vue";
import api from "../../configs/api";
import $ from 'jquery';

export default {
    name: "ingredientsConfig",
    mixins: [globalMethods],
    data() {
        return {
            ingredients: [],
            gridOptions: [],
            editId: null,
            showEditIngredientModalContent: false,
            filters: [],
            ingredients_categories: []
        }
    },
    methods: {
        search: function () {
            let data = $("#filter-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});
            this.filters = data;
            this.returnAllIngredients();
        },
        deleteIngredient: function () {
            this.showModalFunction("Excluir ingrediente", "Excluir", "Cancelar");
        },
        createNewIngredient: function () {
            this.showModalFunction("Cadastrar ingrediente", "Salvar", "Cancelar");
            this.showEditIngredientModalContent = true;
            this.editId = null;
        },
        editIngredient: function () {
            this.showModalFunction("Editar ingrediente", "Salvar", "Cancelar");
            this.showEditIngredientModalContent = true;
        },
        returnIngredientsCategories: function () {
            let self = this;

            api.get("/products/ingredient_categories").then((response) => {
                self.ingredients_categories = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },  
        returnAllIngredients: function () {
            let self = this;

            let data = {
                filters: self.filters
            }

            self.contentLoaded = false;

            api.post("/products/ingredients", data).then((response) => {
                self.ingredients = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnIngredientsCategories();
        this.returnAllIngredients();
    },
    components: {
        dataTable,
        editIngredientModalContent,
        modal
    }
}
</script>
<style scoped>
</style>