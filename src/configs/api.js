import axios from 'axios'

let url_api;

const dev_environment = "http://localhost:3000/"; //Ambiente de desenvolvimento.
const test_environment = "https://gourmetech-coreteste-5d758e07e0da.herokuapp.com/"; //Ambiente de teste ou produção.

// https://gourmetech-coreteste-5d758e07e0da.herokuapp.com/  --  ambiente de teste
// https://gourmetech-core-46715094ffeb.herokuapp.com/       --  ambiente de produção         

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
}

const api = axios.create({
    baseURL: url_api
});

export default api;