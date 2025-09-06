<template>
    <div class="system-frame">
        <header>
            <div class="left-content">
                <span class="material-icons responsive-lateral-menu-toggle" v-on:click="toggleLateralMenu()">menu</span>
                <div class="profile">
                    <img :src="$root.user.url_foto_perfil" class="avatar-p" v-on:click="toggleProfileMenu()">
                    <div class="profile-menu-wrapper" v-on:click="toggleProfileMenu()"></div>
                    <div class="profile-menu-container">
                        <ul>
                            <li v-on:click="goToProfile()">Perfil</li>
                            <li v-on:click="logoutUser()">Sair</li>
                        </ul>
                    </div>
                </div>
                <img :src="$root.company.logo_url" class="company-logo-p">
            </div>
            <div class="right-content">
                <div class="notifications-container">
                    <span class="material-icons" v-on:click="handleToggleNotifications()">notifications</span>
                    <span class="notifications-number" v-on:click="handleToggleNotifications()" v-show="notificationsCount > 0">{{ notificationsCount }}</span>
                    <div class="notifications" v-if="toggleNotifications">
                        <lottie-player id="notifications-loading" background="transparent" speed="1" loop autoplay v-if="loadingNotifications"></lottie-player>
                        <p class="notifications-empty" v-if="!loadingNotifications && !first && notifications.length == 0">Está vazio</p>
                        <ul v-if="!loadingNotifications && !first && notifications.length > 0">
                            <li v-for="notification in notifications" :class="notification.lido_em ? 'lida' : ''" :key="notification.id">
                                <p>{{ notification.titulo }}</p>
                                <div class="notification-informations">
                                    <span>{{ notification.descricao }}</span>
                                    <span>{{ formatDateFromNow(notification.criado_em) }}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <span class="material-icons">help</span>
            </div>
            <div class="notifications-wrapper" v-if="toggleNotifications" v-on:click="handleToggleNotifications()"></div>
        </header>
        <div class="lateral-menu">
            <ul>
                <li v-for="(item, index) in $root.menuOptions" :key="index" class="menu-item" v-on:click="selectThisItem(item.link)" :id="'menu' + item.link.replace(/\//g, '-')" :class="checkCurrentPathname(item.link) ? 'li-active' : ''">
                    <router-link :to="item.link">
                        <span class="material-icons">{{ item.icone }}</span>
                        <h3>{{ item.nome }}</h3>
                    </router-link>
                </li> 
            </ul>
        </div>
        <div class="lateral-menu-wrapper" v-on:click="toggleLateralMenu()"></div>
    </div>
</template>
<script>
import $ from 'jquery';
import { globalMethods } from '@/js/globalMethods';
import api from "../configs/api";
import loadingJson from "../assets/animations/loading-component.json";
import moment from 'moment';

