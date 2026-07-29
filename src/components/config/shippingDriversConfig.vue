<template>
    <div class="shipping-drivers-config config-page">
        <div class="section-heading">
            <div>
                <h2>Entregadores</h2>
                <p>Perfis de acesso para o app Compra Rápida Entrega</p>
            </div>
            <button class="btn btn-gray" :class="{ 'btn-loading': !contentLoaded }" type="button" @click="returnDrivers" :disabled="!contentLoaded">
                <span class="material-icons" v-if="contentLoaded">refresh</span>
                {{ contentLoaded ? "Atualizar" : "Carregando" }}
            </button>
        </div>

        <div class="drivers-summary">
            <div class="summary-item active-drivers" :class="{ selected: activeFilter === 'active' }" @click="toggleFilter('active')" title="Filtrar por entregadores ativos">
                <span class="material-icons">delivery_dining</span>
                <div>
                    <p>Ativos</p>
                    <h3>{{ activeDrivers }}</h3>
                </div>
            </div>
            <div class="summary-item temp-pass-drivers" :class="{ selected: activeFilter === 'temp_password' }" @click="toggleFilter('temp_password')" title="Filtrar por entregadores com senha temporária">
                <span class="material-icons">vpn_key</span>
                <div>
                    <p>Senha temporária</p>
                    <h3>{{ temporaryPasswordDrivers }}</h3>
                </div>
            </div>
            <div class="summary-item inactive-drivers" :class="{ selected: activeFilter === 'inactive' }" @click="toggleFilter('inactive')" title="Filtrar por entregadores inativos">
                <span class="material-icons">block</span>
                <div>
                    <p>Inativos</p>
                    <h3>{{ inactiveDrivers }}</h3>
                </div>
            </div>
        </div>

        <div class="drivers-layout">
            <form class="driver-form driver-panel" @submit.prevent="saveDriver">
                <div class="panel-title">
                    <span class="material-icons">{{ editingDriverId ? "edit" : "person_add" }}</span>
                    <div>
                        <h3>{{ editingDriverId ? "Editar entregador" : "Novo entregador" }}</h3>
                        <p>{{ editingDriverId ? "Atualize os dados do perfil selecionado" : "A senha temporária será enviada por email" }}</p>
                    </div>
                </div>
                <div class="form-group">
                    <label for="driver-name">Nome</label>
                    <input type="text" id="driver-name" v-model="driver.name" placeholder="Nome do entregador" required>
                </div>
                <div class="form-group">
                    <label for="driver-email">Email</label>
                    <input type="email" id="driver-email" v-model="driver.email" placeholder="email@exemplo.com" required>
                </div>
                <div class="form-group checkbox-group" v-if="editingDriverId">
                    <input type="checkbox" id="driver-active" v-model="driver.active">
                    <label for="driver-active">Entregador ativo</label>
                </div>
                <div class="driver-actions">
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                        <span class="material-icons">{{ editingDriverId ? "save" : "send" }}</span>
                        {{ saving ? "Salvando" : editingDriverId ? "Salvar" : "Criar e enviar" }}
                    </button>
                    <button type="button" class="btn btn-gray" v-if="editingDriverId || driver.name || driver.email" @click="resetForm">
                        {{ editingDriverId ? "Cancelar" : "Limpar" }}
                    </button>
                </div>
                <p class="response">{{ response }}</p>
            </form>

            <div class="drivers-list driver-panel">
                <div class="drivers-list-header">
                    <div>
                        <h3>Lista de entregadores</h3>
                        <p v-if="activeFilter" class="filter-indicator">
                            Exibindo {{ filteredDrivers.length }} de {{ drivers.length }} (Filtro ativo)
                        </p>
                        <p v-else>{{ drivers.length }} cadastrado{{ drivers.length == 1 ? "" : "s" }}</p>
                    </div>
                </div>
                <div class="empty-list" v-if="filteredDrivers.length == 0 && contentLoaded">
                    <span class="material-icons">{{ activeFilter ? "filter_alt_off" : "person_off" }}</span>
                    <p>{{ activeFilter ? "Nenhum entregador corresponde ao filtro" : "Nenhum entregador cadastrado" }}</p>
                </div>
                <div class="driver-card" v-for="driverItem in filteredDrivers" :key="driverItem.id">
                    <div class="driver-identity">
                        <div class="driver-avatar">{{ driverInitials(driverItem.nome) }}</div>
                        <div>
                            <h3>{{ driverItem.nome }}</h3>
                            <p>{{ driverItem.email }}</p>
                            <div class="driver-badges">
                                <span :class="driverItem.ativo == 1 ? 'status-active' : 'status-inactive'">
                                    {{ driverItem.ativo == 1 ? "Ativo" : "Inativo" }}
                                </span>
                                <span class="temporary-password" v-if="driverItem.senha_temporaria == 1">Senha temporária</span>
                            </div>
                        </div>
                    </div>
                    <div class="driver-card-actions">
                        <button class="rounded-btn small btn-gray" type="button" @click="editDriver(driverItem)" title="Editar">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="rounded-btn small btn-blue" type="button" @click="resetDriverPassword(driverItem)" :disabled="resettingPasswordId !== null" title="Reenviar senha">
                            <span class="material-icons" :class="{ 'spin-icon': resettingPasswordId === driverItem.id }">
                                {{ resettingPasswordId === driverItem.id ? "sync" : "vpn_key" }}
                            </span>
                        </button>
                        <button class="rounded-btn small btn-red" type="button" @click="confirmDeleteDriver(driverItem)" title="Excluir">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <modal v-if="showModal" :modaltitle="modalTitle" :modalbutton1="modalButton1" :excludepath="'/shipping/drivers/' + editId"
            :modalbutton2="modalButton2" :modalbutton3="modalButton3"
            @closeModal="closeModalFunction(); returnDrivers();">
        </modal>
    </div>
