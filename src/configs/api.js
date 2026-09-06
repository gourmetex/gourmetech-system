import axios from 'axios'

let url_api;

// Ambiente de desenvolvimento: segue o MESMO host de onde a pagina foi carregada, na porta
// 3000. O dev server ja sobe com --host 0.0.0.0 (acessivel tanto por localhost quanto pelo
// IP da LAN), entao isso cobre os dois casos sem precisar hardcodar IP nenhum - resolve
// tambem o IP mudando por DHCP, sem precisar editar este arquivo de novo.
// VUE_APP_API_URL sobrescreve isso quando front e back NAO estiverem na mesma maquina:
// crie um .env.local (fora do git, a raiz do projeto) com VUE_APP_API_URL=http://host:3000/
const dev_environment = process.env.VUE_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:3000/`; //Ambiente de desenvolvimento.
const test_environment = "https://gourmetech-coreteste-5d758e07e0da.herokuapp.com/"; //Ambiente de teste ou produção.
const publish_environment = "https://gourmetech-core-46715094ffeb.herokuapp.com/"; //Ambiente de teste ou produção.
// TROCA DO AMBIENTE DA API
//
// O parâmetro que deverá ser informado será 0 ou 1, sendo que:
// 0 - Ambiente de teste
// 1 - Ambiente de produção
// 
// ==============================
let ambient;
    
if (window.location.hostname.indexOf("localhost") != -1 || window.location.hostname.indexOf("192.168") != -1) {
    ambient = 0;
} else if (window.location.hostname.indexOf("dev.") != -1 || window.location.hostname.indexOf("dev-") != -1) {
    ambient = 1;
} else {
    ambient = 2;
}
// ==============================
//


switch (ambient) {
    case 0:
        url_api = dev_environment;
        break;
    case 1: 
        url_api = test_environment;
        break;
    case 2: 
        url_api = publish_environment;
        break;
}

const api = axios.create({
    baseURL: url_api
});

export default api;