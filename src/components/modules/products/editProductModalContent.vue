<template>
    <div class="inner-modal-content">
        <form class="add-dish" id="informations-form" @submit.prevent="saveDish()">
            <div class="form-row">
                <div class="form-group form-col-2">
                    <label for="nome">Nome</label>
                    <input type="text" name="nome" v-model="dish.nome" required placeholder="Ex: Risoto de Cogumelos">
                </div>
                <div class="form-group form-col-2">
                    <label for="categoria">Categoria</label>
                    <SearchableSelect :options="dishes_categories" v-model="dish.categoria" name="categoria"
                        placeholder="Selecione a categoria..." />
                    <button type="button" class="btn btn-sm" @click="openCategoryEditor"
                        :disabled="categoryEditorOpen || loadingCategoryColors">Nova categoria</button>
                </div>
                <div class="form-group form-col-1">
                    <label for="preco">{{ priceFieldLabel }}</label>
                    <input type="text" name="preco" id="preco" @input="inputMoneyCheck($event)" required placeholder="R$ 0,00">
                </div>
            </div>
            <div class="form-group check-group">
                <input type="checkbox" id="a_granel" v-model="dish.a_granel">
                <label for="a_granel">Produto a granel (vendido por peso/medida)</label>
            </div>
            <div class="form-group">
                <label for="descricao">Descrição</label>
                <textarea name="descricao" id="descricao" v-model="dish.descricao" maxlength="5000" rows="3" placeholder="Descrição do produto para o cardápio..."></textarea>
            </div>
            <input type="submit" id="submit-button" style="display: none;">
        </form>

        <form v-if="categoryEditorOpen" @submit.prevent="createCategory">
            <div class="form-row">
                <div class="form-group form-col-2">
                    <label for="category-name">Nome da categoria</label>
                    <input id="category-name" v-model.trim="newCategory.nome" maxlength="100" required>
                </div>
                <div class="form-group form-col-1">
                    <label for="category-color">Cor</label>
                    <select id="category-color" v-model="newCategory.cor" required>
                        <option v-for="color in categoryColors" :key="color.id" :value="color.id">
                            {{ color.text || color.cor }}
                        </option>
                    </select>
                </div>
            </div>
            <button type="submit" class="btn btn-sm btn-primary" :disabled="savingCategory">Salvar categoria</button>
            <button type="button" class="btn btn-sm" :disabled="savingCategory" @click="categoryEditorOpen = false">Cancelar</button>
        </form>

        <div class="section-divider"></div>

        <div class="components-section">
            <div class="components-header">
                <h3>Componentes do produto</h3>
                <div class="components-actions">
                    <button type="button" class="btn btn-sm btn-primary" v-on:click="addIngredient()"
                        :disabled="dish.a_granel && dish.ingredientes.length >= 1">
                        <span class="material-icons" style="font-size: 16px; margin-right: 4px;">add</span> Adicionar item
                    </button>
                    <div class="dynamic-edit-buttons">
                        <button type="button" class="btn btn-sm btn-danger" v-on:click="deleteIngredient()">
                            <span class="material-icons" style="font-size: 16px; margin-right: 4px;">delete</span> Excluir
                        </button>
                    </div>
                </div>
            </div>
            <dataTable :dataobj="dish.ingredientes" rowsperpage="3" searchText="" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" width="60px" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id }}</p>
                </grid-column>
                <grid-column prop="nome" label="Nome"></grid-column>
                <grid-column prop="quantidade" label="Quantidade" width="140px" align="center" v-slot="props">
                    <p class="text-center">{{ props.item.quantidade }} ({{ props.item.unidade_medida }})</p>
                </grid-column>
            </dataTable>
        </div>

        <div class="section-divider"></div>

        <div class="product-imagem-container">
            <h3>Imagem do produto</h3>
            <div class="image-upload-wrapper">
                <input type="file" name="product_image" @change="readFile()" id="product-image"
                    accept="image/jpeg, image/png, image/webp" />
                <div class="image-preview" v-if="dish.imagem">
                    <img :src="dish.imagem" alt="Prévia do produto">
                </div>
            </div>
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
                <div class="form-group" v-if="!dish.a_granel">
                    <label for="quantity">Quantidade {{ selected_ingredient_measure_unit != "" ?
                        `(${selected_ingredient_measure_unit})` : "" }}</label>
                    <input type="text" name="quantity" id="quantity" required v-model="quantity"
                        @keypress="formatDecimalValues(quantity)">
                </div>
                <div class="form-group" v-else>
                    <label>Unidade de venda</label>
                    <input type="text" :value="selected_ingredient_measure_unit || 'Selecione um item'" disabled>
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
            categoryEditorOpen: false,
            loadingCategoryColors: false,
            savingCategory: false,
            categoryColors: [],
            newCategory: { nome: "", cor: null },
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
                imagem: "",
                a_granel: false
            }
        }
    },
    computed: {
        priceFieldLabel() {
            if (!this.dish.a_granel) {
                return "Preço";
            }

            let unit = this.dish.ingredientes?.[0]?.unidade_medida || this.selected_ingredient_measure_unit || "";
            let priceUnit = this.bulkPriceUnitFromMeasure(unit);

            return priceUnit ? `Preço por ${priceUnit}` : "Preço por unidade de venda";
        }
    },
    watch: {
        "dish.a_granel": function (isBulk) {
            if (isBulk && this.dish.ingredientes.length > 1) {
                this.dish.ingredientes = this.dish.ingredientes.slice(0, 1);
                this.ingredients_list = this.ingredients_list.slice(0, 1).map((ingredient) => ({
                    ...ingredient,
                    quantidade: 1
                }));
            }

            if (isBulk && this.ingredients_list.length == 1) {
                this.ingredients_list[0].quantidade = 1;
                this.dish.ingredientes[0].quantidade = 1;
            }
        }
    },
    methods: {
        async openCategoryEditor() {
            this.loadingCategoryColors = true;
            try {
                const { data } = await api.get("/products/categories/categories_colors");
                this.categoryColors = data.returnObj;
                if (!this.categoryColors.length) throw new Error("Paleta vazia");
                this.newCategory = { nome: "", cor: this.categoryColors[0].id };
                this.categoryEditorOpen = true;
            } catch {
                this.setResponse("Não foi possível carregar as cores da categoria", "error");
            } finally {
                this.loadingCategoryColors = false;
            }
        },
        async createCategory() {
            if (this.savingCategory || !this.newCategory.nome) return;
            this.savingCategory = true;
            try {
                const { data } = await api.post("/products/categories/create_dish_category", this.newCategory);
                const { id } = data.returnObj;
                const color = this.categoryColors.find((option) => option.id === this.newCategory.cor);
                this.dishes_categories.push({ id, nome: this.newCategory.nome, cor: color.cor });
                this.dish.categoria = id;
                this.categoryEditorOpen = false;
                this.response = "";
            } catch (error) {
                const message = error.response?.data;
                this.setResponse(typeof message === "string" ? message : "Não foi possível criar a categoria", "error");
            } finally {
                this.savingCategory = false;
            }
        },
        bulkPriceUnitFromMeasure: function (unit) {
            const unitMap = {
                g: "kg",
                mL: "L",
                mg: "g"
            };

            return unitMap[unit] || unit;
        },
        deleteIngredient: function () {
            let self = this;

            if (self.dish.ingredientes.length == 1 && !self.dish.a_granel) {
                this.editId = null;
                return;
            }

            self.dish.ingredientes = self.dish.ingredientes.filter((obj) => { return obj.id !== self.editId });
            self.ingredients_list = self.ingredients_list.filter((obj) => { return obj.id !== self.editId });
        },
        submitAddIngredient: function () {
            this.selectThisIngredient();
            let ingredientQuantity = this.dish.a_granel ? 1 : this.formatDecimalValues(this.quantity);

            if (!this.selected_ingredient.id || ingredientQuantity <= 0) {
                this.setResponse("Informe um item valido", "error");
                return;
            }

            let newIngredientGrid = {
                id: this.selected_ingredient.id,
                nome: this.selected_ingredient.nome,
                quantidade: ingredientQuantity,
                unidade_medida: this.selected_ingredient_measure_unit
            }

            let newIngredient = {
                id: this.selected_ingredient.id,
                quantidade: ingredientQuantity
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
                    quantidade: parseFloat(currentIngredient.quantidade)
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
            if (this.dish.a_granel && this.dish.ingredientes.length >= 1) {
                this.setResponse("Produto a granel deve ter somente um ingrediente", "error");
                return;
            }

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

            if (this.dish.a_granel && this.ingredients_list.length != 1) {
                this.setResponse("Produto a granel deve ter somente um ingrediente", "error");
                return;
            }

            const imageInput = document.getElementById('product-image');
            const file = imageInput?.files[0];

            const formData = new FormData();

            const fields = $("#informations-form").serializeArray();

            let precoField = fields.find(obj => obj.name == "preco");

            if (!this.dish.a_granel && this.formatDecimalValues(precoField.value) < 5) {
                this.setResponse("O preço mínimo do produto é R$ 5,00", "error");
                return;
            }

            if (this.dish.a_granel && this.formatDecimalValues(precoField.value) <= 0) {
                this.setResponse("O preco do produto a granel deve ser maior que zero", "error");
                return;
            }

            fields.forEach(item => {
                formData.append(item.name, item.value);
            });

            formData.append("ingredientes", JSON.stringify(self.ingredients_list));
            formData.append("a_granel", self.dish.a_granel ? "1" : "0");

            if (file) {
                formData.append("product_image", file);

                this.readFile();
            }

            let path = "create_product";
            if (self.dishid != null) {
                path = "edit_product/" + self.dishid;
            }

            self.savingDish = true;

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
                self.dish.a_granel = self.dish.a_granel == 1;
                self.contentLoaded = true;
                self.fillSubmitIngredients();
                $("#preco").val(self.formatCurrency(self.dish.preco));
            }).catch((error) => {
                console.log(error);
            })
        },
        returnDishesCategories: function () {
            let self = this;

            api.post("/products/categories", {}).then((response) => {
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

.section-divider {
    height: 1px;
    background: var(--line);
    margin: var(--space-5) 0;
}

.components-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
}

.components-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
}

.components-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.btn-sm {
    padding: 6px 14px;
    font-size: 13px;
    min-width: auto;
    height: 36px;
    display: inline-flex;
    align-items: center;
}

.product-imagem-container h3 {
    margin: 0 0 var(--space-2) 0;
    font-size: 15px;
    font-weight: 700;
}

.image-upload-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    background: var(--paper);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    border: 1px dashed var(--line);
}

.image-upload-wrapper input[type="file"] {
    max-width: 260px;
    background: transparent;
    border: none;
    height: auto;
    padding: 0;
}

.image-preview img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--line);
    background: var(--surface);
}

.check-group {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: var(--space-2);
    margin: var(--space-2) 0;
}

.check-group input {
    width: 18px;
    height: 18px;
}
</style>
