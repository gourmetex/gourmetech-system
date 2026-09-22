<template>
    <div class="action-buttons-component">
        <div class="buttons-container">
            <button class="btn btn-primary action-button" v-if="add_text" :disabled="isDisabled(1)" @click="add">
                <span class="material-icons">{{ chooseAddIcon() }}</span>{{ add_text }}
            </button>
            <button class="btn btn-danger action-button" v-if="exclude_text" :disabled="isDisabled(2)" @click="exclude">
                <span class="material-icons">{{ exclude_icon || "close" }}</span>{{ exclude_text }}
            </button>
            <button class="btn btn-secondary action-button" v-if="edit_text" :disabled="isDisabled(3)" @click="edit">
                <span class="material-icons">{{ edit_icon || "edit" }}</span>{{ edit_text }}
            </button>
            <slot></slot>
        </div>  
    </div>
</template>
<script>
export default {
    name: "actionButtonsComponent",
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
        isDisabled(index) { return Array.isArray(this.disabledbuttons) && this.disabledbuttons.includes(index); }
    }
}
</script>
<style scoped>
.buttons-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
}
.action-button { gap: 8px; margin: 0; min-width: 0; }
</style>
