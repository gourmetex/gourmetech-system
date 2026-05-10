<template>
    <div class="edit-debt-category">
        <form class="edit-debt-category" id="informations-form" @submit.prevent="saveDebtCategory()">
            <div class="form-group">
                <label for="nome">Nome da categoria</label>
                <input type="text" name="nome" id="nome" maxlength="50" v-model="debt.nome" required>
            </div>
            <div class="form-group">
                <label for="tipo_conta">Tipo de conta</label>
                <select name="tipo_conta" id="tipo_conta" v-model="debt.tipo_conta" required>
                    <option value="">Selecione uma categoria</option>
                    <option value="0">Conta a pagar</option>
                    <option value="1">Conta a receber</option>
                </select>
            </div>
            <div class="form-group">
                <label for="name">Cor da categoria</label>
                <colorSelect :colors="categoriesColors" @select="debt.cor = $event.id" :selectedcolor="debt.cor" />
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import colorSelect from "../colorSelect.vue";
import api from "../../configs/api";
import $ from 'jquery';
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "editDebtCategoryModalContent",
    props: ["debtid"],
    mixins: [globalMethods],
    data() {
        return {
            categoriesColors: [],
            debt: {
                nome: "",
                tipo_conta: null,
                cor: null
            },
            savingCategory: false
        }
    },
    methods: {
        saveDebtCategory: function () {
            let self = this;

            this.resetResponse();

            if (this.debt.cor == null) {
                this.setResponse("Cor não pode ser vazia", "error");
                return;
            }

            self.savingCategory = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["id"] = self.debtid;
            data["cor"] = self.debt.cor;

            let path = "create_category";

            if (self.debtid != null) {
                path = "edit_category/" + self.debtid;
            }

            api.post("/financial/debt_categories/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.savingCategory = false;
            })
        },
        returnDebtCategory: function () {
            let self = this;
            
            if (self.debtid == 0 || self.debtid == null) return;

            api.get("/financial/debt_categories/" + self.debtid).then((response) => {
                self.debt = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnDishesCategoriesColors: function () {
            let self = this;
            
            api.get("/products/categories/categories_colors").then((response) => {
                self.categoriesColors = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnDebtCategory();
        this.returnDishesCategoriesColors();
    },
    components: {
        colorSelect
    }
}
</script>
<style scoped>
</style>