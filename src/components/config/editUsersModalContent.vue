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
            <div class="form-group" v-if="user.convite_pendente">
                <button type="button" class="btn btn-primary" :disabled="savingUser" @click="resendInvite">Reenviar convite</button>
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
                convite_pendente: false
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

            const path = this.userid ? "edit_user/" + this.userid : "invite";
            api.post("/users/" + path, data).then(() => {
                this.$emit("savedContent", true);
            }).catch((error) => {
                const message = error.response?.data?.mensagem || error.response?.data || "Não foi possível salvar.";
                this.setResponse(message, "error");
            }).finally(() => {
                this.savingUser = false;
            });
        },
        resendInvite: function () {
            this.savingUser = true;
            api.post("/users/invite", { email: this.user.email, role: this.user.id_cargo }).then(() => {
                this.setResponse("Convite enviado.", "success");
            }).catch((error) => {
                this.setResponse(error.response?.data?.mensagem || "Não foi possível enviar o convite.", "error");
            }).finally(() => {
                this.savingUser = false;
            });
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