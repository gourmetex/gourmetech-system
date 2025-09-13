import $ from 'jquery';
import api from '../configs/api.js';
import axios from 'axios';
import moment from 'moment';

export const globalMethods = {
    methods: {
        // Métodos response
        setResponse: function (message, objClass) {
            this.resetResponse();

            let response = $(".response");

            response.addClass(objClass);

            if (objClass == "error") {
                $("#modal-submit-button").removeAttr("disabled").removeClass("btn-loading");
                $("#modal-save-submit-button").removeAttr("disabled").removeClass("btn-loading");
            }

            this.response = message;
        },
        resetResponse: function () {
            let response = $(".response");

            this.response = "";
            response.removeClass("error").removeClass("success");
        },
        //Métodos modal
        showModalFunction: function (modalTitle, modalButton1, modalButton2, modalButton3 = "") {
            this.modalTitle = modalTitle;
            this.modalButton1 = modalButton1;
            this.modalButton2 = modalButton2;
            this.modalButton3 = modalButton3;
            this.showModal = true;

            $(".inner-page-system").css("overflow-y", "hidden");
        },
        closeModalFunction: function () {
            this.closeModalContent();

            this.reloadGrid = true;

            setTimeout(() => {
                this.showModal = false;

                this.modalTitle = "";
                this.modalButton1 = "";
                this.modalButton2 = "";
                this.submitContent = false;

                this.reloadGrid = false;
                this.descelectRows();
                $(".inner-page-system").css("overflow-y", "auto");
            }, 400);
        },
        closeModalContent: function () {
            let modal = $(".modal-container");
            modal.css("opacity", 0).css("transform", "translateY(-20vh)");
        },
        openSmallModal: function (modalId = "") {
            let smallModal = $(modalId || ".small-modal");
            let smallModalWrapper = $(".small-modal-wrapper");

            smallModal.show();
            smallModalWrapper.show();
            setTimeout(() => {
                smallModal.css("transform", "translateY(0)").css("opacity", 1);
            }, 1)
        },
        closeSmallModal: function () {
            let smallModal = $(".small-modal");
            let smallModalWrapper = $(".small-modal-wrapper");

            smallModal.css("transform", "translateY(-10vh)").css("opacity", 0);
            setTimeout(() => {
                smallModalWrapper.hide();
                smallModal.hide();
            }, 400)
        },
        //Métodos autenticação
        checkModulePermission: function (permission) {
            return this.$root.menuOptions.some(modulo => modulo.codigo === permission);
        },
        logoutUser: function () {
            let self = this;

            self.removeJwtFromLocalStorage();
            self.$router.push("/login");
        },
        setJwtInLocalStorage: function (token) {
            localStorage.setItem("gourmetech_jwt", token);
            this.checkAndSetJwt();
        },
        getJwtInLocalStorage: function () {
            return localStorage.getItem("gourmetech_jwt");
        },
        removeJwtFromLocalStorage: function () {
            localStorage.removeItem("gourmetech_jwt");
            this.$root.menuOptions = [];
        },
        checkAndSetJwt: function() {
            let interval = setInterval(() => {
                let jwt = this.getJwtInLocalStorage();
                if (jwt != null) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
                    this.$root.jwtLoaded = true;
                    clearInterval(interval);
                }
            }, 100)
        },
        checkIfUserIsAuthenticated: function () {
            return new Promise((resolve) => {
                let self = this;
                let pathName = window.location.href;
                let jwt = "Bearer " + self.getJwtInLocalStorage();
                
                if (jwt == "Bearer null") {
                    if (pathName.indexOf("/home") != -1) {
                        self.$router.push("/login");
                        return;
                    }
                } else {
                    let data = {
                        token: jwt
                    }

                    api.post("/users/check_jwt", data) // Se ja estiver logado no sistema e acessar a página de login, é checkado a valia do token JWT e então redirecionado para a index.
                    .then(function (res) { 
                        self.setJwtInLocalStorage(res.data.returnObj.newToken); // Setando o novo jwt que foi resetado

                        if (pathName.indexOf("/login") != -1) { // Se o usuário estiver logado e entrar em login, o mesmo é logado novamente e direcionado para a index.
                            let loginForm = $("#login-form");
                            loginForm.find("input").attr("disabled", "disabled");
                            loginForm.find("button").attr("disabled", "disabled").addClass("btn-loading");

                            setTimeout(() => {
                                self.$router.push("/home");
                            }, 1000);
                        }
                        resolve();
                    })
                    .catch(function () { // Caso contrário ele é deslogado e enviado para login.
                        self.logoutUser();
                        return;
                    })
                    .then(function () { // Chamada recursiva da função se o usuario estiver na home
                        if (pathName.indexOf("/home") != -1) {
                            setTimeout(self.checkIfUserIsAuthenticated, 10 * 1000);
                        }
                    })
                }
            })
        },
        //Métodos retorno objetos globais
        returnMenuOptions: function () {
            let self = this;
            let jwt = localStorage.getItem("gourmetech_jwt");

            if (!jwt || (self.$root.menuOptions != undefined && self.$root.menuOptions.length != 0)) return;

            return new Promise((resolve) => {
                api.get("/users/return_menus", {headers: {Authorization: "Bearer " + jwt}}).then((response) => {
                    self.$root.menuOptions = response.data.returnObj;
                    resolve();
                }).catch((error) => {
                    console.log(error);
                })
            })
        },
        requireCompany: function (company_id) {
            return new Promise((resolve) => {
                let self = this;
                
                api.get("/companies/" + company_id + "/return_company").then((response) => {
                    self.$root.company = response.data.returnObj;
                    resolve();
                })
            })
        },
        requireUser: function () {
            return new Promise((resolve) => {
                let self = this;

                api.get("/users/return_user").then((response) => {
                    self.$set(self.$root, 'user', response.data.returnObj);

                    setTimeout(() => {
                        self.requireUser();
                    }, 30 * 1000);

                    resolve();
                })
            })
        },
        returnSelectedTheme: function () {
            return new Promise((resolve) => {
                let self = this;

                api.get("/companies/theme").then((response) => {
                    self.$root.selectedTheme = response.data.returnObj;
                    resolve();
                })
            })
        },
        //Métodos retorno objetos
        searchCEP: function (cep) {
            return new Promise((resolve, reject) => {
                cep = cep.replace(/\D/g, '');
                
                axios.get(`/api/ws/${cep}/json/`)
                .then(response => {
                    const data = response.data;

                    if (!data.erro) {
                        let address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

                        resolve(address);
                    } else {
                        alert('CEP não encontrado!')
                    }
                })
                .catch((erro) => {
                    reject(erro);
                })
            })
        },
        //Metodos manipulação objetos
        selectRow: function (event) {
            this.descelectRows();
            
            let id = $(event.target).html();
            let parent = $(event.target).parent().parent();

            this.showEditButtons();
            this.editId = parseInt(id);
            this.selectGridRow(parent);
        },
        showEditButtons: function () {
            let editButtons = $(".dynamic-edit-buttons");

            editButtons.show();
        },
        hideEditButtons: function () {
            let editButtons = $(".dynamic-edit-buttons");

            editButtons.hide();
        },
        selectGridRow: function (row) {
            if (row.hasClass("row-selected")) {
                this.descelectRows();
            } else {
                row.addClass("row-selected");                
            }
        },
        descelectRows: function () {
            let allRows = $("td, tr");

            allRows.removeClass("row-selected");
            this.editId = null;
            this.hideEditButtons();
        },
        inputMoneyCheck: function (event) {
            var valor = event.target.value.replace(/\D/g, '');
            
            // Transforma em número decimal com duas casas
            var valorNumerico = parseInt(valor) / 100;

            // Formata para o formato monetário brasileiro
            var valorFormatado = valorNumerico.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            // Atualiza o valor do input
            event.target.value = valorFormatado;

            // Mantém a posição do cursor no final do texto
            event.target.setSelectionRange(valorFormatado.length, valorFormatado.length);
        },
        inputTelCheck: function (event) {
            let target = $(event.target);
            const formattedValue = this.formatTel(target.val());
            target.val(formattedValue);
        },
        disableActionsButtons: function (addButton = true, excludeButton = true, editButton = true) {
            this.disabledButtons = [];
            
            if (addButton) {
                this.disabledButtons.push(1);
            }

            if (excludeButton) {
                this.disabledButtons.push(2);
            }

            if (editButton) {
                this.disabledButtons.push(3);
            }
        },
        //Métodos de manipulação de inputs
        groupObservations: function (input) {
            if (input == null) {
                return "";
            }

            // Divide a string em itens baseados na vírgula e remove espaços em branco extras
            let itens = input.split(',')
                       .map(item => item.trim())
                       .filter(item => item !== "");

            // Se não houver itens válidos, retorna vazio
            if (itens.length === 0) {
                return "";
            }
            
            itens = itens.flatMap(item => {
                const parts = item.split(' '); // Divide a string inteira em partes baseadas em espaços
                const count = parseInt(parts[0], 10); // Tenta converter o primeiro elemento em um número
                if (!isNaN(count) && parts.length > 1) {
                    const description = parts.slice(1).join(' '); // Junta os restantes elementos como a descrição
                    return Array(count).fill(description);
                }
                return [item];
            });
            
            // Contador para armazenar a frequência de cada item
            const contador = {};

            // Preenche o contador
            itens.forEach(item => {
                if (item in contador) {
                    contador[item]++;
                } else {
                    contador[item] = 1;
                }
            });

            // Verifica se existe apenas uma observação e se a contagem é 1
            const chaves = Object.keys(contador);
            if (chaves.length === 1 && contador[chaves[0]] === 1) {
                return chaves[0]; // Retorna apenas a observação sem número
            }

            // Constrói a string de resultado agrupando os itens com suas contagens
            const resultado = chaves.map(key => `${contador[key]} ${key}`).join(', ');

            return resultado;
        },
        loadPreferences: function () {
            for (let i = 0; i < this.preferences.length; i++) {
                let currentPreferenceGroup = this.preferences[i];
                let groupElement = $(".preferences-group[datalabel='" + currentPreferenceGroup.label + "']");

                groupElement.find("input[type='radio'][value='" + currentPreferenceGroup.preferences[0]?.nome + "']").prop('checked', true);
            }
        },
        //Métodos de formatação de valores ou strings
        formatCurrency: function (value) {
            const numeroLimpo = value.toString().replace(/[^\d.,]/g, ''); 
            const partes = numeroLimpo.replace(".", ",").split(',');
            
            let numeroRetorno;

            if (partes.length > 1) {
                numeroRetorno = `R$ ${partes[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')},${partes[1].slice(0, 2)}`;
            } else {
                numeroRetorno = `R$ ${partes[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;
            }
            
            return numeroRetorno;
        },
        formatTel: function (value) {
            let numberTemplate = "(00) 0 0000-0000";
            let number = value.replace("+55", "").replace("(", "").replace(")", "").replace("-", "").replace(" ", '').replace(" ", '');
            let formattedNumber = [], numberPosition = 0;
            for (let i in numberTemplate) {
                if (numberTemplate[i] == "0") {
                    formattedNumber[i] = number[numberPosition];
                    numberPosition++;
                } else {
                    formattedNumber[i] = numberTemplate[i];
                }
            }

            return formattedNumber.join('');
        },
        formatTelToSubmit: function (value) {
            // Remove everything that is not a number
            const numbers = value.replace("+55", "").replace(/\D/g, '');

            // Limit the string to a maximum of 11 digits
            const truncatedNumbers = numbers.slice(0, 11);

            // Add the country code +55
            const formattedNumber = `+55${truncatedNumbers}`;

            return formattedNumber;
        },
        formatDecimalValues: function (value) {
            const numeroLimpo = value.toString().replace(/[^\d,]/g, '').replace(",", ".");
            let formattedFloat = parseFloat(numeroLimpo);
            return formattedFloat;
        },
        formatDateFromDb: function (date) {
            return date.replace(' ', 'T').slice(0, -3);
        },
        formatDateFromNow: function (date) {
            return moment(date).fromNow();
        },
        capitalize: (str) => {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
        //Métodos de utilitários
        getContrastColorFromCssVariable(variable) {
            let $tempElement = $("<div>").css("color", variable).appendTo("body");
            let computedColor = $tempElement.css("color");

            $tempElement.remove();

            let hexColor = this.rgbToHex(computedColor);
            let contrastColor = this.calculateContrastColor(hexColor);

            return contrastColor;
        },
        rgbToHex(rgb) {
            let result = rgb.match(/\d+/g);
            if (!result || result.length < 3) return null;

            let r = parseInt(result[0]);
            let g = parseInt(result[1]);
            let b = parseInt(result[2]);

            return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
        },
        calculateContrastColor(hexColor) {
            let r = parseInt(hexColor.slice(1, 3), 16);
            let g = parseInt(hexColor.slice(3, 5), 16);
            let b = parseInt(hexColor.slice(5, 7), 16);

            let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            return luminance > 0.5 ? "#000000" : "#FFFFFF";
        },
        //Métodos configurações
        cancel: function () {
            this.$emit("cancel");
        }
    },
    mounted: function () {
        moment.locale("pt-br");
    },
    watch: {
        editId: function () {
            if (this.editId != null) {
                this.disableActionsButtons(false, false, false);
            } else {
                this.disableActionsButtons(false, true, true);
                this.descelectRows();
                this.descelectRows();
            }
        }
    },
    data() {
        return {
            response: "",
            year: new Date().getFullYear(),
            showModal: false,
            modalTitle: "",
            modalButton1: "",
            modalButton2: "",
            modalButton3: "",
            closeModal: false,
            reloadGrid: false,
            editId: null,
            disabledButtons: [],
            preferences: [],
            contentLoaded: false
        }
    }
}