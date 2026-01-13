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
                    <span class="notifications-number" v-on:click="handleToggleNotifications()"
                        v-show="notificationsCount > 0">{{ notificationsCount }}</span>
                    <div class="notifications" v-if="toggleNotifications">
                        <lottie-player id="notifications-loading" background="transparent" speed="1" loop autoplay
                            v-if="loadingNotifications"></lottie-player>
                        <div class="notification-types">
                            <div class="type" v-on:click="onlyUnseen = false" :class="{ 'selected-type': !onlyUnseen }">
                                <!-- v-on:click="notificationTypeFilter = type.tipo" :class="{'selected-type': notificationTypeFilter == type.tipo}" -->
                                <span>Todas</span>
                            </div>
                            <div class="type" v-on:click="onlyUnseen = true" :class="{ 'selected-type': onlyUnseen }">
                                <span>Não lidas</span>
                            </div>
                            <span class="material-icons type-filter-button"
                                v-on:click="showNotificationTypes = !showNotificationTypes">more_vert</span>
                            <div class="type-filter" v-if="showNotificationTypes">
                                <ul>
                                    <li v-for="(item, index) in notificationTypes"
                                        :class="{ 'selected-type': notificationTypeFilter == item.tipo }" :key="index"
                                        v-on:click="handleClickNotificationType(item.tipo)">
                                        {{ item.tipo_nome }} {{ item.qtd > 0 ? `(${item.qtd})` : "" }}
                                    </li>
                                </ul>
                            </div>
                            <div class="type-filter-wrapper" v-if="showNotificationTypes"
                                v-on:click="showNotificationTypes = !showNotificationTypes"></div>
                        </div>
                        <div class="notifications-inner" @scroll="checkScroll" ref="notificationsContainer">
                            <ul v-if="!loadingNotifications && !first && filteredNotifications.length > 0">
                                <li v-for="notification in filteredNotifications"
                                    :class="notification.lido_em ? 'lida' : ''" :key="notification.id">
                                    <p>{{ notification.titulo }}</p>
                                    <div class="notification-informations">
                                        <span :title="notification.descricao">{{ notification.descricao }}</span>
                                        <span>{{ formatDateFromNow(notification.criado_em) }}</span>
                                    </div>
                                </li>
                            </ul>
                            <span v-else class="empty-notifications">Nenhuma notificação encontrada</span>
                        </div>
                    </div>
                </div>
                <span class="material-icons" v-if="false">help</span>
            </div>
            <div class="notifications-wrapper" v-if="toggleNotifications" v-on:click="handleToggleNotifications()">
            </div>
        </header>
        <div class="lateral-menu">
            <ul>
                <li v-for="(item, index) in $root.menuOptions" :key="index" class="menu-item"
                    v-on:click="selectThisItem(item.link)" :id="'menu' + item.link.replace(/\//g, '-')"
                    :class="checkCurrentPathname(item.link) ? 'li-active' : ''">
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
            first: true,
            notificationTypes: [],
            notificationTypeFilter: "",
            onlyUnseen: false,
            showNotificationTypes: false,
            limit: 15,
            offset: 0,
            hasMoreNotifications: true,
            isFetching: false
        }
    },
    computed: {
        filteredNotifications: function () {

            let filtered = JSON.parse(JSON.stringify(this.notifications)).filter((notification) => {
                return notification.tipo.indexOf(this.notificationTypeFilter) != -1 &&
                    ((this.onlyUnseen && notification.lido_em == null) ||
                        (!this.onlyUnseen && (notification.lido_em != null || notification.lido_em == null)))
            });

            return filtered;
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
        checkScroll() {
            const container = this.$refs.notificationsContainer;
            if (container.scrollHeight - container.scrollTop <= container.clientHeight + 100) {
                this.returnNotifications(true);
            }
        },
        handleClickNotificationType: function (type) {
            if (this.notificationTypeFilter == type) {
                this.notificationTypeFilter = "";
                return;
            }

            this.notificationTypeFilter = type;
            this.showNotificationTypes = !this.showNotificationTypes;
        },
        resetNotifications: function () {
            this.notifications.forEach((item) => {
                item.lido_em = moment().format("YYYY-MM-DD HH:mm:ss");
            })

            this.notificationsCount = 0;
        },
        returnNotifications: function (loadMore = false) {
            if (this.isFetching || (!this.hasMoreNotifications && loadMore)) {
                return;
            }

            let self = this;
            let currentOffset = loadMore ? this.offset : 0;

            this.isFetching = true;

            this.loadingNotifications = true;
            this.first = false;
            this.lastNotificationsCount = this.$root.user.status.notifications;
            this.notificationsCount = this.$root.user.status.notifications;

            api.post("/users/get_notifications", {
                offset: currentOffset
            }).then((response) => {
                const newNotifications = response.data.returnObj;

                if (loadMore) {
                    self.notifications = [...self.notifications, ...newNotifications];
                } else {
                    self.notifications = newNotifications;
                }

                self.offset = self.notifications.length;
                self.hasMoreNotifications = newNotifications.length === self.limit;

                const uniqueTypesMap = self.notifications.reduce((map, notification) => {
                    if (!map[notification.tipo]) {
                        map[notification.tipo] = {
                            tipo_nome: notification.tipo_nome,
                            tipo: notification.tipo,
                            qtd: 0
                        };
                    }

                    if (!notification.lido_em) {
                        map[notification.tipo].qtd++;
                    }

                    return map;
                }, {});

                let notificationTypesArray = Object.values(uniqueTypesMap);

                const orderMap = {
                    venda: 0,
                    cliente: 1,
                    produto: 2,
                    entrega: 3,
                    reserva: 4,
                    estoque_inserir: 5,
                    estoque_remover: 6
                };

                notificationTypesArray.sort((a, b) => {
                    const aIndex = orderMap[a.tipo] ?? Infinity;
                    const bIndex = orderMap[b.tipo] ?? Infinity;
                    return aIndex - bIndex;
                });

                self.notificationTypes = notificationTypesArray;
                self.loadingNotifications = false;
                self.isFetching = false;
            })
        },
        handleToggleNotifications: function () {
            this.toggleNotifications = !this.toggleNotifications;

            if (this.toggleNotifications) {
                this.resetNotifications();
            }
        },
        goToProfile: function () {
            this.toggleProfileMenu();
            this.closeLateralMenuIfIsResponsive();

            this.$router.push("/home/profile");
        },
        closeLateralMenuIfIsResponsive() {
            if (window.innerWidth <= 960) {
                if (this.menuMovement) return;

                this.$emit("toggleMenu", false);
                this.hideLateralMenu();
            }
        },
        checkCurrentPathname: function (linkToCheck) {
            let pathname = window.location.pathname;
            if (pathname == linkToCheck) {
                return true;
            }
            return false;
        },
        selectThisItem: function (elementId, close = false) {
            $(".menu-item").removeClass("li-active");

            let targetElement = $("#menu" + elementId.replace(/\//g, '-'));
            targetElement.addClass("li-active");
            if (window.innerWidth <= 960) {
                if (this.menuMovement || close) return;

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

        this.selectThisItem(window.location.pathname, true);

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
header,
.lateral-menu {
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
    z-index: 4;
}

.left-content,
.right-content {
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
    z-index: 3;
}

.notifications-container span:first-child,
.right-content>span,
.responsive-lateral-menu-toggle {
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
    width: 350px;
    max-height: 90dvh;
    display: flex;
    flex-direction: column;

    scrollbar-width: thin;
    scrollbar-color: var(--cor-destaque) transparent;

    &::-webkit-scrollbar {
        width: 6px; 
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--cor-destaque); 
        border-radius: 20px;
    }

    & ul {
        width: 100%;
        list-style: none;

        & li {
            padding: var(--space-4);
            background: rgba(0, 0, 0, 0.3);

            &.lida {
                opacity: 0.7;
            }

            &:hover {
                background: var(--cor-destaque);
            }
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
        width: 100%;
        white-space: nowrap;

        & span {
            font-size: var(--fontsize-xs);
            color: var(--label-color);
            white-space: nowrap;
            flex-grow: 1;
            min-width: 0;
            text-overflow: ellipsis;
            overflow: hidden;

            &:last-child {
                font-weight: 600;
                flex-grow: 0;
                flex-shrink: 0;
            }
        }
    }
}

.notifications-inner {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.lateral-menu {
    position: absolute;
    top: 80px;
    left: 0;
    width: 260px;
    height: calc(100vh - 80px);
    transition: transform 0.4s;
    overflow: hidden;
    z-index: 3;
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

.lateral-menu ul li,
.lateral-menu ul li a {
    display: flex;
    cursor: pointer;
    color: var(--label-color);
    border-radius: var(--radius-md);
}

.lateral-menu ul li:hover,
.li-active {
    color: var(--label-hover-color);
    background: var(--cor-destaque);
}

.lateral-menu-wrapper,
.notifications-wrapper {
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

.notification-types {
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: var(--space-3);
    gap: var(--space-3);
    position: sticky;
    top: 0;
    left: 0;
    background: var(--background-color);
    position: relative;
}

.type-filter-button {
    position: absolute;
    right: var(--space-3);
    top: 16px;
}

.type-filter {
    position: absolute;
    right: var(--space-3);
    top: 46px;
    z-index: 3;
    max-height: 80dvh;
    border-radius: var(--radius-md);
    overflow-y: auto;

    & li {
        background: white !important;
        color: var(--black) !important;

        &:hover,
        &.selected-type {
            background: rgb(204, 204, 204) !important;
        }
    }
}

.type-filter-wrapper {
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
}

.type {
    padding: var(--space-3);
    border-radius: var(--radius-md);
}

.type.selected-type {
    background: var(--cor-destaque);
}

.type span {
    font-size: var(--fontsize-sm) !important;
}

.type.selected-type span {
    font-weight: bold;
}

.empty-notifications {
    text-align: center;
    font-size: var(--fontsize-sm) !important;
    margin: var(--space-6) 0;
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