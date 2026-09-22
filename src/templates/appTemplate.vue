<template>
    <div>
        <LoadingState v-if="loading" class="loading" message="Preparando seu painel" />
        <div class="app-frame" v-else>
            <headerComponent @toggleMenu="menuOpen = $event" />
            <div class="inner-page-system" :class="{ 'menu-open': menuOpen }">
                <BreadcrumbsComponent />
                <transition name="route" mode="out-in">
                    <slot />
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import headerComponent from '../components/header.vue';
import LoadingState from '../components/LoadingState.vue';
import BreadcrumbsComponent from '../components/Breadcrumbs.vue';
import { globalMethods } from '../js/globalMethods';
import moment from "moment";

export default {
    name: "appTemplate",
    mixins: [globalMethods],
    components: {
        headerComponent,
        LoadingState,
        BreadcrumbsComponent
    },
    data() {
        return {
            loading: true,
            menuOpen: window.innerWidth > 960,
            timeInterval: null
        }
    },
    watch: {
        '$root.selectedTheme': function () {
            this.setTheme();
        }
    },
    methods: {
        updateTime: function () {
            moment.locale("pt-br");

            this.timeInterval = window.setInterval(() => {
                document.querySelectorAll('.update-time').forEach((item) => {
                        if (item.textContent !== "") {
                            let timeSource;

                            if (moment(item.textContent).isValid()) {
                                timeSource = item.textContent;
                                item.dataset.time = item.textContent;
                            } else {
                                timeSource = item.dataset.time;
                            }
                            
                            const now = moment();

                            // Calcula a diferença entre a data atual e a data de início em milissegundos
                            const diff = now.diff(timeSource);
                            // Converte a diferença em uma duração
                            const duration = moment.duration(diff);

                            const hours = Math.floor(duration.asHours()); // Horas totais
                            const minutes = Math.floor(duration.minutes()); // Minutos
                            const seconds = Math.floor(duration.seconds()); // Segundos

                            // Formata para HH:mm:ss
                            const elapsedTimeString = `${hours.toString().padStart(2, '0')}:${minutes
                                .toString()
                                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                            item.textContent = elapsedTimeString;
                            item.title = elapsedTimeString;
                        }
                });
            }, 1000)
        },
        handleResize: function () {
            this.menuOpen = window.innerWidth > 960;
        },
        initSystemRequests: function () {
            let self = this;

            self.requireUser().then(() => {
                self.returnSelectedTheme().then(() => {
                    self.setTheme();
                    self.requireCompany(self.$root.user.id_empresa).then(() => {
                        self.loading = false;
                    })
                })
            })
        },
        isColorReddish: function (hex) {
            if (!hex) return false;
            let c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(x => x + x).join('');
            const r = parseInt(c.substr(0, 2), 16);
            const g = parseInt(c.substr(2, 2), 16);
            const b = parseInt(c.substr(4, 2), 16);
            return r > 130 && (r - g > 30) && (r - b > 30);
        },
        setTheme: function () {
            const theme = this.$root.selectedTheme;
            if (!theme) return;
            document.documentElement.style.setProperty('--background-color', theme.cor_background);
            document.documentElement.style.setProperty('--label-color', theme.cor_label);
            document.documentElement.style.setProperty('--label-hover-color', theme.cor_label_hover);
            document.documentElement.style.setProperty('--cor-destaque', theme.cor_destaque);

            // No tema vermelho (ex: id 6 ou tons de vermelho/terracota):
            // O botão principal assume a cor do tema (--cor-destaque), logo o de exclusão
            // NÃO pode ser vermelho também. Usamos um tom grafite escuro com alto contraste.
            const isRedTheme = theme.id === 6 || this.isColorReddish(theme.cor_destaque) || this.isColorReddish(theme.cor_background);
            if (isRedTheme) {
                document.documentElement.style.setProperty('--btn-danger-bg', '#292524');
                document.documentElement.style.setProperty('--btn-danger-hover', '#1C1917');
                document.documentElement.style.setProperty('--btn-danger-color', '#FFFFFF');
            } else {
                document.documentElement.style.setProperty('--btn-danger-bg', '#DC2626');
                document.documentElement.style.setProperty('--btn-danger-hover', '#B91C1C');
                document.documentElement.style.setProperty('--btn-danger-color', '#FFFFFF');
            }
        }
    },
    mounted: function () {
        let self = this;

        self.updateTime();

        self.handleResize();

        window.addEventListener('resize', self.handleResize);

        this.checkIfUserIsAuthenticated().then(() => {
            let interval = setInterval(() => {
                if (self.$root.jwtLoaded) {
                    clearInterval(interval);

                    self.initSystemRequests();
                }
            }, 100)
        })
    },
    beforeDestroy() {
        window.clearInterval(this.timeInterval);
        window.removeEventListener('resize', this.handleResize);
    }
}
</script>
<style scoped>
.inner-page-system {
    width: 100vw;
    position: absolute;
    left: 0;
    top: 80px;
    height: calc(100vh - 80px);
    overflow-y: auto;
    padding: var(--space-6);
    background: var(--paper);
    transition: left .18s ease, width .18s ease;
}

.inner-page-system.menu-open { left: 260px; width: calc(100vw - 260px); }

.loading {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 960px) {
    .inner-page-system, .inner-page-system.menu-open {
        width: 100vw;
        left: 0;
    }
}

.route-enter-active, .route-leave-active { transition: opacity .16s ease, transform .16s ease; }.route-enter, .route-leave-to { opacity: 0; transform: translateY(6px); }
</style>
