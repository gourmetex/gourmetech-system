<template>
    <div class="color-select-container">
        <div class="color-select" v-on:click="openColorSelect()">
            <div class="selected-color"></div>
            <span class="material-icons">arrow_drop_down</span>
        </div>
        <div class="colors-list">
            <div class="color" v-for="(color, index) in colors" :key="index" :style="'background: ' + color.cor + '; color: ' + getContrastColorFromCssVariable(color.cor)" :colorid="color?.id" v-on:click="select(color)">{{ color.text ? color.text : '' }}</div>
        </div>
        <div class="color-list-wrapper" v-on:click="closeColorSelect()"></div>
    </div>
</template>
<script>
import $ from 'jquery';
import { globalMethods } from '@/js/globalMethods';

export default {
    name: "colorSelect",
    mixins: [globalMethods],
    props: ["colors", "selectedcolor"],
    watch: {
        selectedcolor: function () {
            this.chooseSelectedColor();
        }
    },
    methods: {
        chooseSelectedColor: function () {
            let color = "#fff";  

            if (this.selectedcolor != null && this.colors.length) {
                let filteredColor = this.colors.find(obj => obj.id == this.selectedcolor);
                color = filteredColor.cor;
            }

            $(".selected-color").css("background", color);
        },
        openColorSelect: function () {
            let list = $(".colors-list");
            let listWrapper = $(".color-list-wrapper");
            list.css("display", "flex");
            listWrapper.show();
        },
        closeColorSelect: function () {
            let list = $(".colors-list");
            let listWrapper = $(".color-list-wrapper");
            list.hide();
            listWrapper.hide();
        },
        select: function (color) {
            this.$emit("select", color);
            this.closeColorSelect();
        }
    },
    mounted: function () {
        this.chooseSelectedColor();
    }
}
</script>
<style scoped>
.color-select-container {
    height: fit-content;
    position: relative;
}

.colors-list, .color, .selected-color {
    height: 100%;
    width: 100%;
    border-radius: var(--radius-sm);
}

.selected-color {
    margin-right: var(--space-3);
    height: 70%;
    width: 95%;
    margin-left: 5px;
}

.colors-list {
    position: absolute;
    padding: var(--space-3);
    display: none;
    background: var(--white);
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    padding: var(--space-3);
    flex-direction: column;
    height: 150px;
    overflow-y: auto;
    top: 100%;
    border: 1px solid var(--gray-2);
    border-top: none;
    z-index: 2;
}

.color-select {
    display: flex;
    align-items: center;
    border: 1px solid var(--gray-2);
    border-radius: var(--radius-sm);
    height: 42px;
    position: relative;
    cursor: pointer;
}

.color {
    margin: var(--space-2) 0;
    min-height: 35px !important;
    position: relative;
    z-index: 3;
    cursor: pointer;
    display: grid;
    place-items: center;
}

.color-list-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 67vh;
    z-index: 1;
    background: transparent;
    display: none;
    cursor: default;
}
</style>