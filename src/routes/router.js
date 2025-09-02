import Vue from 'vue';
import VueRouter from 'vue-router';

import api from "../configs/api";

Vue.use(VueRouter);

import indexPage from '../pages/indexPage.vue';
import loginPage from '../pages/loginPage.vue';
import registerPage from '../pages/registerPage.vue';
import forbiddenPage from '../pages/forbiddenPage.vue'; // Página de acesso negado
import adminComponent from '../components/adminComponent.vue';
import productsComponent from '../components/modules/products/productsComponent.vue';
import homeComponent from '../components/homeComponent.vue';
import configComponent from "../components/configComponent.vue";
import stockComponent from "../components/modules/stock/stockComponent.vue";
import ordersComponent from "../components/modules/orders/ordersComponent.vue";
import customersComponent from "../components/modules/customers/customersComponent.vue";
import kitchenComponent from "../components/modules/kitchen/kitchenComponent.vue";
import printOut from "../components/printOut.vue";
import digitalMenuComponent from "../components/modules/digital_menu/digitalMenuComponent.vue";
import financialComponent from "../components/modules/financial/financialComponent.vue";
import whatsappComponent from "../components/modules/whatsapp/whatsappComponent.vue";
import newsletterComponent from "../components/modules/newsletter/newsletterComponent.vue";
import shippingComponent from "../components/modules/shipping/shippingComponent.vue";
import reportsComponent from "../components/modules/reports/reportsComponent.vue";
import reservationsComponent from "../components/modules/reservations/reservationsComponent.vue";
import profileComponent from "../components/modules/profile/profileComponent.vue";

const routes = [
    {
        path: '/home',
        component: indexPage,
        meta: {
            title: "Gourmetech",
            metaTags: [
                { name: "description", content: "Página inicial - Gourmetech" },
                { name: "og:description", content: "ERP para restaurantes, tudo o que você precisa" }
            ]
        },
        children: [
            { path: '', component: homeComponent },
            { path: 'admin', component: adminComponent, meta: { modulo_requerido: 'admin' } },
            { path: 'products', component: productsComponent, meta: { modulo_requerido: 'products' } },
            { path: "config", component: configComponent, meta: { modulo_requerido: 'config' } },
            { path: "stock", component: stockComponent, meta: { modulo_requerido: 'stock' } },
            { path: "orders", component: ordersComponent, meta: { modulo_requerido: 'orders' } },
            { path: "customers", component: customersComponent, meta: { modulo_requerido: 'customers' } },
            { path: "kitchen", component: kitchenComponent, meta: { modulo_requerido: 'kitchen' } },
            { path: "printout", component: printOut, meta: { modulo_requerido: 'digital_menu' } },
            { path: "digital_menu", component: digitalMenuComponent, meta: { modulo_requerido: 'digital_menu' } },
            { path: "financial", component: financialComponent, meta: { modulo_requerido: 'financial' } },
            { path: "whatsapp", component: whatsappComponent, meta: { modulo_requerido: 'whatsapp' } },
            { path: "newsletter", component: newsletterComponent, meta: { modulo_requerido: 'newsletter' } },
            { path: "shipping", component: shippingComponent, meta: { modulo_requerido: 'shipping' } },
            { path: "reports", component: reportsComponent, meta: { modulo_requerido: 'reports' } },
            { path: "reservations", component: reservationsComponent, meta: { modulo_requerido: 'reservations' } },
            { path: "profile", component: profileComponent, meta: { modulo_requerido: '' } }
        ]
    },
    {
        path: '/login',
        component: loginPage,
        meta: {
            title: "Faça login - Gourmetech",
            metaTags: [
                { name: "description", content: "Login - Gourmetech" },
                { name: "og:description", content: "ERP para restaurantes, tudo o que você precisa" }
            ]
        },
    },
    {
        path: '/register',
        component: registerPage,
        meta: {
            title: "Registre-se - Gourmetech",
            metaTags: [
                { name: "description", content: "Registro - Gourmetech" },
                { name: "og:description", content: "ERP para restaurantes, tudo o que você precisa" }
            ]
        },
    },
    {
        path: '/forbidden',
        component: forbiddenPage,
        meta: { title: "Acesso Negado - Gourmetech" }
    },
    {
        path: '',
        redirect: '/home'
    },
    {
        path: "*",
        redirect: "/login"
    }
];

const router = new VueRouter({
    routes,
    mode: 'history'
});

// Middleware para verificar permissões
router.beforeEach((to, from, next) => {
    const moduloRequerido = to.meta.modulo_requerido;

    if (moduloRequerido == undefined) next();

    let interval = setInterval(() => {
        if (router.app?.$root?.menuOptions != undefined) {
            clearInterval(interval);

            if (moduloRequerido) {
                const menuOptions = router.app?.$root?.menuOptions || [];
        
                const temPermissao = menuOptions.some(modulo => modulo.codigo === moduloRequerido);
        
                if (!temPermissao) {
                    return next('/forbidden');
                }
            }
        
            next();
        } else if (to.path != "/register" && to.path != "/login") {
            checkIfUserIsAuthenticated().then((() => {
                clearInterval(interval);
            })).catch(() => {
                return next('/login');
            })
        }
    }, 100)   
});

function checkIfUserIsAuthenticated() {
    return new Promise((resolve, reject) => {
        let jwt = "Bearer " + self.getJwtInLocalStorage();
                
        if (jwt == "Bearer null") {
            reject();
        } else {
            let data = {
                token: jwt
            }

            api.post("/users/check_jwt", data)
            .then(function () { 
                resolve();
            })
            .catch(function () { 
                reject();
            })
        }
    })
}

export default router;
