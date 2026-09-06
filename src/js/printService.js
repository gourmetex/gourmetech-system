import Vue from "vue";

// D.4/D15: printOut.vue passa a saber so "como imprimir" - cada tela monta "o que" imprimir
// e chama print(). Singleton reativo escolhido no plano (ver plan.md) porque a navegacao pro
// wizard usa $router.push, mesma instancia do SPA - sobrevive a troca de rota, so nao a um F5
// (mitigado com o estado vazio do proprio printOut.vue).
//
// Projeto usa Vue 2 (nao Vue 3) - Vue.observable() e o equivalente de reactive() aqui.
const state = Vue.observable({ doc: null });

export const printService = {
    print(router, doc) {
        state.doc = doc;
        router.push("/home/printout");
    },
    get doc() {
        return state.doc;
    },
    clear() {
        state.doc = null;
    }
};
