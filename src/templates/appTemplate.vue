<template>
    <div>
        <div class="loading" v-if="loading">
            <lottie-player id="loading-system"  background="transparent" speed="1" loop autoplay></lottie-player>
        </div>
        <div class="app-frame" v-else>
            <headerComponent @toggleMenu="toggleContent($event)" />
            <div class="inner-page-system">
                <slot  />
            </div>
        </div>
    </div>
</template>

<script>
import headerComponent from '../components/header.vue';
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';
import loadingJson from "../assets/animations/loading.json";
import moment from "moment";

export default {
    name: "appTemplate",
    mixins: [globalMethods],
    components: {
        headerComponent
    },
    data() {
        return {
            loading: true
        }
    },
    methods: {
        updateTime: function () {
            moment.locale("pt-br");

            setInterval(() => {
                if ($(".update-time").length) {
                    let elements = $(".update-time");
                    
                    elements.each((index, item) => {
                        let currentItem = $(item);

                        if (currentItem.html() != "") {
                            let timeSource;

                            if (moment(currentItem.html()).isValid()) {
                                timeSource = currentItem.html();
                                currentItem.attr("dataTime", currentItem.html());
                            } else {
                                timeSource = currentItem.attr("dataTime");
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

                            currentItem.html(elapsedTimeString).attr("title", elapsedTimeString);
                        }
                    })
                }
            }, 1000)
        },
        toggleContent: function (event) {
            if (event) {
                this.contractContent();
            } else {
                this.expandContent();
            }
        },
        expandContent: function () {
            let pageContent = $(".inner-page-system");
            pageContent.css("left", "0").css("width", "100vw");
        },
        contractContent: function () {
            //let pageContent = $(".inner-page-system");
            //pageContent.css("left", "260px").css("width", "calc(100vw - 260px)");
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
        setTheme: function () {
            document.documentElement.style.setProperty('--background-color', this.$root.selectedTheme.cor_background);
            document.documentElement.style.setProperty('--label-color', this.$root.selectedTheme.cor_label);
            document.documentElement.style.setProperty('--label-hover-color', this.$root.selectedTheme.cor_label_hover);
            document.documentElement.style.setProperty('--cor-destaque', this.$root.selectedTheme.cor_destaque);
        }
    },
    mounted: function () {
        let self = this;

        self.updateTime();

        $(window).on("resize", () => {
            let windowWidth = $(window).width();

            if (windowWidth <= 960) {
                self.expandContent();
            } else {
                self.contractContent();
            }
        })

        const player = document.querySelector("lottie-player");
        player.addEventListener("rendered", () => {
            player.load(
                loadingJson
            );
        });

        this.checkIfUserIsAuthenticated().then(() => {
            let interval = setInterval(() => {
                if (self.$root.jwtLoaded) {
                    clearInterval(interval);

                    self.initSystemRequests();
                }
            }, 100)
        })
    }
}
</script>
<style scoped>
.inner-page-system {
    width: calc(100vw - 260px);
    position: absolute;
    left: 260px;
    top: 80px;
    height: calc(100vh - 80px);
    overflow-y: auto;
    padding: var(--space-6);
    transition: all 0.4s;
}

.loading {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

    .loading lottie-player {
        width: 90vw;
        max-width: 420px;
        margin-top: -50vh;
    }

@media (max-width: 768px) {
    .inner-page-system {
        width: 100vw;
        left: 0;
    }
}
</style>