<template id="">
  <div class="cover" id="map">
    <div v-if="this.map !== null">
      <MapMarker 
        v-for="location in activeLocations" 
        :key="location.place.id" 
        :location="location"
        :map="map" 
      />
    </div>
  </div>
  
</template>

<script type="text/javascript">
  // eslint-disable-next-line
  import leaflet from 'leaflet'
  import MapMarker from '@/components/Marker.vue'
  import locations from '@/mixins/locations.js'
  import NProgress from 'nprogress'
  import { Bus } from '@/mixins/bus.js'
  import { mapGetters} from 'vuex'

  export default {
    name: 'Map',
    data() {
      return {
        map: null,
        bbox: null,
        searchURL: null,
        dragging: false,
        infoWindows: {},
        locations: {}
      }
    },
    components: {MapMarker},
    computed: {
      ...mapGetters(['map/currentSearch', 'photosReady']),
      activeLocations: function() {
        return this.$store.getters['map/activeLocations']
      },
      api() {
        return `${this.$root.api}/map?bbox=${this.bbox}`
      }  
    },
    mixins: [locations],
    methods: {
      closeInfoWindow(placeId) {
        this.infoWindows[placeId].close()
      },
      openInfoWindow(placeId) {
        let marker = this.markers[placeId];
        this.infoWindows[placeId].open(this.map, marker)
      },
      updateView(searchResults) {
        let locations = this.getLocations(searchResults)
        this.$store.dispatch('map/updateLocations', locations)
        NProgress.done()
        // Used by markers to self-remove
        Bus.$emit('searchDone')
      },
      getLocations(results) {
        let locations = {}
        for (let result of results) {
          let location = this.getOrCreateLocation(result)
          locations[location.place.id] = location
        }
        return locations
      },
      initSearch() {
        Bus.$emit('searchStart')
        NProgress.start()
        let bounds = this.map.getBounds()
        // fun fact. Leaflet coordinate point order is Lat, Lng. and mapquest uses Lng, Lat.
        this.bbox = [
          bounds.getSouthWest().lng,
          bounds.getSouthWest().lat,
          bounds.getNorthEast().lng,
          bounds.getNorthEast().lat
        ].join(',')
        
        const id = Date.now()
        console.log('new id is ' + id)
        this.searchID = id
        this.search(id)
      },
      search(searchID) {
        if (searchID !== this.searchID) return false;

        if (this.searchURL === null) this.searchURL = this.api
        fetch(this.searchURL).then( async (resp) => {
          if (searchID !== this.searchID) return false;

          if (resp.ok) {
            let pending = resp.json() 
            let data = await pending 
            this.updateView(data.results);
            if (searchID === this.searchID && data.pagination.nextUrl && data.pagination.currentPage < 4) { 
              this.searchURL = data.pagination.nextUrl
              this.search(searchID)
            } else {
              this.searchURL = null
            }
          } else {
            console.log(resp)
          }
        }).catch((err) => {
          console.log(err)
        })
      },
      saveMap() {
        if (this.$route.name === 'detail') return false
        let _map = require('lodash/map');
        let coords = _map( this.map.getCenter(), (coord) => { return Math.round( coord * 100) / 100 } )
        window.location.hash = '#' + [this.map.getZoom()].concat(coords).join('/')
      },
      setMap() {
        let hash = window.location.hash
        let view; 
        if (hash === '') {
          view = [37.69097298486733, -122.43164062500001] // sfo
        } else {
          hash = hash.substr(1).split('/')
          view = [hash[1], hash[2]]
        }
        this.map.setView(view)
      },
      listeners() {
        this.map.on('click', (e) => {
          console.log(e)
        })
        this.map.on('dragend', () => {
          this.debounceSearchMap()
          this.saveMap()
        }),
        this.map.on('zoomend', () => {
          this.debounceSearchMap()
          this.saveMap()
        })
      },
      subscribe() {
        // Can't get watch to work so subscribing instead
        this.$store.subscribe((mutation) => {
          if (mutation.type === 'map/UPDATE_SEARCH') {
            const center = mutation.payload.place.geometry.coordinates
            this.map.panTo([center[1], center[0]])
            this.debounceSearchMap()
          }
        })
      },
      init: async function() {
        let map = L.map('map', {
          zoomControl: false,
          zoom: 14
        })
        // eslint-disable-next-line
        const zoom = L.control.zoom({position: 'bottomright'}).addTo(map)

        const url = await fetch(this.$root.api + '/tiles')
        const pending = url.text()
        const tiles = await pending 
        L.tileLayer(tiles, {
          maxZoom: 18,
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          detectRetina: false
        }).addTo(map);

        this.map = map;

        const currentSearch = this['map/currentSearch']
        if (window.location.hash !== '' || currentSearch === null) {
          this.setMap()
        } else {
          const center = currentSearch.place.geometry.coordinates
          map.setView([center[1], center[0]])
          this.saveMap()
        }
        
        this.subscribe();
        this.listeners();
        var debounce = require('lodash/debounce');
        this.debounceSearchMap = debounce(this.initSearch, 500)
        
        if (this.photosReady) {
          this.initSearch()
        } else {
          var interval = setInterval(() => {
            if (this.photosReady) {
              clearInterval(interval)
              this.initSearch()
            }
          }, 10);        
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        NProgress.configure({ minimum: 0.1 });
        NProgress.start()
        this.init()
      })
    },
  }
</script>

<style lang="scss">
  @import '../../node_modules/leaflet/dist/leaflet.css';
  @import '../../node_modules/nprogress/nprogress.css';

  // Popup styles have to go here, after leaflet.css
  // because popup.vue css is rendered above this component
  .leaflet-popup-content {
    display: flex;
    img {
      height: 40px;
      width: auto;
    }
    img + div {
      padding-left: .5rem
    }
    p {
      margin: 0;
      white-space: nowrap;
    }
  }
  
  #nprogress {
    .bar {
      background: $primary-color;
      .peg {
        box-shadow: 0 0 10px $primary-color, 0 0 5px $primary-color;
      }
    }
    .bar, .spinner {
      z-index: 3000;
    }
    .spinner-icon {
      border-top-color: $primary-color;
      border-left-color: $primary-color;
    }
  }
</style>