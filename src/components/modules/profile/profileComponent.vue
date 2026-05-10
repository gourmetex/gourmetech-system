<template>
    <div class="profile-component">
        <div class="page-title">
            <h1>Perfil</h1>
        </div> 
        <div class="profile-container">
            <div class="image-container">
                <form @submit.prevent="upload">
                    <img :src="$root.user.url_foto_perfil" :alt="$root.user.nome" class="avatar-g" />
                    <input type="file" id="user-photo" v-show="false" accept="image/png,image/jpeg" v-on:change="upload">
                </form>
                <button type="button" class="btn btn-primary" v-on:click="handleSelectPhoto()">Alterar</button>
            </div>
            <div class="profile-informations">
                <h1>{{ $root.user.nome }}</h1>
                <p>{{ $root.user.email }}</p>
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
    },
    mounted: function () {
        
    }
}
</script>
<style scoped>
.image-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-3);
}

.profile-container {
    display: flex;
    align-items: center;
    gap: var(--space-10);
}

.profile-informations {
    margin-top: -3rem;
}
</style>