<template>
    <div class="profile-component">
        <div class="page-title">
            <h1>Meu Perfil</h1>
        </div> 
        <div class="profile-card card">
            <div class="profile-avatar-section">
                <form @submit.prevent="upload">
                    <img :src="$root.user.url_foto_perfil" :alt="$root.user.nome" class="profile-avatar" />
                    <input type="file" id="user-photo" v-show="false" accept="image/png,image/jpeg" v-on:change="upload">
                </form>
                <button type="button" class="btn btn-secondary btn-sm" v-on:click="handleSelectPhoto()">
                    <span class="material-icons" style="font-size: 16px; margin-right: 4px;">photo_camera</span> Alterar foto
                </button>
            </div>
            <div class="profile-details-section">
                <div class="profile-header-info">
                    <h2>{{ $root.user.nome }}</h2>
                    <span class="profile-badge">{{ $root.user.cargo || 'Administrador' }}</span>
                </div>
                <div class="profile-meta-grid">
                    <div class="meta-item">
                        <span class="material-icons meta-icon">email</span>
                        <div>
                            <span class="meta-label">E-mail</span>
                            <span class="meta-value">{{ $root.user.email }}</span>
                        </div>
                    </div>
                    <div class="meta-item" v-if="$root.user.empresa">
                        <span class="material-icons meta-icon">business</span>
                        <div>
                            <span class="meta-label">Empresa vinculada</span>
                            <span class="meta-value">ID #{{ $root.user.empresa }}</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <span class="material-icons meta-icon">verified_user</span>
                        <div>
                            <span class="meta-label">Status da conta</span>
                            <span class="meta-value status-active">Ativo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';
import api from "../../../configs/api";

export default {
    name: "profileComponent",
    methods: {
        handleSelectPhoto: function () {
            $("#user-photo").trigger("click");
        },
        upload(event) {
            const formData = new FormData();
            
            formData.append("user-image", event.target.files[0]);

            api.patch("/users/change_photo", formData).then(() => {
                location.reload();
            })
        },
    }
}
</script>
<style scoped>
.profile-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-8);
    max-width: 720px;
    margin-top: var(--space-4);
    padding: var(--space-6);
}

@media (max-width: 600px) {
    .profile-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
}

.profile-avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
}

.profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--line);
    background: var(--surface);
    box-shadow: 0 4px 12px rgba(43, 38, 32, 0.08);
}

.profile-details-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

.profile-header-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
}

.profile-header-info h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
}

.profile-badge {
    background: var(--paper);
    border: 1px solid var(--line);
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    color: var(--cor-destaque);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.profile-meta-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.meta-icon {
    font-size: 20px;
    color: var(--ink-soft);
    background: var(--paper);
    padding: 8px;
    border-radius: var(--radius-sm);
}

.meta-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--ink-soft);
}

.meta-value {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
}

.status-active {
    color: var(--good);
    font-weight: 700;
}

.btn-sm {
    padding: 6px 14px;
    font-size: 12px;
    height: 34px;
    min-width: auto;
}
</style>