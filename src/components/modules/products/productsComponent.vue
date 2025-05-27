<template>
    <div class="dishes-component">
        <div class="page-title">
            <h1>Produtos</h1>
        </div>  
        <actionButtons add_text="CRIAR PRODUTO" exclude_text="EXCLUIR PRODUTO" edit_text="EDITAR PRODUTO" :disabledbuttons="disabledButtons" @add="addDish()" @exclude="excludeDish()" @edit="editDish()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de produtos</h2>
            </div>
            <dataTable :dataTable="dishes" :rowsPerPage="7" searchText="produto" :loaded="contentLoaded">
                <template slot="column-id" slot-scope="props">
                    <p class="clicable text-center" v-on:click="selectRow($event)">{{ props.item.id }}</p>
                </template>
                <template slot="column-nome" slot-scope="props">
                    <p>{{ props.item.nome }}</p>
                </template>
                <template slot="column-imagem" slot-scope="props">
                    <img :src="props.item.imagem">
                </template>
                <template slot="column-descrição" slot-scope="props">
                    <p class="ellipsis" :title="props.item.descricao">{{ props.item.descricao }}</p>
                </template>
                <template slot="column-preço" slot-scope="props">
                    <p>{{ props.item.preco }}</p>
                </template>
                <template slot="column-categoria" slot-scope="props">
                    <newBadge class="text-center" :background="props.item.cor" :text="props.item.nome_categoria" />
                </template>
                <template slot="column-disponível" slot-scope="props">
                    <p class="text-center">{{ props.item.disponivel == 1 ? "Sim" : "Não" }}</p>
                </template>                
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/products/' + editId" :modalbutton2="modalButton2" :modalbutton3="modalButton3" @closeModal="closeModalFunction(); returnDishes();">
            <editProductModalContent v-if="showEditDishModalContent" :dishid="editId" @savedContent="closeModalFunction(); returnDishes();"></editProductModalContent>
        </modal>
    </div>
</template>
<script>
import actionButtons from "../../actionButtons.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../../modal.vue";
import editProductModalContent from "./editProductModalContent.vue";
import api from "../../../configs/api";
import dataTable from "../../dataTable.vue";
import newBadge from "../../newBadge.vue";

export default {
    name: "dishesComponent",
    mixins: [globalMethods],
    data() {
        return {
            dishes: [],
            showEditDishModalContent: false,
            ingredients_categories: []
        }
    },
    methods: {
        resetModalContents: function () {
            this.showEditDishModalContent = false;
        },  
        addDish: function () {
            this.resetModalContents();
            this.showModalFunction("Criar produto", "Criar", "Cancelar");
            this.showEditDishModalContent = true;
            this.editId = null;
        },
        excludeDish: function () {
            this.resetModalContents();
            this.showModalFunction("Excluir produto", "Remover", "Cancelar");
        }, 
        editDish: function () {
            this.resetModalContents();

            this.showModalFunction("Editar produto", "Salvar", "Cancelar");
            this.showEditDishModalContent = true;
        },
        returnDishes: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/products").then((response) => {
                self.dishes = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnDishes();
        this.disableActionsButtons(false, true, true);
    },
    components: {
        actionButtons,
        dataTable,
        newBadge,
        modal,
        editProductModalContent
    }
}
</script>
<style scoped>
</style>