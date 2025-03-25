<template>
    <div class="home">
        <h1>{{ today }}</h1>
        <div class="parent">
            <div class="div1">
                <div class="desktop-chart">

                </div>
            </div>
            <div class="div2">
                <div class="desktop-chart">

                </div>
            </div>
            <div class="div3">
                <div class="desktop-chart">

                </div>
            </div>
        </div>
    </div>
</template>
<script>
import moment from 'moment';

export default {
    name: "homeComponent",
    data() {
        return {
            today: null
        }
    },
    methods: {
        returnToday: function () {
            let today = moment().format("dddd") + ", " +  moment().format("LL");
            return today;
        }
    },
    mounted: function () {
        moment.locale("pt-br");

        this.today = this.returnToday();
    }
}
</script>
<style scoped>
.home {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: var(--space-5);
    flex: 1;
    margin-top: var(--space-6);
}

.div1, .div2, .div3 {
    display: grid;
    place-items: center;
    border: 1px solid red;
}

.div1 { grid-area: 1 / 1 / 3 / 4; }
.div2 { grid-area: 3 / 1 / 5 / 4; }
.div3 { grid-area: 1 / 4 / 5 / 6; }

@media (max-width: 768px) {
    .parent {
        grid-template-columns: 1fr;
        grid-template-rows: unset;
    }

    .div1, .div2, .div3 {
        width: 100%;
        grid-area: unset;
    }
}
</style>