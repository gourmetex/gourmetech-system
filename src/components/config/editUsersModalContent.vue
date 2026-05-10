<template>
    <div class="edit-roles-modal-content">
        <form class="edit-roles" id="informations-form" @submit.prevent="saveUser()">
            <div class="form-group">
                <label for="name">Nome do usuário</label>
                <input type="text" name="name" id="name" v-model="user.nome" required>
            </div>
            <div class="form-group">
                <label for="email">Email do usuário</label>
                <input type="email" name="email" id="email" v-model="user.email" required>
            </div>
            <div class="form-group">
                <label for="role">Cargo</label>
                <select name="role" id="role" v-model="user.id_cargo" required>
                    <option value="">* Selecione *</option>
                    <option :value="role.id" v-for="(role, index) in companyroles" :key="index">{{ role.nome }}</option>
                </select>
            </div>
            <div class="form-group">
                <label for="salary">Salário</label>
                <input type="text" name="salary" id="salary" @input="inputMoneyCheck($event)" required>
            </div>
            <div class="form-group">
                <label for="temporary-password">Senha temporária</label>
                <input type="text" name="temporary_password" id="temporary-password" placeholder="Será gerada automaticamente após inclusão" v-model="user.senha_temporaria" disabled>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import api from "../../configs/api";
import $ from 'jquery';
import { globalMethods } from "@/js/globalMethods";
import { v4 as uuidv4 } from 'uuid';

export default {
    name: "editUsersModalContent",
    mixins: [globalMethods],
    props: ["userid", "companyroles"],
    data() {
        return {
            user: {
                id: 0,
                nome: "",
                email: "",
                salario: null,
                admin: 0,
                data_criacao: null,
                url_foto_perfil: "",
                cargo: "",
                senha_temporaria: ""
            },
            savingUser: false,
            response: ""
        }
    },
    watch: {
        user: function () {
            if (this.user.admin == 1) {
                //this.$emit("savedContent", true);
            }
        }
    },
    methods: {
        saveUser: function () {
            let self = this;

            if (self.savingUser) return;

            self.savingUser = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["company_id"] = self.$root.company.id;
            data["company_name"] = self.$root.company.nome;
            data["token"] = "";

            let path = "register";

            let now = new Date();

            let temporaryPassword = self.$root.company.id + "_" + uuidv4() + now.toLocaleDateString('pt-BR').replace(/\//g, '');            

            if (self.userid != 0 && self.userid != null) {
                path = "edit_user/" + self.userid;
            } else {
                data["password"] = temporaryPassword;
                data["temporary_password"] = temporaryPassword;
            }

            api.post("/users/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            }).then(() => {
                self.savingUser = false;
                setTimeout(() => {
                    self.$emit("savedContent", true);
                }, 5000)
            })
        },
        returnUser: function () {
            let self = this;
            
            if (self.userid == 0 || self.userid == null) return;

            api.get("/users/return_user/" + self.userid).then((response) => {
                self.user = response.data.returnObj;
                $("#salary").val(self.formatCurrency(self.user.salario));
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnUser();
    }
}
</script>
<style scoped>
.edit-roles-modal-content {
    overflow-y: auto;
}
</style>