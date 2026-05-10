<template>
    <div class="roles-config">
        <div class="filters">
            <form id="filter-form" @submit.prevent="search()">
                <div class="filter-field">
                    <label for="id">Id</label>
                    <input type="number" name="id" id="id">
                </div>
                <div class="filter-field">
                    <label for="name">Nome</label>
                    <input type="text" name="nome" id="name">
                </div>
                <div class="filter-field">
                    <label for="role">Perfil</label>
                    <select id="role" name="permissao">
                        <option value="">* Selecione *</option>
                        <option value="1">Master</option>
                        <option value="0">Padrão</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Buscar</button>
            </form>
        </div>
        <dataTable :dataobj="roles" rowsperpage="7" searchText="">
            <grid-column prop="id" label="ID" align="center" v-slot="props">
                <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
            </grid-column>
            <grid-column prop="nome" label="Nome"></grid-column>
            <grid-column prop="permissao" label="Permissão" v-slot="props">
                <p>{{ props.item.permissao == 1 ? "Master" : "Padrão" }}</p>
            </grid-column>
        </dataTable>
        <div class="edit-buttons">
            <button type="button" class="rounded-btn btn-primary" v-on:click="createNewRole()">
                <span class="material-icons">add</span>
            </button>
            <div class="dynamic-edit-buttons">
                <button type="button" class="rounded-btn btn-red" v-on:click="deleteRole()">
                    <span class="material-icons">delete</span>
                </button>
                <button type="button" class="rounded-btn btn-yellow" v-on:click="editRole()">
                    <span class="material-icons">edit</span>
                </button>
            </div>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1"
            :excludepath="'/companies/roles/' + editId" :modalbutton2="modalButton2" :modalbutton3="modalButton3"
            @closeModal="closeModalFunction(); returnAllRoles();">
            <editRoleModalContent v-if="showEditRoleModalContent" :roleid="editId"
                @savedContent="closeModalFunction(); returnAllRoles();"></editRoleModalContent>
        </modal>
    </div>
</template>
<script>
import dataTable from "../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../modal.vue";
import editRoleModalContent from "./editRoleModalContent.vue";
import api from "../../configs/api";
import $ from 'jquery';

export default {
    name: "rolesConfig",
    mixins: [globalMethods],
    data() {
        return {
            roles: [],
            gridOptions: [],
            showEditRoleModalContent: false,
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
            this.returnAllRoles();
        },
        deleteRole: function () {
            this.showModalFunction("Excluir cargo", "Excluir", "Cancelar");
        },
        createNewRole: function () {
            this.showModalFunction("Criar cargo", "Salvar", "Cancelar");
            this.showEditRoleModalContent = true;
            this.editId = null;
        },
        editRole: function () {
            this.showModalFunction("Editar cargo", "Salvar", "Cancelar");
            this.showEditRoleModalContent = true;
        },
        returnAllRoles: function () {
            let self = this;

            let data = {
                filters: self.filters
            }

            self.contentLoaded = false;

            api.post("/companies/roles", data).then((response) => {
                self.roles = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnAllRoles();
    },
    components: {
        dataTable,
        modal,
        editRoleModalContent
    }
}
</script>
<style scoped></style>