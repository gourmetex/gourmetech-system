<template>
    <div class="ajax-autocomplete" invalid="true">
        <div class="ajax-autocomplete-wrapper" v-on:click="clearContainer()" v-if="entity_search.length > 2 && !force_close"></div>
        <div class="ajax-autocomplete-container">
            <input type="text" id="ajax-autocomplete-input" placeholder="*** para todos" v-model="entity_search">
            <div class="selected-entity" v-if="entity_object.nome != ''">
                {{ entity_object.nome }}
                <span class="material-icons" v-on:click="deselectEntity()">close</span>
            </div>
            <div class="entities-list" v-if="entity_search.length > 2 && !force_close">
                <div class="empty-search" v-if="entity_search.length > 2 && entities_list.length == 0">
                    <p>Nenhum resultado encontrado</p>
                </div>
                <div class="entities-list-inner" v-if="entity_search.length > 2 && entities_list.length > 0">
                    <div class="entity" v-for="(entityObj, index) in entities_list" :key="index" v-on:click="selectEntity(entityObj)">
                        <div class="customers-entity" v-if="ajaxtype == 'clientes'">
                            <div class="entity-line">
                                <p>{{ entityObj.nome }}</p>
                                <p v-if="entityObj.porcentagem_desconto != ''"><span class="font-bold">{{ entityObj.porcentagem_desconto }}</span> <span style="color: var(--green-low);">desconto</span></p>
                            </div>
                            <div class="entity-line" style="color: var(--gray);">
                                <p style="color: var(--gray);">{{ entityObj.email }}</p>
                                <p style="color: var(--gray);">{{ entityObj.telefone }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import api from "../configs/api";
import $ from 'jquery';

export default {
    name: "ajaxAutoComplete",
    props: ["ajaxtype", "entityid", "entityname", "required"],
    data() {
        return {
            entity_id: null,
            entity_search: "",
            entity_object: {
                nome: ""
            },
            entities_list: [],
            force_close: false
        }
    },
    watch: {
        entityid: function () {
            this.entity_object.id = this.entityid;
            if (this.entityid == null) {
                this.entity_search = this.entityname;
                this.force_close = true;
                this.checkValidity();
            } else {
                this.entity_object.id = this.entityid;
                this.entity_object.nome = this.entityname;
                this.force_close = false;
                this.checkValidity();
            }
        },
        entity_search: function () {
            if (this.entity_search.length > 2) {
                let searchString = this.entity_search;
                setTimeout(() => {
                    if (this.entity_search == searchString) {
                        this.searchEntity();
                    }
                }, 150)
            }

            this.checkValidity();
        }
    },
    methods: {
        checkValidity: function () {
            if (this.entity_search.trim().length == 0 && this.entity_object.nome == "") {
                $(".ajax-autocomplete").attr("invalid", true);
                this.force_close = false;
            } else {
                $(".ajax-autocomplete").attr("invalid", false);
            }
        },
        selectEntity: function (selected_entity) {
            this.entity_object = selected_entity;
            this.entity_search = "";
            this.checkValidity();
            this.$emit("select", this.entity_object);
        },
        deselectEntity: function () {
            this.entity_object = {
                nome: "",
                id: null
            }
            this.entity_search = "";
            this.checkValidity();
        },
        clearContainer: function () {
            this.entities_list = [];
            this.force_close = true;
            this.entity_object = {
                nome: this.entity_search,
                id: null
            }
            this.$emit("select", this.entity_object);
        },
        searchEntity: function () {
            let self = this;
            let domain = "";

            switch (this.ajaxtype) {
                case "clientes":
                    domain = "/customers/";
                    break;
                default: 
                    return;
            }

            let data = {
                search_string: this.entity_search
            }

            api.post(domain + "search", data).then((response) => {
                self.entities_list = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        }
    }
}
</script>
<style scoped>
.ajax-autocomplete-wrapper {
    background: transparent;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
}

.ajax-autocomplete-container {
    z-index: 6;
}

.ajax-autocomplete, .ajax-autocomplete-container {
    position: relative;
}

.selected-entity, .entities-list {
    position: absolute;
}

.selected-entity {
    top: 5px;
    left: 5px;
    background: var(--blue);
    color: var(--white);
    display: flex;
    align-items: center;
    padding: var(--space-2);
    border-radius: var(--radius-sm);
}

    .selected-entity span {
        cursor: pointer;
    }

.entities-list {
    background: var(--white);
    border: 1px solid var(--gray-2);
    border-radius: var(--radius-sm);
    z-index: 5;
    width: 100%;
    overflow: hidden;
}
.entity-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.empty-search {
    padding: var(--space-3);
    text-align: center;
}

.entity {
    padding: var(--space-3);
    cursor: pointer;
}

    .entity:hover {
        background: var(--blue-high-2);
    }
</style>