export default {
    name: "headerComponent",
    mixins: [globalMethods],
    data() {
        return {
            menuMovement: false,
            toggleNotifications: false,
            notifications: [],
            loadingNotifications: false,
            lastNotificationsCount: 0,
            notificationsCount: 0,
            first: true
        }
    },
    watch: {
        $route() {
            this.selectThisItem(window.location.pathname);
        },
        toggleNotifications: function () {
            if (this.toggleNotifications) {
                this.returnNotifications();
            } else {
                this.resetNotifications();
            }
        },
        '$root.user': {
            handler() {
                this.lastNotificationsCount = this.$root.user.status.notifications;
                this.notificationsCount = this.$root.user.status.notifications;
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        resetNotifications: function () {
            this.notifications.forEach((item) => {
                item.lido_em = moment().format("YYYY-MM-DD HH:mm:ss");
            })

            this.notificationsCount = 0;
        },
        returnNotifications: function () {
            if ((this.lastNotificationsCount != this.$root.user.status.notifications) || this.first) {
                this.loadingNotifications = true;
                this.first = false;
                this.lastNotificationsCount = this.$root.user.status.notifications;
                this.notificationsCount = this.$root.user.status.notifications;

                let self = this;

                api.get("/users/notifications").then((response) => {
                    self.notifications = response.data.returnObj;
                    self.loadingNotifications = false;
                })
            } else {
                this.resetNotifications();
            }
        },
        handleToggleNotifications: function () {
            this.toggleNotifications = !this.toggleNotifications;
        },
        goToProfile: function () {
            this.toggleProfileMenu();
            this.$router.push("/home/profile");
        },
        checkCurrentPathname: function (linkToCheck) {
            let pathname = window.location.pathname;
            if (pathname == linkToCheck) {
                return true;
            }
            return false;
        },
        selectThisItem: function (elementId) {
            $(".menu-item").removeClass("li-active");

            let targetElement = $("#menu" + elementId.replace(/\//g, '-'));
            targetElement.addClass("li-active");
            if (window.innerWidth <= 960) {
                if (this.menuMovement) return;

                this.toggleLateralMenu();
            }
        },
        toggleProfileMenu: function () {
            let profileMenu = $(".profile-menu-container");
            let profileMenuWrapper = $(".profile-menu-wrapper");

            if (profileMenu.is(":visible")) {
                profileMenuWrapper.hide();
                profileMenu.hide();
            } else {
                profileMenu.show();
                profileMenuWrapper.show();
            }
        },
        toggleLateralMenu: function () {
            let lateralMenu = $(".lateral-menu");
            if (lateralMenu.is(":visible")) {
                this.$emit("toggleMenu", false);
                this.hideLateralMenu();
            } else {
                this.$emit("toggleMenu", true);
                this.showLateralMenu();
            }
        },
        hideLateralMenu: function () {
            this.menuMovement = true;

            let lateralMenu = $(".lateral-menu");
            let lateralMenuWrapper = $(".lateral-menu-wrapper");

            lateralMenu.css("transform", "translateX(-260px)");
            lateralMenuWrapper.hide();
            setTimeout(() => {
                lateralMenu.hide();
                this.menuMovement = false;
            }, 400)
        },
        showLateralMenu: function () {
            this.menuMovement = true;

            let lateralMenu = $(".lateral-menu");
            let lateralMenuWrapper = $(".lateral-menu-wrapper");

            lateralMenuWrapper.show();
            lateralMenu.show();
            setTimeout(() => {
                lateralMenu.css("transform", "translateX(0)");
                setTimeout(() => {
                    this.menuMovement = false;
                }, 400)
            }, 1)
        },
        hideResponsiveButton: function () {
            let responsiveButton = $(".responsive-lateral-menu-toggle");

            responsiveButton.css("opacity", 0);

            setTimeout(() => {
                responsiveButton.hide();
            }, 400)
        },
        showResponsiveButton: function () {
            let responsiveButton = $(".responsive-lateral-menu-toggle");

            responsiveButton.show();

            setTimeout(() => {
                responsiveButton.css("opacity", 1);
            }, 1)
        }
    },
    mounted: function () {
        const player = document.getElementById("notifications-loading");

        if (player) {
            player.addEventListener("rendered", () => {
                player.load(
                    loadingJson
                );
            });
        }

        let self = this;

        this.selectThisItem(window.location.pathname);

        $(window).on("resize", () => {
            let windowWidth = $(window).width();
            
            if (windowWidth <= 960) {
                if (this.menuMovement) return;

                self.hideLateralMenu();
                self.showResponsiveButton();
            } else {
                self.showLateralMenu();
                self.hideResponsiveButton();

                let lateralMenuWrapper = $(".lateral-menu-wrapper");

                lateralMenuWrapper.hide();
            }
        })
    }
}
</script>
<style scoped>

header, .lateral-menu {
    background: var(--background-color);
}

header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 80px;
    display: flex;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--cor-destaque);
    z-index: 2;
}

.left-content, .right-content {
    display: flex;
    align-items: center;
    color: var(--white);
}

    .left-content img {
        margin: var(--space-3);
    }

.responsive-lateral-menu-toggle {
    margin: 0 var(--space-4) 0 var(--space-3);
    transition: opacity 0.4s;
    display: none;
    opacity: 0;
}

.notifications-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    margin-right: var(--space-4);
    z-index: 3;
}

    .notifications-container span:first-child, .right-content > span, .responsive-lateral-menu-toggle {
        font-size: var(--fontsize-lg);
        cursor: pointer;
    }

    .notifications-container .notifications-number {
        position: absolute;
        left: -3px;
        bottom: -3px;
        background: var(--orange);
        border-radius: var(--radius-full);
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

.notifications {
    position: absolute;
    top: 150%;
    right: 0;
    box-shadow: var(--boxshadow-default);
    background: var(--background-color);
    color: var(--label-color);
    border-radius: var(--radius-md);
    border: 1px solid var(--cor-destaque);
    z-index: 3;
    overflow-y: auto;
    max-height: 400px;

    & ul li {
        padding: var(--space-4);
        background: rgba(0, 0, 0, 0.3);

        &.lida {
            opacity: 0.7;
        }

        &:hover {
            background: var(--cor-destaque);
        }
    }

    & p {
        font-size: var(--fontsize-sm);
        color: var(--label-color);
        font-weight: 600;
        white-space: nowrap;
    }

    & .notification-informations {
        display: flex;
        align-items: center;
        gap: var(--space-3);

        & span {
            font-size: var(--fontsize-xs);
            color: var(--label-color);
            white-space: nowrap;

            &:last-child {
                font-weight: 600;
            }
        }
    }
}

.lateral-menu {
    position: absolute;
    top: 80px;
    left: 0;
    width: 260px;
    height: calc(100vh - 80px);
    transition: transform 0.4s;
    overflow: hidden;
    z-index: 1;
}

    .lateral-menu h3 {
        color: var(--label-color);
    }

    .lateral-menu ul {
        margin: 0;
        padding: var(--space-3) 0;
        list-style-type: none;
        height: 100%;
        overflow-y: auto;
    }

        .lateral-menu ul li {
            margin: var(--space-2) auto;
            width: 90%;
        }

        .lateral-menu ul li a {
            padding: var(--space-4);
            width: 100%;
        }

        .lateral-menu ul li, .lateral-menu ul li a {
            display: flex;
            cursor: pointer;
            color: var(--label-color);
            border-radius: var(--radius-md);
        }   

            .lateral-menu ul li:hover, .li-active {
                color: var(--label-hover-color);
                background: var(--cor-destaque);
            }

.lateral-menu-wrapper, .notifications-wrapper {
    position: fixed;
    top: 80px;
    left: 260px;
    width: calc(100vw - 260px);
    height: calc(100vh - 80px);
    background: transparent;
    display: none;
    z-index: 2;
}

.notifications-wrapper {
    display: block;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
}

.menu-item span {
    margin-right: var(--space-4);
}

.avatar-p {
    cursor: pointer;
}

.profile {
    position: relative;
}

.profile-menu-container {
    position: absolute;
    top: 105%;
    left: 0;
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--background-color);
    box-shadow: var(--boxshadow-default);
    border: 1px solid var(--cor-destaque);
    color: var(--label-color);
    display: none;
}

    .profile-menu-container ul {
        margin: 0;
        padding: 0;
        list-style-type: none;
    }

        .profile-menu-container ul li {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-2) var(--space-6);
        }

            .profile-menu-container ul li:hover {
                color: var(--label-hover-color);
                background: var(--cor-destaque);
                cursor: pointer;
            }

.profile-menu-wrapper {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    display: none;
}

@media (max-width: 768px) {
    .responsive-lateral-menu-toggle {
        display: block;
        opacity: 1;
    }

    .lateral-menu {
        display: none;
        transform: translateX(-260px);
    }
}

@media (max-width: 480px) {
    .company-logo-p {
        display: none;
    }
}

</style>