<template>
    <div class="print-out">
        <h1>Imprimir</h1>
        <div class="image-to-print">
            <img :src="imageUrl" alt="">
        </div>
    </div>
</template>
<script>
export default {
    name: "printOut",
    data() {
        return {
            imageUrl: ""
        }
    },
    watch: {
        imageUrl: function () {
            setTimeout(() => {
                window.print();
            }, 1)
        }
    },
    mounted: function () {
        let url = new URLSearchParams(window.location.search);
        let image = url.get("image");

        this.imageUrl = decodeURIComponent(image);
    }
}
</script>
<style scoped>
.image-to-print {
    margin: var(--space-7) 0;
    text-align: center;
}

@media print {
    header {
        display: none !important;
    }

    .print-out, .image-to-print, .image-to-print img {
        display: block;
    }
}
</style>