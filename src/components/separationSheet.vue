<template>
    <div class="separation-document">
        <section v-for="sheet in sheets" :key="sheet.comanda.id" class="separation-sheet">
            <header class="sheet-header">
                <div class="sheet-kicker">LISTA DE SEPARAÇÃO</div>
                <div class="sheet-order">Pedido <strong>#{{ sheet.comanda.id }}</strong></div>
                <div class="sheet-meta"><span>Cliente</span><strong>{{ sheet.comanda.nome_cliente || 'Não informado' }}</strong></div>
                <div class="sheet-meta"><span>Destino</span><strong>{{ destination(sheet.comanda) }}</strong></div>
                <div class="sheet-meta"><span>Origem</span><strong>{{ Number(sheet.comanda.from_app) === 1 ? 'Aplicativo' : 'Balcão' }}</strong></div>
            </header>
            <div class="items-heading"><strong>ITENS PARA SEPARAR</strong><span>{{ sheet.itens.length }} {{ sheet.itens.length === 1 ? 'item' : 'itens' }}</span></div>
            <div class="sheet-item" :class="{ 'has-photo': item.imagem }" v-for="(item, itemIndex) in sheet.itens" :key="item.id || itemIndex">
                <span class="item-checkbox" aria-hidden="true"></span>
                <img v-if="item.imagem" class="item-photo" :src="item.imagem" :alt="'Foto de ' + item.nome" />
                <div class="item-details">
                    <strong class="item-name">{{ item.nome }}</strong>
                    <div v-if="item.observacoes" class="item-note"><strong>Observação:</strong> {{ item.observacoes }}</div>
                    <div v-if="substitutionMessage(item)" class="item-alert"><strong>Se não tiver:</strong> {{ substitutionMessage(item) }}</div>
                </div>
                <div class="item-quantity"><strong>{{ item.quantidade }}</strong><span>{{ item.unidade || 'un' }}</span></div>
            </div>
            <p v-if="!sheet.itens.length" class="no-items">Nenhum item disponível para separação.</p>
            <footer class="sheet-footer">
                <p>Confira os itens antes de fechar a sacola.</p>
                <div class="signature">Separado por: <span></span></div>
            </footer>
        </section>
    </div>
</template>
<script>
export default {
    name: 'separationSheet',
    props: { sheets: { type: Array, required: true } },
    methods: {
        destination(order) {
            if (Number(order.tem_entrega) === 1) return 'Entrega';
            if (order.mesa) return 'Mesa ' + order.mesa;
            return 'Balcão';
        },
        substitutionMessage(item) {
            if (item.preferencia_indisponivel === 'cancelar') return 'não levar substituto';
            if (item.substituto && item.substituto.nome) return 'levar ' + item.substituto.nome;
            if (item.preferencia_indisponivel === 'similar') return 'escolher um produto similar';
            return '';
        }
    }
};
</script>
<style scoped>
.separation-document { color: #111; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.35; }
.separation-sheet { background: #fff; padding: 24px; max-width: 720px; margin: 0 auto 24px; border: 1px solid #d6d6d6; box-sizing: border-box; }
.sheet-header { border-bottom: 2px solid #222; padding-bottom: 12px; }
.sheet-kicker { font-size: 11px; letter-spacing: .08em; font-weight: 700; }
.sheet-order { margin: 4px 0 10px; font-size: 20px; }
.sheet-order strong { font-size: 26px; }
.sheet-meta { display: flex; align-items: baseline; gap: 12px; margin: 3px 0; }
.sheet-meta span { min-width: 50px; color: #555; }
.sheet-meta strong { overflow-wrap: anywhere; }
.items-heading { display: flex; justify-content: space-between; gap: 8px; padding: 12px 0 8px; border-bottom: 1px solid #888; font-size: 11px; }
.items-heading span { color: #555; white-space: nowrap; }
.sheet-item { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 12px 0; border-bottom: 1px solid #ccc; break-inside: avoid; page-break-inside: avoid; }
.sheet-item.has-photo { grid-template-columns: 18px 44px minmax(0, 1fr) auto; }
.item-photo { width: 44px; height: 44px; object-fit: cover; border: 1px solid #bbb; box-sizing: border-box; }
.item-checkbox { width: 15px; height: 15px; border: 1.5px solid #111; box-sizing: border-box; margin-top: 2px; }
.item-details { min-width: 0; overflow-wrap: anywhere; }
.item-name { font-size: 14px; }
.item-note, .item-alert { margin-top: 5px; font-size: 11px; white-space: pre-wrap; }
.item-alert { border-left: 2px solid #111; padding-left: 6px; }
.item-quantity { display: flex; align-items: baseline; gap: 3px; white-space: nowrap; }
.item-quantity strong { font-size: 17px; }
.item-quantity span { font-size: 11px; }
.sheet-footer { padding-top: 12px; font-size: 11px; break-inside: avoid; page-break-inside: avoid; }
.sheet-footer p { margin: 0; }
.signature { display: flex; align-items: flex-end; gap: 8px; margin-top: 22px; }
.signature span { display: block; flex: 1; border-bottom: 1px solid #111; }
.no-items { margin: 12px 0; }
@media print {
    .separation-sheet { max-width: none; padding: 0; margin: 0; border: 0; }
    .separation-sheet + .separation-sheet { break-before: page; page-break-before: always; }
}
</style>