</template>

<script>
import { globalMethods } from "@/js/globalMethods";
import api from "../../configs/api";
import modal from "../modal.vue";

export default {
    name: "shippingDriversConfig",
    mixins: [globalMethods],
    data() {
        return {
            drivers: [],
            editingDriverId: null,
            contentLoaded: false,
            saving: false,
            activeFilter: null,
            resettingPasswordId: null,
            driver: {
                name: "",
                email: "",
                active: true
            }
        }
    },
    computed: {
        activeDrivers: function () {
            return this.drivers.filter((driver) => driver.ativo == 1).length;
        },
        inactiveDrivers: function () {
            return this.drivers.filter((driver) => driver.ativo != 1).length;
        },
        temporaryPasswordDrivers: function () {
            return this.drivers.filter((driver) => driver.senha_temporaria == 1).length;
        },
        filteredDrivers: function () {
            if (!this.activeFilter) {
                return this.drivers;
            }
            if (this.activeFilter === 'active') {
                return this.drivers.filter(d => d.ativo == 1);
            }
            if (this.activeFilter === 'inactive') {
                return this.drivers.filter(d => d.ativo != 1);
            }
            if (this.activeFilter === 'temp_password') {
                return this.drivers.filter(d => d.senha_temporaria == 1);
            }
            return this.drivers;
        }
    },
    methods: {
        driverInitials: function (name) {
            return String(name || "?")
                .trim()
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();
        },
        resetForm: function () {
            this.editingDriverId = null;
            this.driver = {
                name: "",
                email: "",
                active: true
            };
        },
        saveDriver: function () {
            this.saving = true;
            let request;
            let data = {
                name: this.driver.name,
                email: this.driver.email,
                active: this.driver.active
            };

            if (this.editingDriverId) {
                request = api.patch("/shipping/drivers/" + this.editingDriverId, data);
            } else {
                request = api.post("/shipping/drivers", data);
            }

            request.then(() => {
                this.setResponse(this.editingDriverId ? "Entregador alterado com sucesso" : "Entregador criado e senha enviada por email", "success");
                this.resetForm();
                this.returnDrivers();
            }).catch((error) => {
                this.setResponse(error.response?.data || "Não foi possível salvar o entregador", "error");
            }).finally(() => {
                this.saving = false;
            })
        },
        editDriver: function (driverItem) {
            this.editingDriverId = driverItem.id;
            this.driver = {
                name: driverItem.nome,
                email: driverItem.email,
                active: driverItem.ativo == 1
            };
            this.$nextTick(() => {
                const el = document.querySelector(".driver-form");
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            });
        },
        confirmDeleteDriver: function (driverItem) {
            this.editId = driverItem.id;
            this.showModalFunction("Excluir entregador", "Excluir", "Cancelar");
        },
        resetDriverPassword: function (driverItem) {
            this.resettingPasswordId = driverItem.id;
            api.patch("/shipping/drivers/" + driverItem.id + "/reset-password").then(() => {
                this.setResponse("Senha temporária reenviada por email", "success");
                this.returnDrivers();
            }).catch((error) => {
                this.setResponse(error.response?.data || "Não foi possível reenviar a senha", "error");
            }).finally(() => {
                this.resettingPasswordId = null;
            })
        },
        toggleFilter: function (filterType) {
            if (this.activeFilter === filterType) {
                this.activeFilter = null;
            } else {
                this.activeFilter = filterType;
            }
        },
        returnDrivers: function () {
            this.contentLoaded = false;

            api.get("/shipping/drivers").then((response) => {
                this.drivers = response.data.returnObj || [];
                this.contentLoaded = true;
            }).catch((error) => {
                this.setResponse(error.response?.data || "Não foi possível retornar os entregadores", "error");
                this.contentLoaded = true;
            })
        }
    },
    mounted: function () {
        this.returnDrivers();
    },
    components: {
        modal
    }
}
</script>

