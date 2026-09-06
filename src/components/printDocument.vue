<template>
    <div class="print-document">
        <div class="doc-header" v-if="doc.title || doc.subtitle || (doc.meta && doc.meta.length)">
            <h2 v-if="doc.title">{{ doc.title }}</h2>
            <h3 v-if="doc.subtitle">{{ doc.subtitle }}</h3>
            <div class="doc-meta" v-if="doc.meta && doc.meta.length">
                <span v-for="(item, index) in doc.meta" :key="index">
                    <strong>{{ item.label }}:</strong> {{ item.value }}
                </span>
            </div>
        </div>

        <template v-for="(block, index) in doc.blocks || []">
            <component :is="'h' + (block.level || 2)" class="doc-heading" v-if="block.type === 'heading'" :key="'h' + index">
                {{ block.text }}
            </component>

            <div class="doc-keyvalue" v-else-if="block.type === 'keyValue'" :key="'kv' + index">
                <div class="doc-keyvalue-row" v-for="(item, i) in block.items" :key="i">
                    <span class="doc-keyvalue-label">{{ item.label }}</span>
                    <span class="doc-keyvalue-value">{{ item.value }}</span>
                </div>
            </div>

            <p class="doc-text" :class="{ 'doc-text-emphasis': block.emphasis }" v-else-if="block.type === 'text'" :key="'t' + index">
                {{ block.content }}
            </p>

            <div class="doc-image" v-else-if="block.type === 'image'" :key="'i' + index">
                <img :src="block.src" :style="{ maxHeight: (block.maxHeight || '400px') }" />
            </div>

            <table class="doc-table" v-else-if="block.type === 'table'" :key="'tb' + index">
                <thead>
                    <tr>
                        <th v-for="(col, i) in block.columns" :key="i">{{ col }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, r) in block.rows" :key="r">
                        <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="doc-checklist" v-else-if="block.type === 'checklist'" :key="'cl' + index">
                <div class="checklist-item" v-for="(item, i) in block.items" :key="i">
                    <div class="checklist-checkbox">☐</div>
                    <div class="checklist-photo" v-if="options.photos !== false">
                        <img v-if="item.image" :src="item.image" />
                        <div v-else class="checklist-photo-placeholder">{{ (item.title || '?').charAt(0).toUpperCase() }}</div>
                    </div>
                    <div class="checklist-info">
                        <p class="checklist-title">{{ item.title }}</p>
                        <p class="checklist-note" v-if="item.note">Obs: {{ item.note }}</p>
                    </div>
                    <div class="checklist-quantity-box">
                        <span>{{ item.quantity }}</span>
                        <small v-if="item.unit">{{ item.unit }}</small>
                    </div>
                    <div
                        class="checklist-badge"
                        :class="'checklist-badge-' + (item.badge.type || 'warning')"
                        v-if="item.badge"
                    >
                        {{ item.badge.icon || '⚠' }} {{ item.badge.text }}
                    </div>
                </div>
            </div>

            <div class="doc-signature" v-else-if="block.type === 'signature'" :key="'s' + index">
                <span class="doc-signature-line"></span>
                <span class="doc-signature-label">{{ block.label }}</span>
            </div>

            <div class="doc-page-break" v-else-if="block.type === 'pageBreak'" :key="'pb' + index"></div>
        </template>

        <div class="doc-footer" v-if="doc.footer">
            <div class="doc-signature" v-if="doc.footer.signature">
                <span class="doc-signature-line"></span>
                <span class="doc-signature-label">{{ doc.footer.signature }}</span>
            </div>
            <p class="doc-footer-text" v-if="doc.footer.text">{{ doc.footer.text }}</p>
        </div>
    </div>
</template>
<script>
export default {
    name: "printDocument",
    props: {
        doc: { type: Object, required: true },
        options: { type: Object, default: () => ({}) }
    }
}
</script>
<style scoped>
.print-document {
    font-size: 16px;
    color: #000;
}

.doc-header {
    margin-bottom: 16px;
    text-align: center;
}

.doc-header h2 {
    font-size: 1.4em;
    margin: 0;
}

.doc-header h3 {
    font-size: 1.1em;
    margin: 4px 0 0;
    font-weight: 500;
}

.doc-meta {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 8px;
    font-size: 0.85em;
    flex-wrap: wrap;
}

.doc-heading {
    margin: 16px 0 8px;
    border-bottom: 1px solid #000;
    padding-bottom: 4px;
}

.doc-keyvalue {
    margin-bottom: 12px;
}

.doc-keyvalue-row {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
}

.doc-text {
    margin: 8px 0;
}

.doc-text-emphasis {
    font-weight: 700;
}

.doc-image {
    text-align: center;
    margin: 12px 0;
}

.doc-image img {
    max-width: 100%;
}

.doc-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
}

.doc-table th, .doc-table td {
    border: 1px solid #000;
    padding: 4px 8px;
    text-align: left;
}

.doc-checklist {
    margin: 8px 0;
}

.checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px dashed #000;
    page-break-inside: avoid;
}

.checklist-checkbox {
    font-size: 1.4em;
    line-height: 1;
    flex-shrink: 0;
}

.checklist-photo {
    width: 2cm;
    height: 2cm;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #000;
    overflow: hidden;
}

.checklist-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.checklist-photo-placeholder {
    font-size: 1.6em;
    font-weight: 700;
}

.checklist-info {
    flex: 1;
    min-width: 0;
}

.checklist-title {
    font-weight: 700;
    font-size: 1.1em;
    margin: 0;
    text-transform: uppercase;
}

.checklist-note {
    margin: 4px 0 0;
    font-size: 0.9em;
}

.checklist-quantity-box {
    flex-shrink: 0;
    border: 2px solid #000;
    border-radius: 4px;
    padding: 4px 10px;
    text-align: center;
    min-width: 56px;
}

.checklist-quantity-box span {
    display: block;
    font-size: 1.5em;
    font-weight: 700;
    line-height: 1;
}

.checklist-quantity-box small {
    font-size: 0.7em;
}

.checklist-badge {
    flex-basis: 100%;
    border: 2px solid #000;
    border-radius: 4px;
    padding: 6px 10px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.95em;
}

.doc-signature {
    margin-top: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.doc-signature-line {
    flex: 1;
    border-bottom: 1px solid #000;
    height: 1px;
}

.doc-signature-label {
    white-space: nowrap;
    font-size: 0.85em;
}

.doc-footer {
    margin-top: 20px;
}

.doc-footer-text {
    text-align: center;
    font-size: 0.85em;
    margin-top: 8px;
}

.doc-page-break {
    page-break-after: always;
    break-after: page;
}
</style>
