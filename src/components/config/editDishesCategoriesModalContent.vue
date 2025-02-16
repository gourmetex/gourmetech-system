<template>
    <div class="edit-dishe-caregories-modal-content">
        <form class="edit-category" id="informations-form" @submit.prevent="saveCategory()">
            <div class="form-group">
                <label for="nome">Nome da categoria</label>
                <input type="text" name="nome" id="nome" v-model="category.nome" required>
            </div>
            <div class="form-group">
                <label for="name">Cor da categoria</label>
                <colorSelect :colors="categoriesColors" @select="category.cor = $event.id" :selectedcolor="category.cor" />
            </div>
            <div class="radio-group">
                <input type="checkbox" id="promocional" v-model="category.promocional">
                <label for="promocional">Promocional?</label>
            </div>
            <div class="form-group" v-if="category.promocional">
                <label for="porcentagem_desconto">Porcentagem do desconto (%)</label>
                <input type="number" name="porcentagem_desconto" id="porcentagem_desconto" v-model="category.porcentagem_desconto" required>
            </div>
            <p class="response">{{ response }}</p>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import api from "../../configs/api";
import $ from 'jquery';
import colorSelect from "../colorSelect.vue";
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "editIngredientModalContent",
    mixins: [globalMethods],
    props: ["categoryid"],
    data() {
        return {
            category: {
                promocional: null,
                porcentagem_desconto: null,
                cor: null,
                nome: ""
            },
            savingCategory: false,
            categoriesColors: []
        }
    },
    methods: {
        saveCategory: function () {
            let self = this;

            this.resetResponse();

            if (self.savingCategory) return;

            if (this.category.cor == null) {
                this.setResponse("Cor não pode ser vazia", "error");
                return;
            }

            self.savingCategory = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            if (this.category.promocional) {
                data["promocional"] = true;
            }

            data["id"] = self.categoryid;
            data["cor"] = self.category.cor;

            let path = "create_dish_category";

            if (self.categoryid != null) {
                path = self.categoryid;
            }

            api.post("/products/categories/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.savingCategory = false;
            })
        },
        returnDishCategory: function () {
            let self = this;
            
            if (self.categoryid == 0 || self.categoryid == null) return;

            api.get("/products/categories/" + self.categoryid).then((response) => {
                self.category = response.data.returnObj;
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
        this.returnDishesCategoriesColors();
        this.returnDishCategory();
    },
    components: {
        colorSelect
    }
}
</script>
<style scoped>
</style>