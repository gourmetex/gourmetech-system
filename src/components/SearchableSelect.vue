<template>
    <div class="custom-select-wrapper" :class="{ 'active': isOpen }" v-click-outside="closeDropdown">
        
        <input type="hidden" :name="name" :value="value">

        <div class="select-trigger" @click="toggleDropdown">
            <span class="selected-text" :class="{ 'placeholder': !selectedLabel }">
                {{ selectedLabel || placeholder }}
            </span>
            <span class="material-icons arrow-icon">expand_more</span>
        </div>

        <transition name="fade">
            <div class="select-options-container" v-show="isOpen">
                <div class="search-box">
                    <span class="material-icons search-icon">search</span>
                    <input 
                        type="text" 
                        v-model="searchTerm" 
                        ref="searchInput"
                        placeholder="Buscar..." 
                        class="search-input"
                        @click.stop
                    >
                </div>
                <ul class="options-list">
                    <li 
                        v-for="(option, index) in filteredOptions" 
                        :key="index" 
                        @click="selectOption(option)"
                        :class="{ 'selected': value === option.id }"
                    >
                        {{ option.nome }}
                    </li>
                    <li v-if="filteredOptions.length === 0" class="no-results">
                        Nenhuma opção encontrada.
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'SearchableSelect',
    props: {
        options: {
            type: Array,
            required: true
        },
        value: {
            required: true
        },
        placeholder: {
            type: String,
            default: 'Escolha uma opção'
        },
        name: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isOpen: false,
            searchTerm: ''
        }
    },
    computed: {
        selectedLabel() {
            const selected = this.options.find(opt => opt.id === this.value);
            return selected ? selected.nome : null;
        },
        filteredOptions() {
            if (!this.searchTerm) return this.options;
            const term = this.searchTerm.toLowerCase();
            return this.options.filter(opt => 
                opt.nome.toLowerCase().includes(term)
            );
        }
    },
    methods: {
        toggleDropdown() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.searchTerm = ''; 
                this.$nextTick(() => {
                    this.$refs.searchInput.focus();
                });
            }
        },
        closeDropdown() {
            this.isOpen = false;
        },
        selectOption(option) {
            this.$emit('input', option.id);
            this.closeDropdown();
        }
    },
    directives: {
        'click-outside': {
            bind: function (el, binding, vnode) {
                el.clickOutsideEvent = function (event) {
                    if (!(el == event.target || el.contains(event.target))) {
                        vnode.context[binding.expression](event);
                    }
                };
                document.body.addEventListener('click', el.clickOutsideEvent);
            },
            unbind: function (el) {
                document.body.removeEventListener('click', el.clickOutsideEvent);
            },
        }
    }
}
</script>

<style scoped>
/* Wrapper Principal */
.custom-select-wrapper {
    position: relative;
    width: 100%;
    font-family: 'Manrope', sans-serif;
}

/* Trigger - Mimetizando o estilo global dos seus inputs */
.select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--gray-2);
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    width: 100%;
    height: 42px;
    background-color: var(--white);
    cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.custom-select-wrapper.active .select-trigger {
    border-color: var(--blue);
    box-shadow: 0 0 0 2px var(--blue-high-2);
}

.selected-text {
    font-size: var(--fontsize-sm);
    color: var(--black);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.selected-text.placeholder {
    color: var(--black);
}

.arrow-icon {
    color: var(--black);
    transition: transform 0.3s;
}

.custom-select-wrapper.active .arrow-icon {
    transform: rotate(180deg);
    color: var(--blue);
}

/* Dropdown Container */
.select-options-container {
    position: absolute;
    top: 105%; /* Um pouco abaixo do trigger */
    left: 0;
    right: 0;
    background: var(--white);
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-sm);
    box-shadow: var(--boxshadow-default);
    z-index: 100;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* Área de Busca */
.search-box {
    padding: var(--space-2);
    border-bottom: 1px solid var(--gray-3);
    background-color: var(--gray-high);
    position: relative;
    display: flex;
    align-items: center;
}

.search-input {
    width: 100%;
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-sm);
    padding: 6px 8px 6px 32px; /* Espaço para o ícone */
    font-size: var(--fontsize-sm);
    height: 36px;
    outline: none;
}

.search-input:focus {
    border-color: var(--blue);
}

.search-icon {
    position: absolute;
    right: 12px;
    font-size: 18px;
    color: var(--gray);
    pointer-events: none;
}

/* Lista de Opções */
.options-list {
    list-style: none;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
    padding: 0;
}

/* Scrollbar customizada para combinar com o global */
.options-list::-webkit-scrollbar {
    width: 6px;
}
.options-list::-webkit-scrollbar-thumb {
    background: var(--gray-2);
    border-radius: 10px;
}

.options-list li {
    padding: var(--space-3);
    font-size: var(--fontsize-sm);
    color: var(--black);
    cursor: pointer;
    transition: background 0.2s;
}

.options-list li:hover {
    background-color: var(--blue-high-2);
}

.options-list li.selected {
    background-color: var(--blue-high-2);
    font-weight: bold;
    color: var(--blue-low);
}

.no-results {
    padding: var(--space-4);
    color: var(--gray);
    text-align: center;
    font-size: var(--fontsize-xs);
}

/* Animação */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>