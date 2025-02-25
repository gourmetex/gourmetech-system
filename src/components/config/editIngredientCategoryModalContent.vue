<template>
    <div class="edit-ingredient-modal-content">
        <form class="edit-ingredient" id="informations-form" @submit.prevent="saveCategory()">
            <div class="form-group">
                <label for="name">Nome da categoria</label>
                <input type="text" name="name" id="name" v-model="category.nome" required>
            </div>
            <div class="form-group">
                <label for="measurement">Unidade de medida</label>
                <select name="measurement" id="measurement" v-model="category.unidade_medida" required>
                    <option value="">Escolha uma opção</option>
                    <option v-for="(unity, index) in unity_measurement" :key="index" :value="unity.id">{{ unity.nome }}</option>
                </select>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import api from "../../configs/api";
import $ from 'jquery';

export default {
    name: "editIngredientModalContent",
    props: ["categoryid"],
    data() {
        return {
            category: {
                id: 0,
                nome: "",
                unidade_medida: ""
            },
            unity_measurement: [],
            ingredients_categories: [],
            saving: false
        }
    },
    methods: {
        saveCategory: function () {
            let self = this;

            if (self.saving) return;

            self.savingIngredient = true;

            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["id"] = self.categoryid;

            let path = "create";

            if (self.category.id != 0) {
                path = "edit";
            }

            api.post("/products/ingredients/categories/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                console.log(error);
            }).then(() => {
                self.saving = false;
            })
        },
        returnCategory: function () {
            let self = this;
            
            if (self.categoryid == 0 || self.categoryid == null) return;

            api.get("/products/ingredients/categories/" + self.categoryid).then((response) => {
                self.category = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnUnitiesOfMeasurement: function () {
            let self = this;

            api.get("/products/unities_of_measurement").then((response) => {
                self.unity_measurement = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnUnitiesOfMeasurement();
        this.returnCategory();
        $("#name").focus();
    }
}
</script>
<style scoped>
</style>