<template>
    <div>
        <div class="loading" v-if="loading">
            <lottie-player id="loading-system"  background="transparent" speed="1" loop autoplay></lottie-player>
        </div>
        <div class="app-frame" v-else>
            <headerComponent @toggleMenu="toggleContent($event)" />
            <div class="inner-page-system">
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
import headerComponent from '../components/header.vue';
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';
import loadingJson from "../assets/animations/loading.json";

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
            let pageContent = $(".inner-page-system");
            pageContent.css("left", "260px").css("width", "calc(100vw - 260px)");
        },
        initSystemRequests: function () {
            let self = this;

            self.requireUser().then(() => {
                self.requireCompany(self.$root.user.id_empresa).then(() => {
                    self.loading = false;
                })
            })
        }
    },
    mounted: function () {
        let self = this;

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
            })
        }).catch(() => {})
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