<template>
    <div class="system-data config-page">
        <form @submit.prevent="saveContent()" id="system-data-form">
            <div class="box">
                <h3>Preferências do sistema</h3>
                <div class="form-group">
                    <input type="checkbox" id="items-live" v-model="preferences.produtos_no_app">
                    <label for="items-live">Disponibilizar produtos no app</label>
                </div>
                <div class="footer">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-gray" v-on:click="cancel()">Cancelar</button>
                </div>
            </div>
        </form>
        <p class="response">{{ response }}</p>
    </div>
</template>

<script>
import { globalMethods } from '@/js/globalMethods';
import api from "../../configs/api.js";

export default {
    name: "systemData",
    mixins: [globalMethods],
    data() {
        return {
            preferences: {
                produtos_no_app: false
            }
        }
    },
    methods: {
        returnPreferences: function () {
            let self = this;
            api.get("/companies/preferences").then((response) => {
                const preferencesFromApi = response.data.returnObj;

                Object.keys(self.preferences).forEach(key => self.preferences[key] = false);

                preferencesFromApi.forEach(p => {
                    if (Object.prototype.hasOwnProperty.call(self.preferences, p.nome)) {
                        self.preferences[p.nome] = true;
                    }
                });
            });
        },
        saveContent: function () {
            let self = this;
            api.patch("/companies/preferences", { preferences: this.preferences }).then(() => {
                self.setResponse("Informações atualizadas com sucesso", "success");
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            });
        }
    },
    mounted: function () {
        this.returnPreferences();
    }
}
</script>
<style scoped>
.form-group {
    flex-direction: row;
    gap: var(--space-3);
}

.box {
    margin: var(--space-3) 0;
    padding: var(--space-3);
    border: 1px solid var(--gray-high);
    border-radius: var(--radius-sm);
}
</style>