<template>
    <div class="action-buttons-component">
        <div class="buttons-container">
            <button class="btn-big btn-primary" v-if="add_text" id="add-button-big" v-on:click="add()">
                {{ add_text }}
                <span class="material-icons">{{ chooseAddIcon() }}</span>
            </button>
            <button class="btn-big btn-red" v-if="exclude_text" id="exclude-button-big" v-on:click="exclude()">
                {{ exclude_text }}
                <span class="material-icons">{{ exclude_icon != undefined && exclude_icon != null && exclude_icon != "" ? exclude_icon : "close" }}</span>
            </button>
            <button class="btn-big btn-yellow" v-if="edit_text" id="edit-button-big" v-on:click="edit()">
                {{ edit_text }}
                <span class="material-icons">{{ edit_icon != undefined && edit_icon != null && edit_icon != "" ? edit_icon : "edit" }}</span>
            </button>
        </div>  
    </div>
</template>
<script>
import { globalMethods } from "@/js/globalMethods";
import $ from 'jquery';

export default {
    name: "actionButtonsComponent",
    mixins: [globalMethods],
    props: ["add_text", "exclude_text", "edit_text", "disabledbuttons", "add_icon", "exclude_icon", "edit_icon"],
    methods: {
        chooseAddIcon: function () {
            if (this.add_text != undefined && this.add_text.indexOf("FINALIZAR") != -1) {
                return "check";
            }

            if (this.add_icon != undefined && this.add_icon != null && this.add_icon != "") {
                return this.add_icon;
            } 

            return "add";
        },
        add: function () {
            this.$emit("add");
        },
        exclude: function () {
            this.$emit("exclude");
        },
        edit: function () {
            this.$emit("edit");
        },
        disableRequestedButtons: function () {     
            if (this.disabledbuttons != undefined && this.disabledbuttons.indexOf(1) != -1) {
                $("#add-button-big").attr("disabled", "disabled");
            } else {
                $("#add-button-big").removeAttr("disabled");
            }

            if (this.disabledbuttons != undefined && this.disabledbuttons.indexOf(2) != -1) {
                $("#exclude-button-big").attr("disabled", "disabled");
            } else {
                $("#exclude-button-big").removeAttr("disabled");
            }

            if (this.disabledbuttons != undefined && this.disabledbuttons.indexOf(3) != -1) {
                $("#edit-button-big").attr("disabled", "disabled");
            } else {
                $("#edit-button-big").removeAttr("disabled");
            }
        }
    },
    watch: {
        disabledbuttons: function () {
            this.disableRequestedButtons();
        }
    },
    mounted: function () {
        this.disableRequestedButtons();
    }
}
</script>
<style scoped>
.buttons-container {
    display: flex;
    flex-wrap: wrap;
}
</style>