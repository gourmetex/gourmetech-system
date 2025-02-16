<template>
    <div class="ingredients-config">
        <div class="filters">
            <form id="filter-form" @submit.prevent="search()">
                <div class="filter-field">
                    <label for="nome">Nome da categoria</label>
                    <input type="text" name="nome" id="nome" placeholder="Ex. Lanches">
                </div>
                <button type="submit" class="btn btn-primary">Buscar</button>
            </form>
        </div>
        <dataTable :dataTable="dishes_categories" :rowsPerPage="7" searchText="" :loaded="contentLoaded">
            <template slot="column-id" slot-scope="props">
                <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.id }}</p>
            </template>
            <template slot="column-nome" slot-scope="props">
                <p>{{ props.item.nome }}</p>
            </template>
            <template slot="column-cor" slot-scope="props">
                <newBadge class="text-center" :background="props.item.cor" text="" />
            </template>
            <template slot="column-promocional" slot-scope="props">
                <p>{{ props.item.promocional == 1 ? "Sim" : "Não" }}</p>
            </template>
            <template slot="column-porcentagem-desconto" slot-scope="props">
                <p class="text-center">{{ props.item.promocional == 1 ? (props.item.porcentagem_desconto + "%") : "" }}</p>
            </template>
        </dataTable>
        <div class="edit-buttons">
            <button type="button" class="rounded-btn btn-primary" v-on:click="createNewCategory()">
                <span class="material-icons">add</span>
            </button>
            <div class="dynamic-edit-buttons">
                <button type="button" class="rounded-btn btn-red" v-on:click="deleteCategory()">
                    <span class="material-icons">delete</span>
                </button>
                <button type="button" class="rounded-btn btn-yellow" v-on:click="editCategory()">
                    <span class="material-icons">edit</span>
                </button>
            </div>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/products/categories/' + editId" :modalbutton2="modalButton2" :modalbutton3="modalButton3" @closeModal="closeModalFunction(); returnDishesCategories();">
            <editDishesCategoriesModalContent v-if="showEditDishesCategoriesModalContent" :categoryid="editId" @savedContent="closeModalFunction(); returnDishesCategories();"></editDishesCategoriesModalContent>
        </modal>
    </div>
</template>
<script>
import dataTable from "../dataTable.vue";
import newBadge from "../newBadge.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../modal.vue";
import editDishesCategoriesModalContent from "./editDishesCategoriesModalContent.vue";
import api from "../../configs/api";
import $ from 'jquery';

export default {
    name: "ingredientsConfig",
    mixins: [globalMethods],
    data() {
        return {
            dishes_categories: [],
            gridOptions: [],
            showEditDishesCategoriesModalContent: false,
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
            this.returnDishesCategories();
        },
        deleteCategory: function () {
            this.showModalFunction("Excluir categoria", "Excluir", "Cancelar");
        },
        createNewCategory: function () {
            this.showModalFunction("Cadastrar categoria", "Cadastrar", "Cancelar");
            this.showEditDishesCategoriesModalContent = true;
            this.editId = null;
        },
        editCategory: function () {
            this.showModalFunction("Editar categoria", "Salvar", "Cancelar");
            this.showEditDishesCategoriesModalContent = true;
        },
        returnDishesCategories: function () {
            let self = this;

            let data = {
                filters: self.filters
            }

            self.contentLoaded = false;

            api.post("/products/categories", data).then((response) => {
                self.dishes_categories = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnDishesCategories();
    },
    components: {
        dataTable,
        newBadge,
        editDishesCategoriesModalContent,
        modal
    }
}
</script>
<style scoped>
</style>