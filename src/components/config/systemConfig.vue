<template>
    <div class="system-config">
        <div class="config-section">
            <div class="photo-container">
                <div class="photo-section">
                    <label>Logomarca</label>
                    <div class="image-container">
                        <form @submit.prevent="uploadPhoto(formData)" method="post" enctype="multipart/form-data">
                            <img :src="$root.company.logo_url">
                            <input type="file" name="photo" id="photo" @change.prevent="preSendPhoto($event)" title="Envie uma foto nos formatos PNG ou JPG">
                            <button type="button" class="btn btn-primary" v-on:click="clickInInputFile()">Alterar</button>
                            <input type="submit" id="submit-form" style="display: none;">
                        </form>
                    </div>
                </div>
                <div class="photo-section">
                    <label>Icone</label>
                    <div class="image-container">
                        <form @submit.prevent="uploadPhoto(formData, true)" method="post" enctype="multipart/form-data">
                            <img :src="$root.company.icone">
                            <input type="file" name="icon" id="icon" @change.prevent="preSendPhoto($event, true)" title="Envie uma foto nos formatos PNG ou JPG">
                            <button type="button" class="btn btn-primary" v-on:click="clickInInputFile(true)">Alterar</button>
                            <input type="submit" id="submit-form-icon" style="display: none;">
                        </form>
                    </div>
                </div>
            </div>
            <form @submit.prevent="saveTheme()" id="system-theme-form">
                <div class="form-group">
                    <label for="theme">Temas disponíveis</label>
                    <colorSelect v-if="themes.length" :colors="themes" @select="selectedTheme = $event" :selectedcolor="selectedTheme?.id" style="min-width: 200px;" />
                </div>
                <div class="form-group">
                    <label>Pré visualização</label>
                    <span id="tema-selecionado">Tema selecionado: {{ selectedTheme?.nome }}</span>
                    <div class="system-preview">
                        <div class="menu-superior" :style="'background: ' + selectedTheme?.cor_background + '; color: ' + selectedTheme?.cor_label">
                            <div class="logo">Logo</div>
                        </div>
                        <div class="menu-lateral" :style="'background: ' + selectedTheme?.cor_background + '; color: ' + selectedTheme?.cor_label">
                            <ul>
                                <li>Menu item 1</li>
                                <li class="hover" :style="'background: ' + selectedTheme?.cor_destaque + '; color: ' + selectedTheme?.cor_label_hover">Menu item 2</li>
                                <li>Menu item 3</li>
                            </ul>
                        </div>
                        <div class="conteudo-sistema">
                            <div>
                                <span class="material-icons">computer</span>
                                <span>Conteúdo do sistema</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </form>
            <div class="response">{{ response }}</div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '@/js/globalMethods';
import api from "../../configs/api.js";
import $ from 'jquery';
import colorSelect from "../colorSelect.vue";

export default {
    name: "systemConfig",
    mixins: [globalMethods],
    data() {
        return {
            themes: [],
            selectedTheme: null
        }
    },
    methods: {
        preSendPhoto: function (event, icon = false) {
            let self = this;
            let file = event.target.files.item(0);

            self.formData = new FormData;
            self.resetResponse();

            if (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") { // Se o arquivo tiver um desses formatos (PNG, JPG E JPEG), a imagem é exibida no modal e é permitida a requisição para o servidor, se não aparece a mensagem (arquivo não suportado).
                let adress = new FileReader();

                self.formData.set("company_image", file);
                adress.readAsDataURL(file);

                if (icon) {
                    $("#submit-form-icon").click();
                } else {
                    $("#submit-form").click();
                }
            } else {
                self.setResponse("Tipo de arquivo não suportado", "error");
            }
        },
        uploadPhoto: function (formData, icon = false) {
            let self = this;

            self.resetResponse();

            api.patch("/companies/change_photo" + (icon ? "?icone=1" : ""), formData)
            .then(function () { 
                location.reload();
            })
            .catch(function (error) {
                self.setResponse(error.response.data, "error");
            })
        },
        clickInInputFile: function (icon = false) {
            if (icon) {
                $("#icon").click();
            } else {
                $("#photo").click();
            }
        },
        saveTheme: function () {
            let self = this;
            let data = {
                theme: self.selectedTheme.id
            }

            api.patch("/companies/theme", data).then((response) => {
                self.themes = response.data.returnObj;
                self.setResponse(response.data.message, "success");
                location.reload();
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        },
        returnThemes: function () {
            let self = this;

            api.get("/companies/themes").then((response) => {
                self.themes = response.data.returnObj;
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            })
        },
        returnSelectedTheme: function () {
            let self = this;

            api.get("/companies/theme").then((response) => {
                self.selectedTheme = response.data.returnObj;
            })
        }
    },
    mounted: function () {
        this.returnThemes();
        this.returnSelectedTheme();
    },
    components: {
        colorSelect
    }
}
</script>
<style scoped>

.photo-container {
    display: flex;
    gap: var(--space-6);
}

.system-config {
    width: 100%;
    height: 100%;
}

input[type="file"] {
    display: none;
}

.image-container {
    margin: var(--space-2);
    display: flex;
    align-items: center;
}

    .image-container img {
        margin-right: var(--space-6);
        width: 200px;
        height: 200px;
        object-fit: contain;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        border: 1px dashed var(--blue);
        padding: var(--space-3);
    }

form {
    display: flex;
    align-items: center;
}

#system-theme-form {
    margin-top: var(--space-6);
    flex-direction: column;
    align-items: flex-start;
}

.system-preview {
    width: 500px;
    height: 350px;
    margin: var(--space-6) 0;
    position: relative;
    border-radius: var(--radius-md);
    border: 1px solid var(--gray);
    overflow: hidden;
}

.menu-superior {
    height: 30px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;

    & .logo {
        width: 120px;
        height: 100%;
        display: grid;
        place-content: center;
    }
}

.menu-lateral {
    height: calc(100% - 30px);
    position: absolute;
    top: 30px;
    left: 0;
    width: 120px;

    & ul, & li {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    & li {
        padding: var(--space-3) var(--space-3) var(--space-3) var(--space-6);
    }
}

.conteudo-sistema {
    width: calc(100% - 120px);
    position: absolute;
    left: 120px;
    top: 30px;
    height: calc(100% - 30px);
    background: var(--gray-high);
    display: flex;
    justify-content: center;

    & div {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: var(--space-8);
        height: fit-content;
        gap: 5px;
        color: var(--cinza-400);

        & span {
            font-size: var(--fontsize-md);
        }
    }
}
</style>