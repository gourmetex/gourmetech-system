<template>
    <div class="admin">
        <h1>Admin</h1>
        <div class="admin-container">
            <ul class="options-ul">
                <li v-for="(item, index) in adminOptions" v-bind:key="index" v-on:click="selectAdminOption(item.path)" :id="'admin-' + item.path" class="admin-option">
                    <h3>{{ item.name }}</h3>
                </li>
            </ul>
            <div class="select-some-option" v-if="showingSomething">
                <h2>Bem vindo ao admin, selecione uma opção para continuar</h2>
            </div>
            <adminEmpresas v-if="showAdminCompanies"></adminEmpresas>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';
import adminEmpresas from "./admin/adminEmpresas.vue";

export default {
    name: "adminComponent",
    data() {
        return {
            adminOptions: [
                {
                    id: 1,
                    path: "companies",
                    name: "Empresas"
                }
            ],
            showAdminCompanies: false
        }
    },
    computed: {
        showingSomething: function () {
            if (!this.showAdminCompanies) {
                return true;
            }

            return false;
        }
    },
    methods: {
        selectAdminOption: function (path) {
            $(".admin-option").removeClass("selected");
            $("#admin-" + path).addClass("selected");

            this.resetAdminOptions();

            switch (path) {
                case "companies":
                    this.showAdminCompanies = true;
                    break;
            }
        },
        resetAdminOptions: function () {
            this.showAdminCompanies = false;
        }
    },
    components: {
        adminEmpresas
    }
}
</script>
<style scoped>

.select-some-option {
    text-align: center;
}

</style>