<template>
    <div class="dishes-component">
        <div class="page-title">
            <h1>Produtos</h1>
        </div>
        <actionButtons add_text="CRIAR PRODUTO" exclude_text="EXCLUIR PRODUTO" edit_text="EDITAR PRODUTO"
            :disabledbuttons="disabledButtons" @add="addDish()" @exclude="excludeDish()" @edit="editDish()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Lista de produtos</h2>
            </div>
            <dataTable :dataobj="dishes" rowsperpage="7" searchText="produto" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
                </grid-column>
                <grid-column prop="nome" label="Nome"></grid-column>
                <grid-column prop="imagem" label="Imagem" align="center" v-slot="props">
                    <img :src="props.item.imagem">
                </grid-column>
                <grid-column prop="descricao" label="Descrição" v-slot="props">
                    <p class="ellipsis" :title="props.item.descricao">{{ props.item.descricao }}</p>
                </grid-column>
                <grid-column prop="preco" label="Preço"></grid-column>
                <grid-column prop="categoria" label="Categoria" align="center" v-slot="props">
                    <newBadge :background="props.item.cor" :text="props.item.nome_categoria" class="text-center" />
                </grid-column>
                <grid-column prop="disponivel" label="Disponível" align="center" v-slot="props">
                    <p class="text-center">{{ props.item.disponivel == 1 ? "Sim" : "Não" }}</p>
                </grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1"
            :excludepath="'/products/' + editId" :modalbutton2="modalButton2" :modalbutton3="modalButton3"
            @closeModal="closeModalFunction(); returnDishes();">
            <editProductModalContent v-if="showEditDishModalContent" :dishid="editId"
                @savedContent="closeModalFunction(); returnDishes();"></editProductModalContent>
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
<style scoped></style>