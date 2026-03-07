<template>
    <div class="map">
      <GmapMap
        :center="centerComponent"
        :zoom="13"
        style="width: 100%; height: 400px"
      >
        <GmapMarker
          :position="centerComponent"
          :draggable="blockmovement ? false : true"
          @dragend="updateCenter"
        />
        <GmapCircle
          :center="centerComponent"
          :radius="radiusMeters"
          :options="circleOptions"
        />
      </GmapMap>
      <div style="margin-top: 20px;">
        <label for="radius">Raio de atuação (quilômetros): </label>
        <input
          id="radius"
          type="range"
          min="1"
          max="100"
          step="1"
          v-model="radiusKmComponent"
        />
        <span class="range-label">{{ radiusKmComponent }} quilômetros</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ["radiuskm", "center", "blockmovement"],
    data() {
      return {
        centerComponent: { lat: -25.427, lng: -49.273 },
        radiusKmComponent: 5, // 5 km
        circleOptions: {
          fillColor: '#3E6990',
          fillOpacity: 0.2,
          strokeColor: '#3E6990',
          strokeOpacity: 0.6,
          strokeWeight: 2,
        },
      };
    },
    watch: {
      radiusKmComponent: function () {
        this.$emit("changerangevalue", this.radiusKmComponent);
      }
    },
    computed: {
      radiusMeters() {
        return this.radiusKmComponent * 1000;
      },
    },
    methods: {
      updateCenter(event) {
        this.centerComponent = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
      },
    },
    mounted: function () {
        this.centerComponent = this.center;
        this.radiusKmComponent = this.radiuskm;
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

    .vue-map-container {
        border-radius: var(--radius-md);
        overflow: hidden;
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
  