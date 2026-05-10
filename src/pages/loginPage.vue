<template>
    <div class="login-page">
        <img src="../assets/img/logo-gourmetech.svg" class="company-logo-p">
        <div class="login-container">
            <form @submit.prevent="login()" id="login-form">
                <h2>LOGIN</h2>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="text" id="email" name="email" v-model="email" placeholder="example@domain.com" required>
                </div>
                <div class="form-group">
                    <label for="password">Senha</label>
                    <input type="password" name="password" id="password" v-model="temporary_password" required>
                </div>
                <button type="submit" class="btn btn-primary" id="login-button">Entrar</button>
                <div class="complement">
                    <h3>Não tem cadastro? <span>Contate-nos</span></h3>
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
    name: "loginPage",
    mixins: [globalMethods],
    data() {
        return {
            email: "",
            temporary_password: ""
        }
    },
    methods: {
        login: function () {
            let self = this;

            let loginButton = $("#login-button");
            loginButton.attr("disabled", "disabled").addClass("btn-loading");

            let data = $("#login-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            api.post("/users/login", data).then((res) => {
                self.setResponse(res.data.message, "success");
                self.setJwtInLocalStorage(res.data.returnObj.jwtToken);
                
                self.returnMenuOptions().then(() => {
                    self.$router.push("/home");
                });
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            }).then(() => {
                loginButton.removeAttr("disabled").removeClass("btn-loading");
            })
        },
        verifyParams: function () {
            let url = new URLSearchParams(window.location.search);
            let email = decodeURI(url.get("email"))
            let temporaryPassword = url.get("tp");

            if (email && temporaryPassword) {
                this.email = email;
                this.temporary_password = temporaryPassword;

                return true;
            }

            return false;
        }
    },
    mounted: function () {
        if (!this.verifyParams()) {
            this.checkIfUserIsAuthenticated();
        }
    }
}
</script>
<style scoped>
.login-page {
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

.login-container {
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