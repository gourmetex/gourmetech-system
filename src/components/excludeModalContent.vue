<template>
    <div class="exclude-modal-content">
        <div class="exclude-icon">
            <span class="material-icons">delete</span>
        </div>
        <div class="texts">
            <h2 class="font-bold">Tem certeza que deseja excluir?</h2>
            <h3>Essa ação é irreversível</h3>
        </div>
        <p class="response big">{{ response }}</p>
        <input type="submit" id="submit-button" v-on:click="deleteItem()" style="display: none;">
    </div>
</template>
<script>
import api from "../configs/api";
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "excludeModalContent",
    mixins: [globalMethods],
    props: ["excludepath"],
    data() {
        return {
            response: ""
        }
    },
    methods: {
        deleteItem: function () {
            let self = this;

            api.delete(self.excludepath).then(() => {
                self.$emit("excludedContent", true);
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            }).then(() => {
                setTimeout(() => {
                    self.$emit("excludedContent", true);
                }, 5000)
            })
        }
    }
}
</script>
<style scoped>

.exclude-modal-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    height: 100%;
}

.exclude-icon {
    background: var(--red-high);
    width: 80px;
    height: 80px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-5);
}

    .exclude-icon span {
        font-size: 45px;
        color: var(--red);
    }
</style>