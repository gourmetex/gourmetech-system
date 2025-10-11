<template>
  <div class="datatable conteudo-principal" :style="!dataTable.length ? 'border: 1px solid #e0e0e0; margin-top: 1rem;' : ''
    " v-cloak>
    <!-- Mantém o slot invisível para leitura de colunas declarativas -->
    <div style="display: none">
      <slot></slot>
    </div>

    <!-- Estado: tabela vazia -->
    <div class="empty-datatable text-center" v-if="loaded && dataTable.length == 0">
      <h2>Não existem informações para exibir</h2>
    </div>

    <!-- Estado: carregando -->
    <div class="datatable-loading" v-show="!loaded && dataobj.length === 0">
      <lottie-player background="transparent" speed="1" loop autoplay></lottie-player>
    </div>

    <!-- Conteúdo principal da tabela -->
    <div class="datatable-content" v-if="dataTable.length > 0">
      <inputSearch v-if="searchText != ''" :search="searchQuery" @model="searchQuery = $event" @input="filterData"
        :searchText="searchText" />
      <div class="inner-table-content">
        <table class="table">
          <thead>
            <tr>
              <!-- Checkbox de seleção de todos -->
              <th v-if="selectitems === 'true'" style="width: 50px; text-align: center">
                <input type="checkbox" :checked="isAllSelected" class="custom-checkbox" @change="toggleSelectAll" />
              </th>

              <!-- Colunas -->
              <th v-for="col in columns" :key="col.prop" :style="{
                width: formatWidth(col.width),
                'white-space': 'normal',
              }" class="align-middle-important" :align="col.align || 'left'" :valign="col.valign || 'middle'" :class="{
                [`text-${col.align}`]: col.align,
                [`column-${col.prop}`]: col.prop,
                'th-content sortable': col.sortable == 'true',
                'sorting-asc':
                  sortDirection === 'asc' &&
                  toLower(sortColumnKey) === toLower(col.prop),
                'sorting-desc':
                  sortDirection === 'desc' &&
                  toLower(sortColumnKey) === toLower(col.prop),
              }" :aria-sort="ariaSort(col)" @click="col.sortable == 'true' ? sortData(col) : null">
                <!-- Cabeçalho -->
                <span v-if="!col.headerSlot" class="header-default">{{
                  col.label
                }}</span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, rIdx) in paginatedAndFilteredData" :key="item.id || rIdx">
              <!-- Checkbox por linha -->
              <td v-if="selectitems == 'true'" style="width: 50px">
                <input type="checkbox" class="custom-checkbox" :value="item" v-model="selectedItems" />
              </td>

              <!-- Células -->
              <td v-for="col in columns" :key="col.prop" :data-title="col.label" :align="col.align || 'left'"
                :valign="col.valign || 'middle'" :class="{
                  [`column-${col.prop}`]: col.prop,
                  [`text-${col.align}`]: col.align,
                  [`align-${col.valign}-important`]: col.valign,
                }">
                <template v-if="col.scopedSlot">
                  <column-cell :item="item" :render-fn="col.scopedSlot" />
                </template>
                <template v-else>
                  <span>{{ getByPath(item, col.prop) }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Rodapé: exportação + paginação -->
      <div class="data_grid_footer">
        <div style="width: 38px;">
          <button v-if="exportexcel == 'true'" @click="exportarParaExcel(exportoptions)"
            class="btn rounded-btn small control-button" type="button" title="Exportar para Excel">
            <i class="far fa-file-excel"></i>
          </button>
          &nbsp;
        </div>
        <div class="pagination" v-if="rowsperpage > 0">
          <button @click="prevPage" class="btn rounded-btn small" type="button" :disabled="currentPage === 1">
            <span class="material-icons">keyboard_arrow_left</span>
          </button>
          <span>Página <strong>{{ currentPage }}</strong> de
            {{ totalPages }}</span>
          <button @click="nextPage" class="btn rounded-btn small" type="button" :disabled="currentPage === totalPages">
            <span class="material-icons">keyboard_arrow_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import inputSearch from "./inputSearch.vue";
import { globalMethods } from "@/js/globalMethods";
import loadingJson from "../assets/animations/loading-component.json";

/**
 * VueDataGrid
 * Tabela genérica com suporte a:
 * - colunas declarativas (<grid-column>)
 * - paginação
 * - ordenação
 * - seleção de itens
 * - exportação Excel
 */
// eslint-disable-next-line
export const GridColumn = {
  name: "GridColumn",
  props: {
    prop: { type: String, required: true },
    label: { type: String, default: "" },
    sortable: { type: String, default: "true" },
    sortexpression: { type: Function, default: null },
    width: { type: String, default: "auto" },
    align: { type: String, default: "left" },
    valign: { type: String, default: "middle" },
    export: { type: String, default: "true" },
    order: { type: [String, Number], default: null },
  },
  render: (h) => h('span', { style: { display: 'none' } }),
};

// eslint-disable-next-line
const ColumnCell = {
  name: "ColumnCell",
  functional: true,
  props: ["item", "renderFn"],
  render: (h, ctx) => ctx.props.renderFn({ item: ctx.props.item }),
};

export default {
  name: "dataTable",

  props: {
    dataobj: { type: Array, required: true, default: () => [] },
    rowsperpage: { type: [Number, String], default: 0 },
    autogeneratecolumns: { type: String, default: "false" },
    exportexcel: { type: String, default: "false" },
    exportoptions: {
      type: Object,
      default: () => ({ filename: "relatorio", title: "Relatório" }),
    },
    selectitems: { type: String, default: "false" },
    searchText: { type: String, default: "" },
    searchable: { type: Boolean, default: true },
    loaded: { type: Boolean, default: false }
  },
  mixins: [globalMethods],
  data() {
    return {
      dataTable: [],
      filteredData: [],
      columns: [],
      currentPage: 1,
      sortColumnKey: null,
      sortDirection: "asc",
      selectedItems: [],
      columnsSignature: null,
      searchQuery: "",
    };
  },
  components: {
    inputSearch,
    ColumnCell
  },
  computed: {
    isAllSelected() {
      return (
        this.dataTable.length > 0 &&
        this.selectedItems.length === this.dataTable.length
      );
    },
    totalPages() {
      const rpp = parseInt(this.rowsperpage, 10);
      if (!rpp || rpp <= 0 || !this.dataTable.length) return 1;
      return Math.ceil(this.dataTable.length / rpp);
    },
    paginatedAndFilteredData() {
      const rpp = parseInt(this.rowsperpage, 10);
      if (!rpp || rpp <= 0 || !this.filteredData.length)
        return this.filteredData;
      const start = (this.currentPage - 1) * rpp;
      return this.filteredData.slice(start, start + rpp);
    },
  },

  watch: {
    dataobj: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.dataTable = Array.isArray(newVal) ? [...newVal] : [];
        this.filteredData = [...this.dataTable];
        this.currentPage = 1;
        this.$nextTick(this.processColumns);
      },
    },
    searchQuery: {
      handler() {
        this.filterData();
      },
      immediate: false,
    },
    selectedItems: {
      handler() {
        this.$emit("selected", this.selectedItems);
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.loadLottieAnimation();
    this.processColumns();
  },
  updated() {
    const newSignature = this._getColumnsSignature();
    if (newSignature !== this.columnsSignature) {
      this.processColumns();
    }
  },

  methods: {
    loadLottieAnimation() {
      const player = document.querySelector(".datatable lottie-player");

      player.addEventListener("rendered", () => {
        player.load(loadingJson);
      })
    },
    updateSearchQuery(newVal) {
      this.searchQuery = newVal;
    },

    /** Filtra os dados com base na searchQuery */
    filterData() {
      if (!this.dataTable || this.dataTable.length === 0) {
        this.filteredData = [];
        return;
      }

      if (this.searchQuery.length === 0) {
        this.filteredData = [...this.dataTable];
      } else {
        const search = this.searchQuery.toLowerCase();
        this.filteredData = this.dataTable.filter((item) =>
          Object.keys(item).some((key) => {
            const val = this.getByPath(item, key);
            return String(val).toLowerCase().includes(search);
          })
        );
      }
      this.currentPage = 1; // Reseta a página ao filtrar
    },
    /**
     * Gera uma "assinatura" JSON leve baseada nas props dos slots,
     * para uma verificação de performance rápida.
     * @private
     */
    _getColumnsSignature() {
      if (!this.$slots.default) return "";

      const declarativeColumns = this.$slots.default
        .filter(
          (vnode) =>
            vnode.componentOptions &&
            vnode.componentOptions.tag === "grid-column"
        )
        .map((vnode) => {
          const props = vnode.componentOptions.propsData || {};
          //const attrs = vnode.data.attrs || {};

          return {
            prop: props.prop,
            label: props.label,
            width: props.width,
            order: props.order,
          };
        });

      return JSON.stringify(declarativeColumns);
    },
    /** Transforma string em lowerCase */
    toLower: function (str) {
      if (!str) return "";

      return str.toLowerCase();
    },
    /** Seleciona / desseleciona todos os itens */
    toggleSelectAll() {
      this.selectedItems = this.isAllSelected ? [] : [...this.dataTable];
    },

    /**
     * Converte larguras fracionárias (ex: "1/5") em porcentagens.
     * Mantém outros valores de CSS (ex: "150px", "30%") intactos.
     */
    formatWidth(widthValue = "auto") {
      if (typeof widthValue === "string" && widthValue.includes("/")) {
        const parts = widthValue.split("/");
        if (parts.length === 2) {
          const num = parseFloat(parts[0]);
          const den = parseFloat(parts[1]);

          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            return (num / den) * 100 + "%";
          }
        }
      }

      return widthValue;
    },

    /** Processa as colunas declarativas (<grid-column>) */
    processColumns() {
      const declarativeColumns = (this.$slots.default || [])
        .filter((vnode) => {
          return (
            vnode.componentOptions &&
            vnode.componentOptions.tag == "grid-column"
          );
        })
        .map((vnode) => {
          const props = vnode.componentOptions.propsData || {};
          const attrs = vnode.data.attrs || {};
          const finalProps = { ...attrs, ...props };

          let defaultSlotFn = (vnode.data.scopedSlots || {}).default;

          if (!defaultSlotFn && vnode.componentOptions.children) {
            defaultSlotFn = () => vnode.componentOptions.children;
          }

          let headerText =
            finalProps.label || this.formatLabel(finalProps.prop);
          let tdHeaderTemplate = document.querySelector(
            "td.column-" + props.prop + " .header-template"
          );

          if (
            tdHeaderTemplate &&
            tdHeaderTemplate.getAttribute("export") != "false"
          ) {
            headerText = tdHeaderTemplate.innerText;
          }

          return {
            ...finalProps,
            prop: finalProps.prop,
            label: headerText,
            sortable: props.sortable === "false" ? "false" : "true",
            scopedSlot: defaultSlotFn,
            export: props.export === "false" ? "false" : "true",
          };
        });

      let finalColumns = [];

      if (declarativeColumns.length > 0) {
        finalColumns = [...declarativeColumns];

        this.$nextTick(() => {
          this.columns.forEach((item) => {
            if (
              document.querySelector(
                "td.column-" + item.prop + " .header-template"
              )
            ) {
              if (
                !document.querySelector(
                  "th.column-" + item.prop + " .header-template"
                )
              ) {
                document
                  .querySelector("th.column-" + item.prop + " .header-default")
                  .remove();
                document
                  .querySelector("th.column-" + item.prop)
                  .appendChild(
                    document.querySelector(
                      "td.column-" + item.prop + " .header-template"
                    )
                  );
              }

              let tdsHeaderColumn = document.querySelectorAll(
                "td.column-" + item.prop + " .header-template"
              );

              tdsHeaderColumn.forEach((item) => {
                item.remove();
              });
            }
          });
        });
      }

      if (this.autogeneratecolumns === "true" && this.dataTable.length > 0) {
        const declaredProps = new Set(
          declarativeColumns.map((col) => col.prop)
        );
        const autoGeneratedColumns = Object.keys(this.dataTable[0])
          .filter((key) => !declaredProps.has(key))
          .map((key) => ({
            prop: key,
            label: this.formatLabel(key),
            sortable: "true",
            export: "true",
            scopedSlot: null,
          }));

        finalColumns = [...finalColumns, ...autoGeneratedColumns];
      }

      this.columns = finalColumns;

      const hasOrderedColumns = finalColumns.some(
        (c) => c.order != null && c.order !== ""
      );

      if (hasOrderedColumns) {
        const totalSize = finalColumns.length;
        let reorderedColumns = new Array(totalSize);
        const unorderedColumns = [];

        const orderedColumns = finalColumns
          .filter((col) => {
            if (col.order != null && col.order !== "") {
              return true;
            }
            unorderedColumns.push(col);
            return false;
          })
          .sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));

        orderedColumns.forEach((col) => {
          let targetIndex = parseInt(col.order, 10) - 1;

          targetIndex = Math.max(0, Math.min(targetIndex, totalSize - 1));

          while (
            reorderedColumns[targetIndex] !== undefined &&
            targetIndex < totalSize
          ) {
            targetIndex++;
          }

          if (targetIndex < totalSize) {
            reorderedColumns[targetIndex] = col;
          }
        });

        const orphans = orderedColumns.filter(
          (c) => !reorderedColumns.includes(c)
        );

        let unorderedPointer = 0;
        for (let i = 0; i < totalSize; i++) {
          if (reorderedColumns[i] === undefined) {
            const nextColumn =
              unorderedColumns[unorderedPointer] || orphans.shift();
            if (nextColumn) {
              reorderedColumns[i] = nextColumn;
              unorderedPointer++;
            }
          }
        }

        finalColumns = reorderedColumns.filter((c) => c !== undefined);
      }

      this.columns = finalColumns;
      this.columnsSignature = this._getColumnsSignature();
    },

    /** Ordenação inteligente (string, número, data) */
    sortData(col) {
      if (col.sortable == "false") return;
      const columnKey = col.prop;

      if (this.sortColumnKey === columnKey) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortColumnKey = columnKey;
        this.sortDirection = "asc";
      }

      const dir = this.sortDirection === "asc" ? 1 : -1;
      this.filteredData.sort((a, b) => {
        if (col.sortexpression) {
          const valA = col.sortexpression(a);
          const valB = col.sortexpression(b);
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
          return 0;
        }
        const valA = this.getByPath(a, col.prop);
        const valB = this.getByPath(b, col.prop);

        if (valA == null && valB == null) return 0;
        if (valA == null) return -1 * dir;
        if (valB == null) return 1 * dir;

        const dateA = this.parseDate(valA);
        const dateB = this.parseDate(valB);
        if (dateA && dateB) return (dateA.getTime() - dateB.getTime()) * dir;

        const numA = Number(String(valA).replace(",", "."));
        const numB = Number(String(valB).replace(",", "."));
        if (!isNaN(numA) && !isNaN(numB)) return (numA - numB) * dir;

        return (
          String(valA).localeCompare(String(valB), undefined, {
            numeric: true,
            sensitivity: "base",
          }) * dir
        );
      });
    },

    /** Tenta converter string em Date */
    parseDate(str) {
      if (typeof str !== "string") return null;
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d;
      }
      const brMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
      if (brMatch) {
        const day = parseInt(brMatch[1], 10);
        const month = parseInt(brMatch[2], 10) - 1;
        const year = parseInt(brMatch[3], 10);
        const d = new Date(year, month, day);
        if (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === day
        )
          return d;
      }
      return null;
    },

    /** Acessa valor por caminho (ex: "user.name") */
    getByPath: (obj, path) =>
      String(path || "")
        .split(".")
        .reduce((acc, part) => acc && acc[part], obj),

    formatLabel: (key) =>
      (key || "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),

    ariaSort(col) {
      if (this.sortColumnKey !== col.prop) return "none";
      return this.sortDirection === "asc" ? "ascending" : "descending";
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    /** Busca o primeiro texto válido em uma árvore de VNodes. */
    _getTextFromVNodes(vnodes) {
      if (!vnodes) return "";
      const nodes = Array.isArray(vnodes) ? vnodes : [vnodes];

      for (const vnode of nodes) {
        if (!vnode) continue;

        if (vnode.data?.staticClass == "header-template") continue;

        if (vnode.data?.domProps?.innerHTML) {
          const tempEl = document.createElement("div");
          tempEl.innerHTML = vnode.data.domProps.innerHTML;
          const text = (tempEl.textContent || tempEl.innerText || "").trim();

          if (text) return text;
        }

        const directText = (vnode.text || "").trim();

        if (directText) return directText;

        if (vnode.children) {
          const childText = this._getTextFromVNodes(vnode.children);
          if (childText) return childText;
        }
      }

      return "";
    },
    /** Obtém o valor textual de uma célula. */
    _getCellText(item, col) {
      if (col.scopedSlot) {
        try {
          const vnodes = col.scopedSlot({ item });
          return this._getTextFromVNodes(vnodes);
        } catch (e) {
          console.error(`Erro ao renderizar slot na coluna "${col.prop}":`, e);
          return "";
        }
      }

      const rawValue = this.getByPath(item, col.prop);
      return rawValue == null ? "" : String(rawValue);
    },
    /** Exporta planilha Excel */
    exportarParaExcel(opcoes = {}) {
      const filename = (opcoes.filename || "relatorio") + ".xls";
      const title = opcoes.title || "Relatório";
      const colunasParaExportar = this.columns.filter(
        (col) => col.export != "false"
      );

      if (colunasParaExportar.length === 0) {
        alert("Nenhuma coluna está configurada para exportação.");
        return;
      }
      const numCols = colunasParaExportar.length;
      const escapeXml = (str = "") =>
        String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const cellMatrix = this.dataTable.map((item) =>
        colunasParaExportar.map((col) => this._getCellDataForExport(item, col))
      );

      let dynamicStylesXml = "";
      const styleMap = new Map();
      const hAlignMap = { left: "Left", center: "Center", right: "Right" };
      const vAlignMap = { top: "Top", middle: "Center", bottom: "Bottom" };

      cellMatrix.forEach((row) => {
        row.forEach((cellData, cIdx) => {
          const col = colunasParaExportar[cIdx];
          const hAlign = hAlignMap[col.align] || "Left";
          const vAlign = vAlignMap[col.valign] || "Center";
          const color = cellData.color || "#000000";
          const isBold = cellData.isBold;
          const format = cellData.excelFormat;

          const styleKey = `${hAlign}-${vAlign}-${isBold}-${color}-${format}`;
          if (!styleMap.has(styleKey)) {
            const styleId = `s-${styleMap.size}`;
            styleMap.set(styleKey, styleId);
            cellData.styleId = styleId;

            const formatXml =
              format !== "General"
                ? `<NumberFormat ss:Format="${format}"/>`
                : "";

            dynamicStylesXml += `
                                <Style ss:ID="${styleId}">
                                    <Font ss:Bold="${isBold ? 1 : 0
              }" ss:Color="${color}"/>
                                    <Alignment ss:Horizontal="${hAlign}" ss:Vertical="${vAlign}"/>
                                    ${formatXml}
                                </Style>
                            `;
          } else {
            cellData.styleId = styleMap.get(styleKey);
          }
        });
      });

      let dynamicHeaderStylesXml = "";
      colunasParaExportar.forEach((col) => {
        const hAlign = hAlignMap[col.align] || "Left";
        const styleKey = `Header-${hAlign}`;
        if (!styleMap.has(styleKey)) {
          const styleId = `s-${styleMap.size}`;
          styleMap.set(styleKey, styleId);
          col.exportHeaderStyleId = styleId;
          dynamicHeaderStylesXml += `<Style ss:ID="${styleId}"><Font ss:Bold="1" ss:Color="#000000"/><Interior ss:Color="#F3F3F3" ss:Pattern="Solid"/><Alignment ss:Horizontal="${hAlign}" ss:Vertical="Center"/></Style>`;
        } else {
          col.exportHeaderStyleId = styleMap.get(styleKey);
        }
      });

      const colMaxLen = new Array(numCols).fill(0);
      colunasParaExportar.forEach((col, j) => {
        const label = col.exportLabel || col.label || col.prop;
        colMaxLen[j] = Math.max(colMaxLen[j], String(label).length);
      });
      cellMatrix.forEach((row) =>
        row.forEach((cell, j) => {
          colMaxLen[j] = Math.max(colMaxLen[j], cell.text.length);
        })
      );
      const colWidths = colMaxLen.map((len) => {
        return Math.max(60, Math.min(500, Math.ceil(len * 7.5 + 12)));
      });

      const rowsXml = [];
      const dataAtual = new Date().toLocaleString("pt-BR");
      rowsXml.push(
        `<Row><Cell ss:MergeAcross="${numCols - 1
        }" ss:StyleID="sTitle"><Data ss:Type="String">${escapeXml(
          `${title} - Gerado em ${dataAtual}`
        )}</Data></Cell></Row>`
      );
      const headerCellsXml = colunasParaExportar
        .map(
          (c) =>
            `<Cell ss:StyleID="${c.exportHeaderStyleId
            }"><Data ss:Type="String">${escapeXml(
              c.exportLabel || c.label || c.prop
            )}</Data></Cell>`
        )
        .join("");
      rowsXml.push(`<Row>${headerCellsXml}</Row>`);

      cellMatrix.forEach((rowCells) => {
        const r = rowCells
          .map(
            (cellData) =>
              `<Cell ss:StyleID="${cellData.styleId
              }"><Data ss:Type="String">${escapeXml(
                cellData.text
              )}</Data></Cell>`
          )
          .join("");
        rowsXml.push(`<Row>${r}</Row>`);
      });

      const columnsXml = colWidths
        .map((w) => `<Column ss:Width="${w}"/>`)
        .join("\n");
      const styles = `<Styles><Style ss:ID="sTitle"><Font ss:Bold="1" ss:Size="12" ss:Color="#FFFFFF"/><Interior ss:Color="#003a66" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>${dynamicHeaderStylesXml}${dynamicStylesXml}</Styles>`;

      const xml = `<?xml version="1.0"?>
                <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
                          xmlns:o="urn:schemas-microsoft-com:office:office"
                          xmlns:x="urn:schemas-microsoft-com:office:excel"
                          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
                          xmlns:html="http://www.w3.org/TR/REC-html40">
                    ${styles}
                    <Worksheet ss:Name="${escapeXml(title)}">
                        <Table>
                            ${columnsXml}
                            ${rowsXml.join("\n")}
                        </Table>
                        <AutoFilter x:Range="R2C1:R2C${numCols}" xmlns="urn:schemas-microsoft-com:office:excel" />
                        <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
                            <FreezePanes/>
                            <FrozenNoSplit/>
                            <SplitHorizontal>2</SplitHorizontal>
                            <TopRowBottomPane>2</TopRowBottomPane>
                            <ActivePane>2</ActivePane>
                        </WorksheetOptions>
                    </Worksheet>
                </Workbook>`;

      const blob = new Blob(["\ufeff", xml], {
        type: "application/vnd.ms-excel",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    _inferDataTypeAndValue(text) {
      const date = this.parseDate(text);
      if (date) {
        if (text.match(/\s\d{1,2}:\d{2}/)) {
          return {
            type: "DateTime",
            value: date.toISOString(),
            format: "dd/mm/yyyy\\ hh:mm",
          };
        }
        return {
          type: "DateTime",
          value: date.toISOString(),
          format: "dd/mm/yyyy",
        };
      }

      if (text.match(/(R\$\s?)?(\d{1,3}(\.\d{3})*,\d{2}$)/)) {
        const num = parseFloat(
          String(text)
            .replace(/[^\d,-]/g, "")
            .replace(",", ".")
        );
        if (!isNaN(num)) {
          const format = text.includes("R$") ? "R$ #,##0.00" : "#,##0.00";
          return { type: "Number", value: num, format: format };
        }
      }

      if (text.endsWith("%")) {
        const num = parseFloat(
          String(text)
            .replace(/[^\d,-]/g, "")
            .replace(",", ".")
        );
        if (!isNaN(num)) {
          return { type: "Number", value: num / 100, format: "0.00%" };
        }
      }

      return { type: "String", value: text, format: "General" };
    },
    /**
     * Tenta converter um valor de cor CSS para o formato Hexadecimal #RRGGBB.
     * @private
     */
    _normalizeColorToHex(color) {
      if (!color) return null;
      if (color.startsWith("#")) {
        if (color.length === 4)
          return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        return color;
      }
      if (color.startsWith("rgb")) {
        const rgb = color.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          return (
            "#" +
            (
              (1 << 24) +
              (parseInt(rgb[0]) << 16) +
              (parseInt(rgb[1]) << 8) +
              parseInt(rgb[2])
            )
              .toString(16)
              .slice(1)
              .toUpperCase()
          );
        }
      }

      const colorMap = {
        red: "#FF0000",
        green: "#008000",
        blue: "#0000FF",
        black: "#000000",
      };
      return colorMap[color.toLowerCase()] || null;
    },

    /**
     * Procura recursivamente em nós de VUE pela primeira cor de texto definida.
     * @private
     */
    _findColor(vnodes) {
      const nodes = Array.isArray(vnodes) ? vnodes : [vnodes];
      for (const vnode of nodes) {
        if (!vnode) continue;
        const style = vnode.data?.style || vnode.data?.staticStyle;
        if (style && style.color) {
          const hexColor = this._normalizeColorToHex(style.color);
          if (hexColor) return hexColor;
        }
        if (vnode.children) {
          const childColor = this._findColor(vnode.children);
          if (childColor) return childColor;
        }
      }
      return null;
    },
    /**
     * Procura recursivamente em nós de VUE se algum deles tem estilo de negrito.
     * @private
     */
    _findBoldStatus(vnodes) {
      const nodes = Array.isArray(vnodes) ? vnodes : [vnodes];
      for (const vnode of nodes) {
        if (!vnode) continue;

        if (["strong", "b"].includes(vnode.tag)) return true;

        const style = vnode.data?.style || vnode.data?.staticStyle;
        if (style) {
          const fontWeight = style.fontWeight || style["font-weight"];
          if (fontWeight) {
            if (["bold", "bolder"].includes(String(fontWeight).toLowerCase()))
              return true;
            if (parseInt(fontWeight, 10) >= 600) return true;
          }
        }

        if (vnode.children && this._findBoldStatus(vnode.children)) {
          return true;
        }
      }
      return false;
    },

    /**
     * Obtém um objeto com o texto e o status de negrito da célula.
     * @private
     */
    _getCellDataForExport(item, col) {
      const text = this._getCellText(item, col).trim();
      const inferred = this._inferDataTypeAndValue(text);

      let isBold = false;
      let color = null;

      if (col.cellStyleFn) {
        const styles = col.cellStyleFn(item) || {};
        isBold = styles.isBold || false;
        color = this._normalizeColorToHex(styles.color) || null;
      } else if (col.scopedSlot) {
        try {
          const vnodes = col.scopedSlot({ item });
          isBold = this._findBoldStatus(vnodes);
          color = this._findColor(vnodes);
        } catch (e) {
          console.error(e);
        }
      }

      return {
        text: text,
        isBold: isBold,
        color: color,
        excelType: inferred.type,
        excelValue: inferred.value,
        excelFormat: inferred.format,
      };
    },
  },
  beforeDestroy() {
    clearTimeout(this.emptyTimer);
  }
}
</script>
<style scoped>
.inner-table-content {
  width: 100%;
  overflow-x: auto;
  padding: var(--space-1);
  outline: 1px solid var(--gray);
  border-radius: var(--radius-sm);
  margin: var(--space-6) 0 var(--space-4) 0;
}

.align-top-important {
  vertical-align: top !important;
}

.align-bottom-important {
  vertical-align: bottom !important;
}

.align-middle-important {
  vertical-align: middle !important;
}

.datatable {
  border-radius: var(--radius-md);
  width: 100%;
  padding: var(--space-6) 0;
}

.datatable :deep(.ellipsis) {
  max-width: 25dvw;
  min-width: 100px;
}

.datatable-loading {
  width: 100%;
  display: grid;
  place-items: center;

  & lottie-player {
    width: 200px;
  }
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  overflow: hidden;
}

.table th,
.table td {
  padding: var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--gray-high);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.table tr:hover {
  background: var(--blue-high-2);
}

.table td :deep(p),
.table td :deep(a),
.table td :deep(span) {
  line-height: 100%;
  margin: var(--space-1) 0;
  font-size: var(--fontsize-sm);
  color: var(--black);
  line-height: 118%;
}

.table td :deep(img) {
  object-fit: cover;
  width: 100%;
  max-width: 100px;
  border-radius: var(--radius-sm);
  height: 100%;
}

.table th {
  cursor: pointer;
  font-size: var(--fontsize-sm);
  color: var(--black);
  font-weight: 500;
  background: var(--gray-high);
}

.th-content.sorting-asc>*:first-child::after,
.th-content.sorting-desc>*:first-child::after {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.8em;
}

.th-content.sorting-asc>*:first-child::after {
  content: '▲';
}

.th-content.sorting-desc>*:first-child::after {
  content: '▼';
}

.datatable-content :deep(tbody .header-template) {
  display: none;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination button {
  padding: 0 var(--space-3);
  cursor: pointer;
}

.search-bar {
  margin-bottom: 10px;
}

.data_grid_footer {
  display: grid;
  align-items: center;
  grid-template-columns: 38px 100%;
  background: var(--base-background);
}

.data_grid_footer button {
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  align-items: center;
  margin: 0 var(--space-3) !important;
  width: calc(100% - 54px);

  & button:first-child {
    margin-left: -38px;
  }
}


@media (max-width: 768px) {
  thead {
    display: none;
  }

  tr {
    display: block;
    border: 2.5px solid var(--gray-high);
    padding: 10px;

    & td:last-child {
      border-bottom: none;
    }
  }

  td {
    display: grid;
    grid-template-columns: 1.5fr 2fr;
    gap: 0.5rem;
    padding: 0.5rem;
    place-items: center;
    text-align: center;

    & p {
      text-align: center !important;
    }
  }

  td::before {
    content: attr(data-title) ": ";
    font-weight: bold;
    color: var(--black);
    text-align: center;
  }
}
</style>
