<template>
    <div class="datatable" :style="dataTable.length == 0 && loaded ? 'border: 1px solid var(--gray-3); margin-top: var(--space-3);' : ''">
      <div class="empty-datatable text-center" v-if="dataTable.length == 0 && loaded">
        <h2>Não existem informações para exibir</h2>
      </div>
      <div class="datatable-loading" v-if="!loaded">
        <lottie-player id="datatable-loading" background="transparent" speed="1" loop autoplay></lottie-player>
      </div>
      <div class="datatable-content" v-if="loaded && dataTable.length > 0">
        <!-- Search/Filter -->
        <inputSearch
          v-if="searchText != ''"
          :search="searchQuery"
          @model="searchQuery = $event"
          @input="filterData"
          :searchText="searchText"
        />
    
        <!-- Table -->
        <table class="table">
          <thead>
            <tr>
              <th
                v-for="(column, index) in columnsToRender"
                :key="index"
                @click="sortData(column)"
                :class="column"
              >
                <span style="text-transform: capitalize;" :title='capitalize(column.replace(/-/g, " "))'>{{ column.replace(/-/g, " ") }}</span>
                <span v-if="sortColumn === column">
                  {{ sortDirection === 'asc' ? ' ▲' : ' ▼' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedData" :key="item.id">
              <td v-for="(column, colIndex) in columnsToRender" :key="colIndex" :data-th="returnFormatedDataTh(column)" :class="column">
                <template v-if="$scopedSlots[`column-${column}`]">
                  <slot :name="`column-${column}`" :item="item"></slot>
                </template>
                <template v-else>
                  {{ item[column] }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
    
        <!-- Pagination -->
        <div class="pagination">
          <button @click="prevPage" class="btn rounded-btn small" :disabled="currentPage === 1">
              <span class="material-icons">navigate_before</span>
          </button>
          <span>Página <strong>{{ currentPage }}</strong> de {{ totalPages }}</span>
          <button @click="nextPage" class="btn rounded-btn small" :disabled="currentPage === totalPages">
              <span class="material-icons">navigate_next</span>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import inputSearch from "./inputSearch.vue";
  import { globalMethods } from "@/js/globalMethods";
  import loadingJson from "../assets/animations/loading-component.json";
  import $ from 'jquery';

  export default {
    name: "dataTable",
    mixins: [globalMethods],
    props: {
      dataTable: {
        type: Array,
        required: true
      },
      searchText: {
        type: String,
        required: true
      },
      rowsPerPage: {
        type: Number,
        default: 10
      },
      loaded: {
        type: Boolean,
        required: true
      }
    },
    components: {
        inputSearch
    },  
    data() {
      return {
        searchQuery: "",
        filteredData: this.dataTable,
        currentPage: 1,
        sortColumn: "",
        sortDirection: "asc"
      };
    },
    computed: {
      columnsToRender() {
        if (!this.dataTable || this.dataTable.length === 0) return [];
  
        const allColumns = Object.keys(this.dataTable[0]);
  
        const templateColumns = Object.keys(this.$scopedSlots)
          .filter(slotName => slotName.startsWith("column-"))
          .map(slotName => slotName.replace("column-", ""));
  
        const customColumns = allColumns.filter(column => this.$scopedSlots[`column-${column}`]);
  
        const orderedColumns = [...templateColumns, ...customColumns.filter(col => !templateColumns.includes(col))];
  
        return orderedColumns.length > 0 ? orderedColumns : allColumns;
      },
      totalPages() {
        return this.filteredData.length
          ? Math.ceil(this.filteredData.length / this.rowsPerPage)
          : 1;
      },
      paginatedData() {
        if (!this.filteredData || this.filteredData.length === 0) return [];
        const start = (this.currentPage - 1) * this.rowsPerPage;
        return this.filteredData.slice(start, start + this.rowsPerPage);
      }
    },
    methods: {
      returnFormatedDataTh(string) {
        string = string.replace(/-/g, " ");
        string = this.capitalize(string);
        return string;
      },
      filterData() {
        if (!this.dataTable || this.dataTable.length === 0) {
          this.filteredData = [];
          return;
        }
        this.filteredData = this.dataTable.filter(item =>
          Object.values(item).some(val =>
            String(val).toLowerCase().includes(this.searchQuery.toLowerCase())
          )
        );
        this.currentPage = 1;
      },
      sortData(columnKey) {
        if (!this.dataTable || this.dataTable.length === 0) return;
  
        this.sortDirection =
          this.sortColumn === columnKey && this.sortDirection === "asc"
            ? "desc"
            : "asc";
        this.sortColumn = columnKey;
  
        const modifier = this.sortDirection === "asc" ? 1 : -1;
        this.filteredData.sort((a, b) =>
          a[columnKey] > b[columnKey] ? modifier : -modifier
        );
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      },
      applyAlignmentClasses() {
        this.columnsToRender.forEach((column) => {
          const thElement = this.$el.querySelector(`th.${column}`);
          const tdElements = this.$el.querySelectorAll(`td.${column}`);

          tdElements.forEach((td) => {
              const firstChild = td.firstElementChild;

              if (firstChild && firstChild.classList.contains('text-center')) {
                thElement.classList.add('text-center');
                td.classList.add('text-center');
              } else if (firstChild && firstChild.classList.contains('text-left')) {
                thElement.classList.add('text-left');
                td.classList.add('text-left');
              } else if (firstChild && firstChild.classList.contains('text-right')) {
                thElement.classList.add('text-right');
                td.classList.add('text-right');
              }
          });
        });
      }
    },
    watch: {
      dataTable: {
        handler(newData) {
          this.filteredData = newData || [];
          this.currentPage = 1;

          let texts = $("table p, table h3");

          texts.each((index, item) => {
            $(item).attr("title", $(item).text());
          })
        },
        deep: true
      }
    },
    mounted() {
      const player = document.querySelector("lottie-player");
      player.addEventListener("rendered", () => {
          player.load(
              loadingJson
          );
      });

      setTimeout(() => {
        let texts = $("table p, table h3");

        texts.each((index, item) => {
          $(item).attr("title", $(item).text());
        })
      }, 100)

      this.applyAlignmentClasses();
    },
    updated() {
      this.applyAlignmentClasses();
    }
  };
  </script>
  <style scoped>
    .datatable {
      border-radius: var(--radius-md);
      width: 100%;
      padding: var(--space-6) 0;
    }

    .datatable-loading {
      width: 100%;
      display: grid;
      place-items: center;

      & #datatable-loading {
        width: 200px;
      }
    }

  .table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin: var(--space-6) 0 var(--space-4) 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    outline: 1px solid var(--gray);
  }
  
  .table th, .table td {
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
  
  .table td p {
    line-height: 100%;
    margin: var(--space-1) 0;
    font-size: var(--fontsize-sm);
    color: var(--black);
    line-height: 118%;
  }

  .table td img {
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
      content: attr(data-th) ": ";
      font-weight: bold;
      color: var(--black);
      text-align: center;
    }
  }
  </style>
  