<style scoped>
.section-heading {
    align-items: center;
    border-bottom: 1px solid var(--gray-3);
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
}

.section-heading p,
.drivers-list-header p,
.panel-title p {
    color: var(--gray);
    margin-top: var(--space-1);
}

.section-heading .btn,
.driver-actions .btn {
    margin: 0;
}

.section-heading .btn,
.driver-actions .btn,
.driver-card-actions .rounded-btn {
    gap: var(--space-2);
}

/* drivers-summary Stats Cards */
.drivers-summary {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: var(--space-6);
}

.summary-item {
    align-items: center;
    background: var(--white);
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-md);
    display: flex;
    gap: var(--space-4);
    padding: var(--space-5);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.summary-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    transition: width 0.2s ease;
}

.summary-item.active-drivers::before {
    background: var(--green);
}

.summary-item.temp-pass-drivers::before {
    background: var(--yellow);
}

.summary-item.inactive-drivers::before {
    background: var(--red);
}

.summary-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: var(--gray-2);
}

/* Selected Filter State */
.summary-item.selected {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-item.active-drivers.selected {
    background: var(--green-high-2);
    border-color: var(--green);
}

.summary-item.temp-pass-drivers.selected {
    background: #FFF9E6;
    border-color: var(--yellow);
}

.summary-item.inactive-drivers.selected {
    background: var(--red-high);
    border-color: var(--red);
}

.summary-item > span {
    align-items: center;
    border-radius: var(--radius-full);
    display: flex;
    height: 46px;
    justify-content: center;
    width: 46px;
    font-size: 24px;
    transition: background 0.3s ease;
}

.summary-item.active-drivers > span {
    background: var(--green-high-2);
    color: var(--green-low);
}

.summary-item.temp-pass-drivers > span {
    background: #FFF9E6;
    color: var(--yellow-low);
}

.summary-item.inactive-drivers > span {
    background: var(--red-high);
    color: var(--red-low);
}

.summary-item h3 {
    font-size: var(--fontsize-md);
    font-weight: 700;
}

.summary-item p {
    color: var(--gray);
    font-size: var(--fontsize-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--space-1);
}

/* Drivers Layout & Panels */
.drivers-layout {
    display: grid;
    gap: var(--space-6);
    grid-template-columns: minmax(280px, 360px) 1fr;
}

.driver-panel {
    background: var(--white);
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    padding: var(--space-6);
    height: fit-content;
}

.driver-form,
.drivers-list {
    display: grid;
    gap: var(--space-5);
}

.panel-title {
    align-items: center;
    display: flex;
    gap: var(--space-3);
    border-bottom: 1px solid var(--gray-high);
    padding-bottom: var(--space-3);
    margin-bottom: var(--space-2);
}

.panel-title > span {
    color: var(--blue);
    font-size: 28px;
}

.panel-title h3 {
    font-size: var(--fontsize-sm);
    font-weight: 700;
}

/* Form Styles */
.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.form-group label {
    font-weight: 600;
    font-size: var(--fontsize-xs);
    color: var(--gray);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group input[type="text"],
.form-group input[type="email"] {
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    font-family: inherit;
    font-size: var(--fontsize-sm);
    transition: all 0.2s ease;
    height: 42px;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(62, 105, 144, 0.15);
    outline: none;
}

.checkbox-group {
    align-items: center;
    flex-direction: row;
    gap: var(--space-3);
    cursor: pointer;
    margin-top: var(--space-1);
}

.checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--blue);
}

