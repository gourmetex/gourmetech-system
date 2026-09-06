<template>
    <div class="print-out">
        <div class="print-out-app" v-if="doc">
            <!-- Cabecalho do wizard: nao imprime -->
            <div class="wizard-header no-print">
                <h1>Imprimir</h1>
                <div class="wizard-steps">
                    <span :class="{ active: step === 'conferir' }">1. Conferir</span>
                    <span :class="{ active: step === 'opcoes' }">2. Opções</span>
                    <span :class="{ active: step === 'imprimir' }">3. Imprimir</span>
                </div>
            </div>

            <!-- PASSO 1: conferir -->
            <div v-if="step === 'conferir'" class="no-print">
                <div class="print-preview-frame">
                    <printDocument :doc="doc" :options="options" />
                </div>
                <div class="wizard-actions">
                    <button class="btn btn-gray" @click="goBack">Voltar</button>
                    <button class="btn btn-primary" @click="step = 'opcoes'">Continuar</button>
                </div>
            </div>

            <!-- PASSO 2: opcoes -->
            <div v-if="step === 'opcoes'" class="no-print">
                <div class="print-options">
                    <div class="info-group">
                        <h3>Papel</h3>
                        <label class="option-label" v-for="paper in paperOptions" :key="paper.value">
                            <input type="radio" :value="paper.value" v-model="options.paper" />
                            <span>{{ paper.label }}</span>
                        </label>
                    </div>
                    <div class="info-group">
                        <h3>Fotos</h3>
                        <label class="option-label">
                            <input type="checkbox" v-model="options.photos" />
                            <span>Incluir fotos dos itens (impressão térmica com foto é mais lenta)</span>
                        </label>
                    </div>
                    <div class="info-group">
                        <h3>Cópias</h3>
                        <input type="number" class="input-form" min="1" max="20" v-model.number="options.copies" />
                    </div>
                </div>
                <div class="wizard-actions">
                    <button class="btn btn-gray" @click="step = 'conferir'">Voltar</button>
                    <button class="btn btn-primary" @click="goToPrint">Continuar</button>
                </div>
            </div>

            <!-- PASSO 3: imprimir -->
            <div v-if="step === 'imprimir'">
                <div class="no-print wizard-actions wizard-actions-top">
                    <button class="btn btn-gray" @click="step = 'opcoes'">Voltar</button>
                    <button class="btn btn-primary" @click="triggerPrint">
                        <span class="material-icons">print</span>
                        Imprimir agora
                    </button>
                </div>
                <div class="print-preview-frame print-area" :class="'paper-' + paperClass">
                    <printDocument
                        v-for="copyIndex in options.copies"
                        :key="copyIndex"
                        :doc="doc"
                        :options="options"
                        class="print-copy"
                    />
                </div>
            </div>
        </div>

        <div class="print-out-empty no-print" v-else>
            <h2>Nada para imprimir</h2>
            <p>Abra a impressão a partir da tela de origem (ex.: fila da cozinha, QR Code da mesa).</p>
            <button class="btn btn-primary" @click="goBack">Voltar</button>
        </div>
    </div>
</template>
<script>
import { printService } from "@/js/printService";
import printDocument from "./printDocument.vue";

// D.15: papel sugerido pelo chamador (doc.paper) e so um ponto de partida - a loja pode
// trocar no passo 2, a impressora de verdade e quem manda.
const VALID_PAPERS = ["58mm", "80mm", "A4"];

export default {
    name: "printOut",
    components: {
        printDocument
    },
    data() {
        return {
            doc: null,
            step: "conferir",
            options: {
                paper: "80mm",
                photos: true,
                copies: 1
            }
        }
    },
    computed: {
        paperOptions() {
            return [
                { value: "58mm", label: "58mm (bobina pequena)" },
                { value: "80mm", label: "80mm (bobina padrão)" },
                { value: "A4", label: "A4 (folha comum)" }
            ];
        },
        paperClass() {
            return (this.options.paper || "80mm").toLowerCase();
        }
    },
    methods: {
        goBack() {
            printService.clear();
            this.$router.back();
        },
        goToPrint() {
            this.step = "imprimir";
        },
        triggerPrint() {
            this.$nextTick(() => {
                window.print();
            });
        },
        // Compatibilidade (D.15): se nao veio doc pelo printService, tenta montar um a
        // partir de ?image= na querystring - o unico chamador disso ainda e o QR Code de
        // mesa (editTablesModalContent.vue), que continua funcionando sem alteração.
        loadDocument() {
            if (printService.doc) {
                this.doc = printService.doc;
                if (this.doc.paper && VALID_PAPERS.includes(this.doc.paper)) {
                    this.options.paper = this.doc.paper;
                }
                if (this.doc.options) {
                    this.options = { ...this.options, ...this.doc.options };
                }
                return;
            }

            const query = new URLSearchParams(window.location.search);
            const image = query.get("image");

            if (image) {
                this.doc = {
                    title: "Imprimir",
                    blocks: [{ type: "image", src: decodeURIComponent(image) }]
                };
            }
        }
    },
    mounted: function () {
        this.loadDocument();
    }
}
</script>
<style scoped>
.wizard-header {
    margin-bottom: var(--space-6);
}

.wizard-steps {
    display: flex;
    gap: var(--space-5);
    margin-top: var(--space-3);
}

.wizard-steps span {
    opacity: 0.5;
    font-weight: 600;
}

.wizard-steps span.active {
    opacity: 1;
    color: var(--primary, #23967F);
}

.print-preview-frame {
    background: var(--white);
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-md);
    padding: var(--space-6);
    margin-bottom: var(--space-6);
}

.print-options .info-group {
    margin-bottom: var(--space-5);
}

.option-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
    cursor: pointer;
}

.wizard-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-4);
}

.wizard-actions-top {
    margin-bottom: var(--space-5);
}

.wizard-actions button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
}

.print-out-empty {
    text-align: center;
    margin-top: var(--space-8);
}

.print-copy + .print-copy {
    margin-top: var(--space-6);
}

@media print {
    .no-print {
        display: none !important;
    }

    .print-preview-frame {
        border: none;
        padding: 0;
        margin: 0;
    }

    .paper-58mm, .paper-80mm {
        width: 100%;
    }
}
</style>
