<template>
    <div class="inner-modal-content">
        <form class="add-dish" id="informations-form" @submit.prevent="saveDish()">
            <div class="form-group-horizontal">
                <div class="form-group">
                    <label for="nome">Nome</label>
                    <input type="text" name="nome" v-model="dish.nome" required>
                </div>
                <div class="form-group">
                    <label for="categoria">Categoria</label>
                    <SearchableSelect 
                        :options="dishes_categories" 
                        v-model="dish.categoria"
                        name="categoria" 
                        placeholder="Selecione a categoria..."
                    />
                </div>
                <div class="form-group">
                    <label for="preco">Preço</label>
                    <input type="text" name="preco" id="preco" @input="inputMoneyCheck($event)" required>
                </div>
            </div>
            <div class="form-group">
                <label for="descricao">Descrição</label>
                <textarea name="descricao" id="descricao" v-model="dish.descricao" maxlength="5000"></textarea>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
        <h3>Componentes do produto</h3>
        <div class="modal-edit-grid">
            <dataTable :dataobj="dish.ingredientes" rowsperpage="2" searchText="" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
                </grid-column>
                <grid-column prop="nome" label="Nome"></grid-column>
                <grid-column prop="quantidade" label="Quantidade" align="center" v-slot="props">
                    <p class="text-center">{{ props.item.quantidade }} ({{ props.item.unidade_medida }})</p>
                </grid-column>
            </dataTable>
            <div class="edit-buttons buttons-vertical">
                <button type="button" class="rounded-btn btn-primary" v-on:click="addIngredient()">
                    <span class="material-icons">add</span>
                </button>
                <div class="dynamic-edit-buttons">
                    <button type="button" class="rounded-btn btn-red" v-on:click="deleteIngredient()">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="product-imagem-container">
            <h3>Imagem do produto</h3>
            <input type="file" name="product_image" @change="readFile()" id="product-image" accept=".jpg, .jpeg, .png">
            <img :src="dish.imagem">
        </div>
        <div class="small-modal">
            <form class="add-dish" id="informations-form" @submit.prevent="submitAddIngredient()">
                <div class="form-group">
                    <label for="ingredient">Item</label>
                    <select id="ingredient" name="ingredient" @change="selectThisIngredient()" required>
                        <option value="">* Selecione *</option>
                        <option v-for="(item, index) in ingredients" :key="index" :value="item.id">{{ item.nome }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="quantity">Quantidade {{ selected_ingredient_measure_unit != "" ?
                        `(${selected_ingredient_measure_unit})` : "" }}</label>
                    <input type="text" name="quantity" id="quantity" required v-model="quantity"
                        @keypress="formatDecimalValues(quantity)">
                </div>
                <button type="submit" class="btn btn-primary w-100">Salvar</button>
            </form>
        </div>
        <div class="small-modal-wrapper" v-on:click="closeSmallModal()"></div>
        <p class="response big error">{{ response }}</p>
    </div>
</template>
<script>
import api from "../../../configs/api";
import { globalMethods } from "@/js/globalMethods";
import $ from 'jquery';
import dataTable from "../../dataTable.vue";
import SearchableSelect from '../../SearchableSelect.vue';

export default {
    name: "editDishModalContent",
    mixins: [globalMethods],
    props: ["dishid"],
    data() {
        return {
            quantity: "",
            savingDish: false,
            dishes_categories: [],
            dishes: [],
            ingredients: [],
            selected_ingredient_measure_unit: "",
            selected_ingredient: {},
            ingredients_list: [],
            dish: {
                nome: "",
                categoria: "",
                preco: null,
                ingredientes: [],
                imagem: ""
            }
        }
    },
    methods: {
        deleteIngredient: function () {
            let self = this;

            if (self.dish.ingredientes.length == 1) {
                this.editId = null;
                return;
            }

            self.dish.ingredientes = self.dish.ingredientes.filter((obj) => { return obj.id !== self.editId });
            self.ingredients_list = self.ingredients_list.filter((obj) => { return obj.id !== self.editId });
        },
        submitAddIngredient: function () {
            this.selectThisIngredient();

            let newIngredientGrid = {
                id: this.selected_ingredient.id,
                nome: this.selected_ingredient.nome,
                quantidade: this.quantity + " " + this.selected_ingredient_measure_unit
            }

            let newIngredient = {
                id: this.selected_ingredient.id,
                quantidade: this.quantity
            }

            if (this.dish.ingredientes.length == 0 || !this.dish.ingredientes.some(obj => obj.id == this.selected_ingredient.id)) {
                this.dish.ingredientes.push(newIngredientGrid);
                this.ingredients_list.push(newIngredient);
                this.selected_ingredient = {};
                this.selected_ingredient_measure_unit = "";
                this.quantity = "";
            }

            this.closeSmallModal();
        },
        fillSubmitIngredients: function () {
            for (let i = 0; i < this.dish.ingredientes.length; i++) {
                let currentIngredient = this.dish.ingredientes[i];
                let newIngredient = {
                    id: currentIngredient.id,
                    quantidade: parseInt(currentIngredient.quantidade)
                }

                this.ingredients_list.push(newIngredient);
            }
        },
        selectThisIngredient: function () {
            let value = $("#ingredient").val();
            let ingredient = this.ingredients.find(obj => obj.id == value);

            if (ingredient != undefined && ingredient != null) {
                this.selected_ingredient = ingredient;
                this.selected_ingredient_measure_unit = ingredient.unidade_medida;
            } else {
                this.selected_ingredient = {};
                this.selected_ingredient_measure_unit = "";
            }
        },
        addIngredient: function () {
            this.openSmallModal();
        },
        readFile: function () {
            let self = this;
            const imageInput = document.getElementById('product-image');
            const file = imageInput.files[0];

            const reader = new FileReader();

            reader.onload = function (e) {
                self.dish.imagem = e.target.result;
            };

            reader.readAsDataURL(file);
        },
        saveDish: function () {
            let self = this;
            if (self.savingDish) return;

            this.response = "";

            if (this.ingredients_list.length == 0) {
                this.setResponse("O produto não pode estar vazio", "error");
                return;
            }

            self.savingDish = true;

            const imageInput = document.getElementById('product-image');
            const file = imageInput?.files[0];

            const formData = new FormData();

            const fields = $("#informations-form").serializeArray();

            let precoField = fields.find(obj => obj.name == "preco");

            if (this.formatDecimalValues(precoField.value) < 5) {
                this.setResponse("O preço mínimo do produto é R$ 5,00", "error");
                return;
            }

            fields.forEach(item => {
                formData.append(item.name, item.value);
            });

            formData.append("ingredientes", JSON.stringify(self.ingredients_list));

            if (file) {
                formData.append("product_image", file);

                this.readFile();
            }

            let path = "create_product";
            if (self.dishid != null) {
                path = "edit_product/" + self.dishid;
            }

            api.post("/products/" + path, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                this.setResponse("Ocorreu um erro ao salvar o produto", "error");
                console.log(error);
            }).then(() => {
                self.savingDish = false;
            });
        },
        returnDish: function () {
            let self = this;

            if (self.dishid == null) {
                self.contentLoaded = true;
                self.dish.ingredientes = [];
                return;
            }

            self.contentLoaded = false;

            api.get("/products/" + self.dishid).then((response) => {
                self.dish = response.data.returnObj;
                self.contentLoaded = true;
                self.fillSubmitIngredients();
                $("#preco").val(self.formatCurrency(self.dish.preco));
            }).catch((error) => {
                console.log(error);
            })
        },
        returnDishesCategories: function () {
            let self = this;

            api.post("/products/categories", { filters: {} }).then((response) => {
                self.dishes_categories = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
        returnAllIngredients: function () {
            let self = this;

            api.post("/products/ingredients").then((response) => {
                self.ingredients = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnAllIngredients();
        this.returnDishesCategories();
        this.returnDish();
    },
    components: {
        dataTable,
        SearchableSelect
    }
}
</script>
<style scoped>
.add-dish {
    margin-bottom: var(--space-3);
}

.product-imagem-container {
    margin-top: var(--space-4);
    display: grid;
    gap: var(--space-3);

    & img {
        border-radius: var(--radius-md);
        width: 50%;
        object-fit: contain;
        border: 1px solid var(--gray-3);
        margin: auto;
        margin-top: var(--space-4);
    }
}
</style>