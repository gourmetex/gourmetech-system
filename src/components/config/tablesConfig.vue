<template>
    <div class="tables-config">
        <div class="filters">
            <form id="filter-form" @submit.prevent="search()">
                <div class="filter-field">
                    <label for="categoria">Número da mesa</label>
                    <input type="number" name="id" id="id">
                </div>
                <button type="submit" class="btn btn-primary">Buscar</button>
            </form>
        </div>
        <dataTable :dataobj="tables" rowsperpage="7" searchText="" :loaded="contentLoaded">
            <grid-column prop="id" label="Número" align="center" v-slot="props">
                <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
            </grid-column>
            <grid-column prop="descricao" label="Descrição"></grid-column>
        </dataTable>
        <div class="edit-buttons">
            <button type="button" class="rounded-btn btn-primary" v-on:click="createNewTable()">
                <span class="material-icons">add</span>
            </button>
            <div class="dynamic-edit-buttons">
                <button type="button" class="rounded-btn btn-red" v-on:click="deleteTable()">
                    <span class="material-icons">delete</span>
                </button>
                <button type="button" class="rounded-btn btn-yellow" v-on:click="editTable()">
                    <span class="material-icons">edit</span>
                </button>
            </div>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/tables/' + editId"
            :modalbutton2="modalButton2" :modalbutton3="modalButton3"
            @closeModal="closeModalFunction(); returnAllTables();">
            <editTablesModalContent v-if="showEditTablesModalContent" :tableid="editId"
                @savedContent="closeModalFunction(); returnAllTables();"></editTablesModalContent>
        </modal>
    </div>
</template>
<script>
import dataTable from "../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../modal.vue";
import editTablesModalContent from "./editTablesModalContent.vue";
import api from "../../configs/api";
import $ from 'jquery';

export default {
    name: "tablesConfig",
    mixins: [globalMethods],
    data() {
        return {
            tables: [],
            gridOptions: [],
            editId: null,
            showEditTablesModalContent: false,
            filters: []
        }
    },
    methods: {
        search: function () {
            let data = $("#filter-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});
            this.filters = data;
            this.returnAllTables();
        },
        deleteTable: function () {
            this.showModalFunction("Excluir mesa", "Excluir", "Cancelar");
        },
        createNewTable: function () {
            this.showModalFunction("Cadastrar mesa", "Salvar", "Cancelar");
            this.showEditTablesModalContent = true;
            this.editId = null;
        },
        editTable: function () {
            this.showModalFunction("Editar mesa", "Salvar", "Cancelar");
            this.showEditTablesModalContent = true;
        },
        returnAllTables: function () {
            let self = this;

            let data = {
                filters: self.filters
            }

            self.contentLoaded = false;

            api.post("/tables", data).then((response) => {
                self.tables = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        }
    },
    mounted: function () {
        this.returnAllTables();
    },
    components: {
        dataTable,
        editTablesModalContent,
        modal
    }
}
</script>
<style scoped></style>