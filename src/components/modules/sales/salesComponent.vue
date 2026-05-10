<template>
    <div class="sales-component">
        <div class="page-title">
            <h1>PROMOÇÕES</h1>
        </div>
        <actionButtons add_text="CRIAR PROMOÇÃO" exclude_text="EXCLUIR PROMOÇÃO" edit_text="EDITAR PROMOÇÃO"
            :disabledbuttons="disabledButtons" @add="addSale()" @exclude="excludeSale()"
            @edit="editSale()" />
        <div class="dishes-container">
            <div class="filter-container-header">
                <h2>Promoções cadastradas</h2>
                <div class="filters" v-if="false">
                    <form id="filter-form" @submit.prevent="search()">
                        <div class="filter-field">
                            <label for="nome">Nome da promoção</label>
                            <input type="text" name="nome" id="nome" placeholder="Ex. QUeima de inverno">
                        </div>
                        <button type="submit" class="btn btn-primary">Buscar</button>
                    </form>
                </div>
            </div>
            <dataTable :dataobj="sales" rowsperpage="7" searchText="cliente" :loaded="contentLoaded">
                <grid-column prop="id" label="ID" align="center" v-slot="props">
                    <p class="clicable text-center" @click="selectRow($event)">{{ props.item.id_promocao }}</p>
                </grid-column>
                <grid-column prop="nome_promocao" label="Nome"></grid-column>
                <grid-column prop="nome_produto" label="Produto" v-slot="props">
                    <div style="display: flex; align-items: center;">
                        <p>{{ props.item.nome_produto }}</p>
                        <img :src="props.item.imagem_produto">
                    </div>
                </grid-column>
                <grid-column prop="preco_produto" label="Valor Un." v-slot="props" align="right">{{ formatCurrency(props.item.preco_produto) }}</grid-column>
                <grid-column prop="dia_semana" label="Dia da semana" v-slot="props">{{ returnWeekDay(props.item.dia_semana) }}</grid-column>
                <grid-column prop="porcentagem_desconto" label="Desconto" v-slot="props" align="center">{{ props.item.porcentagem_desconto }}%</grid-column>
                <grid-column prop="ativa" label="Ativa" align="center" v-slot="props">
                    <newBadge :background="props.item.ativa == 1 ? 'var(--green-2)' : 'var(--red)'"
                        :text="props.item.ativa == 1 ? 'Sim' : 'Não'" class="text-center" />
                </grid-column>
            </dataTable>
        </div>
        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1"
            :excludepath="'/customers/' + editId" :modalbutton2="modalButton2" :modalbutton3="modalButton3"
            @closeModal="closeModalFunction(); returnSales();">
            <editSaleModalContent v-if="showEditSaleModalContent" :saleid="editId"
                @savedContent="closeModalFunction(); returnSales();"></editSaleModalContent>
        </modal>
    </div>
</template>
<script>
import actionButtons from "../../actionButtons.vue";
import dataTable from "../../dataTable.vue";
import { globalMethods } from "@/js/globalMethods";
import modal from "../../modal.vue";
import editSaleModalContent from "./editSaleModalContent.vue";
import newBadge from "../../newBadge.vue";
import api from "../../../configs/api";
import $ from 'jquery';

export default {
    name: "salesComponent",
    mixins: [globalMethods],
    data() {
        return {
            sales: [],
            gridOptions: [],
            showEditSaleModalContent: false,
            filters: []
        }
    },
    methods: {
        returnWeekDay(week_day) {
            let weekDays = [
                "Domingo",
                "Segunda-feira",
                "Terça-feira",
                "Quarta-feira",
                "Quinta-feira",
                "Sexta-feira",
                "Sábado"
            ]

            return weekDays[week_day - 1];
        },
        search: function () {
            let data = $("#filter-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});
            this.filters = data;
            this.returnSales();
        },
        resetModalContents: function () {
            this.showEditSaleModalContent = false;
        },
        addSale: function () {
            this.resetModalContents();
            this.showModalFunction("Adicionar promoção", "Salvar", "Cancelar");
            this.showEditSaleModalContent = true;
            this.editId = null;
        },
        excludeSale: function () {
            this.resetModalContents();
            this.showModalFunction("Excluir promoção", "Excluir", "Cancelar");
        },
        editSale: function () {
            this.resetModalContents();
            this.showModalFunction("Editar promoção", "Salvar", "Cancelar");
            this.showEditSaleModalContent = true;
        },
        returnSales: function () {
            let self = this;

            let data = {
                filters: self.filters
            }

            self.contentLoaded = false;

            api.post("/sales", data).then((response) => {
                self.sales = response.data.returnObj;
                self.contentLoaded = true;
            }).catch((error) => {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnSales();
        this.disableActionsButtons(false, true, true);
    },
    components: {
        actionButtons,
        dataTable,
        modal,
        editSaleModalContent,
        newBadge
    }
}
</script>
<style scoped></style>