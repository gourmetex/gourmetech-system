<template>
    <div class="shipping-drivers-config config-page">
        <div class="section-heading">
            <div>
                <h2>Entregadores</h2>
                <p>Perfis de acesso para o app Compra Rápida Entrega</p>
            </div>
            <button class="btn btn-gray" type="button" @click="returnDrivers">
                <span class="material-icons">refresh</span>
                Atualizar
            </button>
        </div>

        <div class="drivers-summary">
            <div class="summary-item">
                <span class="material-icons">delivery_dining</span>
                <div>
                    <p>Ativos</p>
                    <h3>{{ activeDrivers }}</h3>
                </div>
            </div>
            <div class="summary-item">
                <span class="material-icons">vpn_key</span>
                <div>
                    <p>Senha temporária</p>
                    <h3>{{ temporaryPasswordDrivers }}</h3>
                </div>
            </div>
            <div class="summary-item">
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
                    <button type="button" class="btn btn-gray" v-if="editingDriverId" @click="resetForm">
                        Cancelar
                    </button>
                </div>
                <p class="response">{{ response }}</p>
            </form>

            <div class="drivers-list driver-panel">
                <div class="drivers-list-header">
                    <div>
                        <h3>Lista de entregadores</h3>
                        <p>{{ drivers.length }} cadastrado{{ drivers.length == 1 ? "" : "s" }}</p>
                    </div>
                </div>
                <div class="empty-list" v-if="drivers.length == 0 && contentLoaded">
                    <span class="material-icons">person_off</span>
                    <p>Nenhum entregador cadastrado</p>
                </div>
                <div class="driver-card" v-for="driverItem in drivers" :key="driverItem.id">
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
                        <button class="rounded-btn small btn-blue" type="button" @click="resetDriverPassword(driverItem)" title="Reenviar senha">
                            <span class="material-icons">key</span>
                        </button>
                        <button class="rounded-btn small btn-red" type="button" @click="deactivateDriver(driverItem)" v-if="driverItem.ativo == 1" title="Desativar">
                            <span class="material-icons">block</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from "@/js/globalMethods";
import api from "../../configs/api";

export default {
    name: "shippingDriversConfig",
    mixins: [globalMethods],
    data() {
        return {
            drivers: [],
            editingDriverId: null,
            contentLoaded: false,
            saving: false,
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
                this.setResponse(error.response?.data || "Nao foi possivel salvar o entregador", "error");
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
        },
        deactivateDriver: function (driverItem) {
            if (!confirm("Desativar este entregador?")) {
                return;
            }

            api.delete("/shipping/drivers/" + driverItem.id).then(() => {
                this.setResponse("Entregador desativado", "success");
                this.returnDrivers();
            }).catch((error) => {
                this.setResponse(error.response?.data || "Nao foi possivel desativar o entregador", "error");
            })
        },
        resetDriverPassword: function (driverItem) {
            api.patch("/shipping/drivers/" + driverItem.id + "/reset-password").then(() => {
                this.setResponse("Senha temporaria reenviada por email", "success");
                this.returnDrivers();
            }).catch((error) => {
                this.setResponse(error.response?.data || "Nao foi possivel reenviar a senha", "error");
            })
        },
        returnDrivers: function () {
            this.contentLoaded = false;

            api.get("/shipping/drivers").then((response) => {
                this.drivers = response.data.returnObj || [];
                this.contentLoaded = true;
            }).catch((error) => {
                this.setResponse(error.response?.data || "Nao foi possivel retornar os entregadores", "error");
                this.contentLoaded = true;
            })
        }
    },
    mounted: function () {
        this.returnDrivers();
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

.drivers-summary {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: var(--space-6);
}

.summary-item {
    align-items: center;
    background: var(--gray-high);
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-sm);
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
}

.summary-item > span {
    align-items: center;
    background: var(--white);
    border-radius: var(--radius-sm);
    color: var(--blue);
    display: flex;
    height: 42px;
    justify-content: center;
    width: 42px;
}

.summary-item p {
    color: var(--gray);
}

.drivers-layout {
    display: grid;
    gap: var(--space-6);
    grid-template-columns: minmax(260px, 360px) 1fr;
}

.driver-panel {
    border: 1px solid var(--gray-3);
    border-radius: var(--radius-sm);
    padding: var(--space-5);
}

.driver-form,
.drivers-list {
    display: grid;
    gap: var(--space-4);
}

.panel-title {
    align-items: center;
    display: flex;
    gap: var(--space-3);
}

.panel-title > span {
    color: var(--green);
}

.checkbox-group {
    align-items: center;
    display: flex;
    gap: var(--space-2);
}

.checkbox-group input {
    min-width: auto;
}

.driver-actions,
.driver-card-actions,
.drivers-list-header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.drivers-list-header {
    justify-content: space-between;
}

.driver-card {
    align-items: center;
    border-top: 1px solid var(--gray-3);
    border-radius: var(--radius-sm);
    display: flex;
    gap: var(--space-4);
    justify-content: space-between;
    padding: var(--space-4) 0;
}

.driver-card:first-of-type {
    border-top: 0;
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
    height: 44px;
    justify-content: center;
    width: 44px;
}

.driver-card p,
.empty-list p {
    color: var(--gray);
    margin: var(--space-1) 0;
}

.driver-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
}

.status-active,
.status-inactive,
.temporary-password {
    border-radius: var(--radius-sm);
    color: var(--white);
    display: inline-block;
    font-size: var(--fontsize-sm);
    padding: 4px 8px;
}

.status-active {
    background: var(--green);
}

.status-inactive {
    background: var(--red);
}

.temporary-password {
    background: var(--yellow);
    color: var(--black);
}

.empty-list {
    align-items: center;
    border: 1px dashed var(--gray-3);
    border-radius: var(--radius-sm);
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    padding: var(--space-8);
}

.empty-list span {
    color: var(--gray);
}

.driver-card-actions .rounded-btn {
    margin: 0;
}

@media (max-width: 900px) {
    .section-heading,
    .driver-card {
        align-items: flex-start;
    }

    .section-heading,
    .drivers-layout,
    .driver-card {
        grid-template-columns: 1fr;
    }

    .section-heading,
    .driver-card {
        display: grid;
    }

    .drivers-summary {
        grid-template-columns: 1fr;
    }
}
</style>
