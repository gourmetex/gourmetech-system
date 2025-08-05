<template>
    <div class="modal">
        <div class="modal-container" :class="confirm ? 'small' : ''">
            <div class="modal-header">
                <h2 class="font-bold">{{ modaltitle }}</h2>
                <span class="material-icons" v-on:click="handleCloseModalContent()">close</span>
            </div>
            <div class="modal-body">
                <div v-if="edit && !confirm">
                    <slot />
                </div>
                <div v-if="confirm">
                    <h2 class="text-center">{{ confirmtext }}</h2>
                </div>
                <div v-if="!edit && !confirm">
                    <excludeModalContent :excludepath="excludepath" @excludedContent="handleCloseModalContent()"></excludeModalContent>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-blue" v-if="modalButton3 != '' && modalButton3 != null" id="modal-save-submit-button" v-on:click="saveAndSubmitInformations()">{{ modalButton3 }}</button>
                <button class="btn" :class="chooseBtnClass()" id="modal-submit-button" v-if="modalbutton1 != ''" v-on:click="submitInformations()">{{ modalbutton1 }}</button>
                <button class="btn btn-gray" v-if="modalbutton2 != ''" v-on:click="handleCloseModalContent()">{{ modalbutton2 }}</button>
            </div>
        </div>
        <div class="modal-overlay" v-on:click="handleCloseModalContent()"></div>
    </div>
</template>
<script>
import $ from 'jquery';
import excludeModalContent from "./excludeModalContent.vue";

export default {
    name: "modalComponent",
    props: ["modaltitle", "modalbutton1", "modalbutton2", "modalButton3", "excludepath", "confirm", "confirmtext"],
    data() {
        return {
            edit: true
        }
    },
    methods: {
        checkModalType: function () {
            if (this.modaltitle.indexOf("Excluir") != -1 || this.modaltitle.indexOf("Cancelar") != -1) {
                this.edit = false;
            }
        },
        chooseBtnClass: function () {
            if (!this.edit) {
                return "btn-red";
            }
            return "btn-primary";
        },
        showModalContent: function () {
            let modal = $(".modal-container");
            modal.css("opacity", 1).css("transform", "translateY(0)");
        },
        handleCloseModalContent: function () {
            let modal = $(".modal-container");
            modal.css("opacity", 0).css("transform", "translateY(-20vh)");

            setTimeout(() => {
                this.$emit("closeModal", true);
            }, 400)
        },
        submitInformations: function () {
            let modalButton1 = $("#modal-submit-button");
            let modalButton2 = $("#modal-save-submit-button");
            modalButton1.attr("disabled", "disabled").addClass("btn-loading");
            modalButton2.attr("disabled", "disabled").addClass("btn-loading");

            $("#submit_type").val("save");
            $("#submit-button").click();

            if (this.confirm) {
                this.$emit("closeModal", true);
                this.$emit("confirmCallback");
            }
        },
        saveAndSubmitInformations: function () {
            let modalButton1 = $("#modal-submit-button");
            let modalButton2 = $("#modal-save-submit-button");
            modalButton1.attr("disabled", "disabled").addClass("btn-loading");
            modalButton2.attr("disabled", "disabled").addClass("btn-loading");

            $("#submit_type").val("finish");
            $("#submit-button").click();
        }
    },
    mounted: function () {
        setTimeout(() => {
            this.showModalContent();
            this.checkModalType();
        }, 1)

        let submitButton = $("#submit-button");

        submitButton.off("click");

        submitButton.on("click", () => {
            let informationsForm = $("#informations-form");

            if (informationsForm.find(":invalid").length > 0) {
                let modalButton = $("#modal-submit-button");
                modalButton.removeAttr("disabled").removeClass("btn-loading");
            }
        })
    },
    components: {
        excludeModalContent
    }
}
</script>
<style scoped>

.modal, .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.modal {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    background: var(--overlay);
    z-index: 1;
}

.modal-container {
    z-index: 2;
    background: var(--white);
    border-radius: var(--radius-sm);
    box-shadow: var(--boxshadow-default);
    width: 95%;
    height: 95%;
    max-width: 700px;
    max-height: 600px;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: opacity 0.4s, transform 0.4s;
    transform: translateY(-20vh);
    opacity: 0;

    &.small {
        max-height: 300px;
    }
}

.modal-header, .modal-body, .modal-footer {
    padding: var(--space-5) var(--space-6);
}

.modal-header, .modal-footer {
    flex: 0 0 auto;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--gray-high);
}

.modal-body {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
}

.modal-body > div {
    height: 100%;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--gray-high);
}

    .modal-header span {
        cursor: pointer;
        border-radius: var(--radius-full);
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

        .modal-header span:hover {
            background: var(--gray-3);
        }
</style>