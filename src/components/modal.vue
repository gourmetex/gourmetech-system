<template>
    <div class="modal">
        <div class="modal-container" :class="confirm ? 'small' : ''">
            <div class="modal-header">
                <h2 class="font-bold">{{ modaltitle }}</h2>
                <span class="material-icons" v-on:click="handleCloseModalContent()">close</span>
            </div>
            <div class="modal-body">
                <div v-if="isDefault && !confirm">
                    <slot />
                </div>
                <div v-if="confirm" class="modal-confirm-body">
                    <p class="modal-confirm-text">{{ confirmtext }}</p>
                </div>
                <div v-if="isDelete && !confirm">
                    <excludeModalContent :excludepath="excludepath" @excludedContent="handleCloseModalContent()"></excludeModalContent>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" v-if="modalButton3 != '' && modalButton3 != null" id="modal-save-submit-button" v-on:click="saveAndSubmitInformations()">{{ modalButton3 }}</button>
                <button class="btn" :class="chooseBtnClass()" id="modal-submit-button" v-if="modalbutton1 != ''" v-on:click="submitInformations()">{{ modalbutton1 }}</button>
                <button class="btn btn-gray" v-if="modalbutton2 != ''" v-on:click="handleCloseModalContent()">{{ modalbutton2 }}</button>
            </div>
        </div>
        <div class="modal-overlay" v-on:click="handleCloseModalContent()"></div>
    </div>
</template>
<script>
import excludeModalContent from "./excludeModalContent.vue";

export default {
    name: "modalComponent",
    props: {
        modaltitle: String,
        modalbutton1: String,
        modalbutton2: String,
        modalButton3: String,
        excludepath: String,
        confirm: Boolean,
        confirmtext: String,
        variant: { type: String, default: 'default' }
    },
    computed: {
        hasDefaultContent() {
            return (this.$slots.default || []).some(node => node && !node.isComment && (node.tag || String(node.text || '').trim()));
        },
        isDelete() { return this.variant === 'delete' || (!this.confirm && Boolean(this.excludepath) && !this.hasDefaultContent); },
        isDefault() { return !this.isDelete; }
    },
    methods: {
        chooseBtnClass: function () {
            return this.isDelete ? "btn-danger" : "btn-primary";
        },
        showModalContent: function () {
            this.$el.querySelector('.modal-container').classList.add('visible');
        },
        handleCloseModalContent: function () {
            this.$el.querySelector('.modal-container').classList.remove('visible');

            setTimeout(() => {
                this.$emit("closeModal", true);
            }, 400)
        },
        submitInformations: function () {
            const modalButton1 = document.getElementById('modal-submit-button');
            const modalButton2 = document.getElementById('modal-save-submit-button');
            if (modalButton1) modalButton1.setAttribute('disabled', 'disabled');
            if (modalButton2) modalButton2.setAttribute('disabled', 'disabled');

            const submitType = document.getElementById('submit_type');
            if (submitType) submitType.value = 'save';
            const submitButton = document.getElementById('submit-button');
            if (submitButton) submitButton.click();

            if (this.confirm) {
                this.$emit("closeModal", true);
                this.$emit("confirmCallback");
            }
        },
        saveAndSubmitInformations: function () {
            const modalButton1 = document.getElementById('modal-submit-button');
            const modalButton2 = document.getElementById('modal-save-submit-button');
            if (modalButton1) modalButton1.setAttribute('disabled', 'disabled');
            if (modalButton2) modalButton2.setAttribute('disabled', 'disabled');
            const submitType = document.getElementById('submit_type');
            if (submitType) submitType.value = 'finish';
            const submitButton = document.getElementById('submit-button');
            if (submitButton) submitButton.click();
        }
    },
    mounted: function () {
        setTimeout(() => {
            this.showModalContent();
        }, 1)

        const submitButton = document.getElementById('submit-button');
        if (submitButton) submitButton.addEventListener('click', () => {
            const form = document.getElementById('informations-form');
            if (form && !form.checkValidity()) document.getElementById('modal-submit-button')?.removeAttribute('disabled');
        });
    },
    components: {
        excludeModalContent
    }
}
</script>
<style scoped>

.modal, .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.modal {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-overlay {
    background: var(--overlay, rgba(0, 0, 0, 0.5));
    backdrop-filter: blur(2px);
    z-index: 1;
}

.modal-container {
    z-index: 2;
    background: var(--surface, #FFFFFF);
    border-radius: var(--radius-m, 12px);
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04);
    width: 92%;
    max-width: 720px;
    max-height: calc(90vh - 30px);
    position: relative;
    display: flex;
    flex-direction: column;
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(-20px) scale(0.98);
    opacity: 0;

    &.visible {
        opacity: 1;
        transform: none;
    }

    &.small {
        max-width: 480px;
        max-height: 360px;
    }
}

.modal-header, .modal-footer {
    padding: var(--space-5, 16px) var(--space-6, 20px);
    flex: 0 0 auto;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--line, #E7E1D6);
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ink, #2B2620);
    margin: 0;
}

.modal-header span {
    cursor: pointer;
    border-radius: var(--radius-full, 50%);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink-soft, #6B6255);
    transition: background 0.15s, color 0.15s;
}

.modal-header span:hover {
    background: var(--paper, #F3F1ED);
    color: var(--ink, #2B2620);
}

.modal-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: var(--space-6, 20px);
    padding-bottom: var(--space-8, 32px);
}

.modal-body > div {
    min-height: 0;
}

.modal-confirm-body {
    padding: var(--space-6, 20px) var(--space-4, 12px);
    text-align: center;
}

.modal-confirm-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--ink, #2B2620);
    line-height: 1.5;
    margin: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--space-3, 8px);
    border-top: 1px solid var(--line, #E7E1D6);
    background: var(--surface, #FFFFFF);
    border-bottom-left-radius: var(--radius-m, 12px);
    border-bottom-right-radius: var(--radius-m, 12px);
}
</style>