.checkbox-group label {
    cursor: pointer;
    text-transform: none;
    font-size: var(--fontsize-sm);
    font-weight: 500;
    color: var(--black);
}

.driver-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-3);
}

.driver-actions .btn {
    flex: 1;
    min-width: 120px;
}

/* Drivers List Header */
.drivers-list-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--gray-high);
    padding-bottom: var(--space-3);
}

.drivers-list-header h3 {
    font-size: var(--fontsize-sm);
    font-weight: 700;
}

.filter-indicator {
    color: var(--blue-low) !important;
    font-weight: 600;
}

/* Driver Cards */
.driver-card {
    align-items: center;
    background: var(--white);
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-sm);
    display: flex;
    gap: var(--space-4);
    justify-content: space-between;
    padding: var(--space-4);
    transition: all 0.2s ease;
}

.driver-card:hover {
    border-color: var(--blue-high);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.driver-identity {
    align-items: center;
    display: flex;
    gap: var(--space-4);
    min-width: 0;
}

.driver-avatar {
    align-items: center;
    background: var(--blue-high-2);
    border: 1px solid var(--blue-high);
    border-radius: var(--radius-full);
    color: var(--blue-low);
    display: flex;
    flex-shrink: 0;
    font-weight: bold;
    font-size: var(--fontsize-sm);
    height: 48px;
    justify-content: center;
    width: 48px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
}

.driver-identity h3 {
    font-size: var(--fontsize-sm);
    font-weight: 600;
}

.driver-identity p {
    color: var(--gray);
    margin: var(--space-1) 0;
    font-size: var(--fontsize-xs);
    word-break: break-all;
}

.driver-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
}

/* Pastel Badges */
.status-active,
.status-inactive,
.temporary-password {
    border-radius: 9999px; /* Pill layout instead of ellipses */
    font-weight: 600;
    font-size: 10px;
    padding: 3px 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-flex;
    align-items: center;
}

.status-active {
    background: var(--green-high-2);
    color: var(--green-low);
    border: 1px solid rgba(35, 150, 127, 0.2);
}

.status-inactive {
    background: var(--red-high);
    color: var(--red-low);
    border: 1px solid rgba(234, 43, 43, 0.2);
}

.temporary-password {
    background: #FFF9E6;
    color: var(--yellow-low);
    border: 1px solid rgba(240, 187, 0, 0.2);
}

/* Card Actions */
.driver-card-actions {
    align-items: center;
    display: flex;
    gap: var(--space-2);
}

.driver-card-actions .rounded-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 !important; /* Clear any custom padding to center the icon */
    margin: 0;
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
    max-width: 32px !important;
    max-height: 32px !important;
    border-radius: var(--radius-full) !important;
    transition: transform 0.2s, background-color 0.2s;
}

.driver-card-actions .rounded-btn:hover {
    transform: scale(1.1);
}

.driver-card-actions .rounded-btn span {
    font-size: 16px !important;
    color: inherit !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    height: auto;
}

.spin-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.empty-list {
    align-items: center;
    border: 2px dashed var(--gray-3);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    justify-content: center;
    padding: var(--space-8);
    background: var(--gray-high);
    text-align: center;
}

.empty-list span {
    color: var(--gray-2);
    font-size: 48px;
}

.empty-list p {
    font-size: var(--fontsize-sm);
    color: var(--gray);
    font-weight: 500;
}

@media (max-width: 900px) {
    .section-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: var(--space-3);
    }

    .section-heading .btn {
        width: 100%;
    }

    .drivers-layout {
        grid-template-columns: 1fr;
    }

    .driver-card {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-4);
    }

    .driver-card-actions {
        width: 100%;
        justify-content: flex-end;
        border-top: 1px solid var(--gray-high);
        padding-top: var(--space-3);
    }
}
</style>
