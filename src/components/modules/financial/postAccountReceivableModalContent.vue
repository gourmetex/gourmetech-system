<template>
    <div class="post-account-receivable-modal-content">
        <form class="edit-roles" id="informations-form" @submit.prevent="saveDebt()">
            <div class="form-group">
                <label for="discriminacao">Discriminação</label>
                <input type="text" name="discriminacao" id="discriminacao" maxlength="150" required>
            </div>
            <div class="form-group">
                <label for="valor">Valor</label>
                <input type="text" name="valor" id="valor" @input="inputMoneyCheck($event)" required>
            </div>
            <div class="form-group">
                <label for="data_lancamento">Data</label>
                <input type="date" name="data_lancamento" id="data_lancamento" required>
            </div>
            <div class="form-group">
                <label for="categoria_conta">Categoria</label>
                <select id="categoria_conta" name="categoria_conta" required>
                    <option value="">Qualquer</option>
                    <option v-for="(item, index) in debt_categories" :key="index" :value="item.id[1]">{{ item.nome[1] }}</option>
                </select>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import api from "../../../configs/api";
import { globalMethods } from "@/js/globalMethods";
import $ from 'jquery';

export default {
    name: "postAccountReceivableModalContent",
    mixins: [globalMethods],
    data() {
        return {
            debt_categories: "",
            savingDebt: false
        }
    },
    methods: {
        saveDebt: function () {
            let self = this;

            if (self.savingDebt) return;

            self.savingDebt = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            api.post("/financial/post_debt", data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.savingDebt = false;
            })
        },
        returnDebtCategories: function () {
            let self = this;

            api.get("/financial/debt_categories?receivable=true").then((response) => {
                self.debt_categories = response.data.returnObj.debtCategories;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnDebtCategories();
    }
}
</script>
<style scoped>
</style>