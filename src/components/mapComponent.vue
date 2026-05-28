<template>
    <div class="map">
        <div ref="map" class="leaflet-map"></div>
        <div class="radius-control">
            <label for="radius">Raio de atuacao (quilometros): </label>
            <input
                id="radius"
                type="range"
                min="1"
                max="100"
                step="1"
                v-model="radiusKmComponent"
            />
            <span class="range-label">{{ radiusKmComponent }} quilometros</span>
        </div>
    </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default {
    props: ["radiuskm", "center", "blockmovement"],
    data() {
        return {
            map: null,
            marker: null,
            circle: null,
            centerComponent: { lat: -25.427, lng: -49.273 },
            radiusKmComponent: 5,
        };
    },
    watch: {
        radiusKmComponent: function () {
            this.updateCircle();
            this.$emit("changerangevalue", Number(this.radiusKmComponent));
        },
        center: {
            deep: true,
            handler: function () {
                this.setCenter(this.center);
            }
        }
    },
    methods: {
        normalizeCenter(center) {
            const lat = Number(center?.lat);
            const lng = Number(center?.lng);

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return { lat: -25.427, lng: -49.273 };
            }

            return { lat, lng };
        },
        initMap() {
            this.centerComponent = this.normalizeCenter(this.center);
            this.radiusKmComponent = Number(this.radiuskm) || 5;

            this.map = L.map(this.$refs.map).setView(
                [this.centerComponent.lat, this.centerComponent.lng],
                13
            );

            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            this.marker = L.marker([this.centerComponent.lat, this.centerComponent.lng], {
                draggable: !this.blockmovement
            }).addTo(this.map);

            this.marker.on("dragend", () => {
                const latLng = this.marker.getLatLng();
                this.setCenter({ lat: latLng.lat, lng: latLng.lng }, false);
                this.$emit("changecenter", this.centerComponent);
            });

            this.circle = L.circle([this.centerComponent.lat, this.centerComponent.lng], {
                radius: this.radiusMeters,
                color: "#3E6990",
                fillColor: "#3E6990",
                fillOpacity: 0.2,
                opacity: 0.6,
                weight: 2
            }).addTo(this.map);
        },
        setCenter(center, moveMarker = true) {
            this.centerComponent = this.normalizeCenter(center);

            if (this.marker && moveMarker) {
                this.marker.setLatLng([this.centerComponent.lat, this.centerComponent.lng]);
            }

            if (this.circle) {
                this.circle.setLatLng([this.centerComponent.lat, this.centerComponent.lng]);
            }

            if (this.map) {
                this.map.setView([this.centerComponent.lat, this.centerComponent.lng]);
            }
        },
        updateCircle() {
            if (this.circle) {
                this.circle.setRadius(this.radiusMeters);
            }
        }
    },
    computed: {
        radiusMeters() {
            return Number(this.radiusKmComponent || 0) * 1000;
        },
    },
    mounted: function () {
        this.initMap();
    },
    beforeDestroy: function () {
        if (this.map) {
            this.map.remove();
        }
    }
};
</script>

<style scoped>
.map {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.leaflet-map {
    width: 100%;
    height: 400px;
    border-radius: var(--radius-md);
    overflow: hidden;
}

.radius-control {
    width: 100%;
    margin-top: 20px;
}

input[type="range"] {
    width: 100%;
}

.range-label {
    white-space: nowrap;
    display: inline-block;
    width: 100%;
    text-align: center;
}
</style>
