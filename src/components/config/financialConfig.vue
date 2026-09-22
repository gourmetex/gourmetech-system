<template>
    <div class="financial">
        <div class="config-action-bar">
            <button type="button" class="btn btn-primary" v-on:click="createNewDebtCategory()">
                <span class="material-icons" style="font-size: 18px; margin-right: 6px;">add</span> Nova Categoria
            </button>
            <div class="dynamic-edit-buttons">
                <button type="button" class="btn btn-secondary" v-on:click="editDebtCategory()">
                    <span class="material-icons" style="font-size: 18px; margin-right: 6px;">edit</span> Editar
                </button>
                <button type="button" class="btn btn-danger" v-on:click="deleteDebtCategory()">
                    <span class="material-icons" style="font-size: 18px; margin-right: 6px;">delete</span> Excluir
                </button>
            </div>
        </div>
        <dataTable :dataobj="debtCategories" rowsperpage="7" searchText="item">
            <grid-column prop="id" label="ID" width="70px" align="center" v-slot="props">
                <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
            </grid-column>
            <grid-column prop="nome" label="Nome"></grid-column>
            <grid-column prop="tipo" label="Tipo" align="center" v-slot="props">
                <newBadge class="text-center" :background="props.item.cor" :text="props.item.tipo_conta" />
            </grid-column>
        </dataTable>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1"
            :excludepath="'/financial/debt_categories/' + editId" :modalbutton2="modalButton2"
            :modalbutton3="modalButton3" @closeModal="closeModalFunction(); returnDebtCategories();">
            <editDebtCategoryModalContent v-if="showEditDebtCategoryModalContent" :debtid="editId"
                @savedContent="closeModalFunction(); returnDebtCategories();"></editDebtCategoryModalContent>
        </modal>
    </div>
</template>
<script>
import dataTable from "../dataTable.vue";
import newBadge from "../newBadge.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../modal.vue";
import editDebtCategoryModalContent from "./editDebtCategoryModalContent.vue";
import api from "../../configs/api";

export default {
    name: "financialConfig",
    mixins: [globalMethods],
    data() {
        return {
            showEditDebtCategoryModalContent: false,
            debtCategories: [],
            gridOptions: []
        }
    },
    methods: {
        createNewDebtCategory: function () {
            this.showModalFunction("Criar categoria", "Criar", "Cancelar");
            this.showEditDebtCategoryModalContent = true;
            this.editId = null;
        },
        deleteDebtCategory: function () {
            this.showModalFunction("Excluir categoria", "Excluir", "Cancelar");
        },
        editDebtCategory: function () {
            this.showModalFunction("Editar categoria", "Salvar", "Cancelar");
            this.showEditDebtCategoryModalContent = true;
        },
        returnDebtCategories: function () {
            let self = this;

            self.contentLoaded = false;

            api.get("/financial/debt_categories?all=true").then((response) => {
                self.debtCategories = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnDebtCategories();
    },
    components: {
        dataTable,
        newBadge,
        modal,
        editDebtCategoryModalContent
    }
}
</script>
<style scoped></style>