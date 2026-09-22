<template>
    <div class="input-search-container">
        <span class="material-icons input-search-icon">search</span>
        <input type="text" class="input-search-field" :placeholder="'Procure um ' + searchText" v-model="inputData">
    </div>
</template>
<script>
export default {
    props: ["searchText", "search"],
    data() {
        return {
            inputData: this.search
        }
    },
    watch: {
        inputData: function () {
            this.$emit("input", this.inputData);
            this.$emit("model", this.inputData);
        },
        search: function (newVal) {
            this.inputData = newVal;
        }
    }
}
</script>
<style scoped>
    .input-search-container {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: var(--space-4, 12px);
    }
    .input-search-icon {
        position: absolute;
        left: 14px;
        font-size: 20px;
        color: var(--ink-soft, #8C8275);
        pointer-events: none;
        user-select: none;
    }
    .input-search-field {
        width: 100%;
        padding-left: 42px !important;
    }
</style>
