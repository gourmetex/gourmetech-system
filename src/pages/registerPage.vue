<template>
    <div class="register-page">
        <img src="../assets/img/logo-gourmetech.svg" class="company-logo-p">
        <div class="register-container">
            <form @submit.prevent="register()" id="register-form">
                <h2>REGISTRAR</h2>
                <div class="form-group">
                    <label for="name">Nome</label>
                    <input type="text" id="name" name="name" maxlength="45" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="example@domain.com" required>
                </div>
                <div class="form-group">
                    <label for="password">Senha</label>
                    <input type="password" name="password" id="password" required>
                </div>
                <div class="form-group">
                    <label for="repeat-password">Repita a senha</label>
                    <input type="password" id="repeat-password" required>
                </div>
                <button type="submit" class="btn btn-primary" id="register-button">Registrar</button>
                <div class="complement">
                    <h3>Já possui cadastro? <router-link to="/login"><span>Entre</span></router-link></h3>
                    <h3 class="response">{{ response }}</h3>
                </div>
            </form>
        </div>
        <h3 class="copyright">© {{ year }} Gourmetech - Todos os direitos reservados</h3>
    </div>
</template>
<script>
import api from "../configs/api.js";
import { globalMethods } from '@/js/globalMethods';
import $ from 'jquery';

export default {
    name: "registerPage",
    mixins: [globalMethods],
    methods: {
        returnUrlParams: function () {
            let url = new URLSearchParams(window.location.search);
            let token = url.get("token");
            let email = decodeURI(url.get("email"));
            
            let obj = {
                token: token ? token : "",
                email: email != "null" && email != "" ? email : ""
            }

            return obj;
        },
        register: function () {
            let self = this;

            let registerButton = $("#register-button");
            registerButton.attr("disabled", "disabled").addClass("btn-loading");

            let data = $("#register-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["token"] = this.returnUrlParams().token;
            data["temporary_password"] = "";
            data["salary"] = 0;
            data["role"] = "";
            data["company_name"] = "";

            let password = $("#password").val();
            let repeatPassword = $("#repeat-password").val();

            if (password == repeatPassword) {
                api.post("/users/register", data).then((res) => {
                    self.setResponse(res.data.message, "success");
                    self.logoutUser();
                }).catch((error) => {
                    self.setResponse(error.response.data, "error");
                }).then(() => {
                    registerButton.removeAttr("disabled").removeClass("btn-loading");
                })
            } else {
                self.setResponse("As senhas não coincidem", "error");
                registerButton.removeAttr("disabled").removeClass("btn-loading");
            }
        }
    },
    mounted: function () {
        $("#email").val(this.returnUrlParams().email);
    }
}
</script>
<style scoped>
.register-page {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100vw;
    height: 100vh;
}

.company-logo-p {
    top: 10vh;
}

.company-logo-p, .copyright {
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    text-align: center;
}

.copyright {
    bottom: 10vh;
}

.register-container {
    display: flex;
    flex-direction: column;
}

.complement {
    margin-top: var(--space-3);
    text-align: center;
}

    .complement span {
        cursor: pointer;
        text-decoration: underline;
    }
</style>