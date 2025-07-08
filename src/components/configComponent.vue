<template>
    <div class="config-component">
        <div class="page-title">
            <h1>Configurações</h1>
        </div>
        <div class="config-content">
            <div class="config-menu">
                <ul class="options-ul principal-options">
                    <li v-for="(menu, index) in filteredConfigMenus" class="config-option" :key="index" :id="'config-menu-' + index" v-on:click="selectConfigOption(index)">
                        <div class="menu-title">
                            <h3>{{ menu.name }}</h3>
                        </div>
                    </li>
                </ul>
                <ul class="sub-menu options-ul" :id="'sub-menu-' + index" v-for="(menu, index) in filteredConfigMenus" :key="index">
                    <li v-for="(subMenu, index) in menu.subMenus" class="config-option" :key="index" :dataLink="subMenu.link" v-on:click="selectThisConfig($event)">
                        <h3>{{ subMenu.name }}</h3>
                    </li>
                </ul>
            </div>
            <div class="config-inner-page">
                <div class="not-showing" v-if="notShowingSubMenuContent">
                    <h2>Abra alguma configuração</h2>
                </div>
                <systemConfig v-if="showSections.systemConfig"></systemConfig>
                <rolesConfig v-if="showSections.rolesConfig"></rolesConfig>
                <usersConfig v-if="showSections.usersConfig"></usersConfig>
                <ingredientsConfig v-if="showSections.ingredientsConfig"></ingredientsConfig>
                <ingredientsCategoriesConfig v-if="showSections.ingredientsCategoriesConfig"></ingredientsCategoriesConfig>
                <productsCategories v-if="showSections.productsCategories"></productsCategories>
                <tablesConfig v-if="showSections.tablesConfig"></tablesConfig>
                <financialConfig v-if="showSections.financialConfig"></financialConfig>
                <reservationPreferences v-if="showSections.reservationPreferences" @cancel="resetConfigOptions"></reservationPreferences>
                <shippingConfig v-if="showSections.shippingConfig" @cancel="resetConfigOptions"></shippingConfig>
                <systemData v-if="showSections.systemData" @cancel="resetConfigOptions"></systemData>
                <systemLinkedCompanies v-if="showSections.systemLinkedCompanies"></systemLinkedCompanies>
            </div>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';
import systemConfig from "./config/systemConfig.vue";
import rolesConfig from "./config/rolesConfig.vue";
import usersConfig from "./config/usersConfig.vue";
import ingredientsConfig from "./config/ingredientsConfig.vue";
import ingredientsCategoriesConfig from "./config/ingredientsCategoriesConfig.vue";
import tablesConfig from "./config/tablesConfig.vue";
import financialConfig from "./config/financialConfig.vue";
import reservationPreferences from "./config/reservationPreferences.vue";
import shippingConfig from "./config/shippingConfig.vue";
import systemData from "./config/systemData.vue";
import systemLinkedCompanies from "./config/systemLinkedCompanies.vue";

export default {
    name: "configComponent",
    data() {
        return {
            configMenus: [
                {
                    id: 1,
                    name: "Componentes de produtos",
                    modulo_requerido: "products",
                    subMenus: [
                        {
                            id: 0,
                            name: "Listar tipos",
                            link: "ingredientsConfig"
                        },
                        {
                            id: 0,
                            name: "Categorias",
                            link: "ingredientsCategoriesConfig"
                        }
                    ]
                },
                {
                    id: 2,
                    name: "Usuários",
                    modulo_requerido: "config",
                    subMenus: [
                        {
                            id: 0,
                            name: "Listar usuários",
                            link: "usersConfig"
                        },
                        {
                            id: 1,
                            name: "Cargos",
                            link: "rolesConfig"
                        }
                    ]
                },
                {
                    id: 3,
                    name: "Sistema",
                    modulo_requerido: "config",
                    subMenus: [
                        {
                            id: 0,
                            name: "Dados da empresa",
                            link: "systemData"
                        },
                        {
                            id: 1,
                            name: "Personalização",
                            link: "systemConfig"
                        },
                        {
                            id: 2,
                            name: "Empresas vinculadas",
                            link: "systemLinkedCompanies"
                        }
                    ]
                },
                {
                    id: 4,
                    name: "Mesas",
                    modulo_requerido: "digital_menu",
                    subMenus: [
                        {
                            id: 0,
                            name: "Listar mesas",
                            link: "tablesConfig"
                        }
                    ]
                },
                {
                    id: 5,
                    name: "Financeiro",
                    modulo_requerido: "financial",
                    subMenus: [
                        {
                            id: 0,
                            name: "Categorias de contas",
                            link: "financialConfig"
                        }
                    ]
                },
                {
                    id: 6,
                    name: "Reservas",
                    modulo_requerido: "reservations",
                    subMenus: [
                        {
                            id: 0,
                            name: "Preferências",
                            link: "reservationPreferences"
                        }
                    ]
                },
                {
                    id: 7,
                    name: "Entregas",
                    modulo_requerido: "shipping",
                    subMenus: [
                        {
                            id: 0,
                            name: "Configurar taxa",
                            link: "shippingConfig"
                        }
                    ]
                }
            ],
            showSections: {
                systemConfig: false,
                rolesConfig: false,
                usersConfig: false,
                ingredientsConfig: false,
                ingredientsCategoriesConfig: false,
                tablesConfig: false,
                financialConfig: false,
                reservationPreferences: false,
                shippingConfig: false,
                systemData: false,
                systemLinkedCompanies: false
            }
        }
    },
    computed: {
        notShowingSubMenuContent() {
            return Object.values(this.showSections).every(property => !property);
        },
        filteredConfigMenus: function () {
            let filteredMenus = [];

            for (let i = 0; i < this.configMenus.length; i++) {
                if (this.$root.menuOptions.some(modulo => modulo.codigo === this.configMenus[i].modulo_requerido)) {
                    filteredMenus.push(this.configMenus[i]);
                }
            }

            return filteredMenus;
        }
    },
    methods: {
        selectThisConfig: function (event) {
            $(".sub-menu .config-option").removeClass("selected");

            let subMenuItem = $(event.target.parentElement);
            if (event.target.localName == "li") {
                subMenuItem = $(event.target);
            }

            subMenuItem.addClass("selected");
            let dataLink = subMenuItem.attr("dataLink");

            this.resetMenus();

            this.showSections[dataLink] = true;
        },
        resetMenus: function () {
            for (let key in this.showSections) {
                this.showSections[key] = false;
            }
        },
        selectConfigOption: function (path) {
            let subMenu = "sub-menu-" + path;

            this.resetConfigOptions();
            $("#config-menu-" + path).addClass("selected");
            $("#" + subMenu).show();
        },
        resetConfigOptions: function () {
            $(".principal-options .config-option").removeClass("selected");
            $(".sub-menu").hide();
            $(".sub-menu li").removeClass("selected");
            this.resetMenus();
        }
    },
    mounted: function () {
        this.resetConfigOptions();
    },
    components: {
        systemConfig,
        rolesConfig,
        usersConfig,
        ingredientsConfig,
        tablesConfig,
        financialConfig,
        reservationPreferences,
        shippingConfig,
        systemData,
        ingredientsCategoriesConfig,
        systemLinkedCompanies
    }
}
</script>
<style scoped>
.not-showing {
    text-align: center;
}
</style>