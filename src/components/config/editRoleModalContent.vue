<template>
    <div class="edit-roles-modal-content">
        <form class="edit-roles" id="informations-form" @submit.prevent="saveRole()">
            <div class="form-group">
                <label for="role">Cargo</label>
                <input type="text" name="role" id="role" placeholder="Ex. Gerente" v-model="role.role" required>
            </div>
            <div class="form-group">
                <label for="permission">Permissão</label>
                <select name="permission" id="permission" v-model="role.permission" required>
                    <option value="">Escolha uma opção</option>
                    <option value="0">Padrão</option>
                    <option value="1">Admin</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notificações</label>
                <div
                    class="checkbox-group"
                    v-for="notification in role.notifications"
                    :key="notification.id"
                    >
                    <input
                        type="checkbox"
                        :id="'notification-' + notification.id"
                        :value="notification.id"
                        v-model="notification.enabled"
                    />
                    <label :for="'notification-' + notification.id">
                        {{ notification.nome }}
                    </label>
                </div>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import api from "../../configs/api";
import $ from 'jquery';

export default {
    name: "editRoleModalContent",
    props: ["roleid"],
    data() {
        return {
            role: {
                id: 0,
                role: "",
                permission: "",
                notifications: []
            },
            savingRole: false
        }
    },
    methods: {
        saveRole: function () {
            let self = this;

            if (self.savingRole) return;

            self.savingRole = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["id"] = self.roleid;
            data["notifications"] = self.role.notifications.filter(notification => notification.enabled);

            let path = "create_role";

            if (self.role.id != 0) {
                path = "edit_role";
            }

            api.post("/companies/roles/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.savingRole = false;
            })
        },
        returnRole: function () {
            let self = this;
            
            if (self.roleid == 0 || self.roleid == null) return;

            api.get("/companies/roles/" + self.roleid).then((response) => {
                self.role = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnRole();
    }
}
</script>
<style scoped>
</style>