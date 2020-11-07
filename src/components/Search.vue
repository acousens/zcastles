<template id="">
  <div class="search-box" :class="searchBoxClass">
    <input id="search" type="text" ref="input"
      :class="classlist" 
      value=""
      @keydown="keydown"
      @keyup="keyup"
      @focus="inputFocused"
      placeholder="Enter a Destination"
      autocomplete="off"
    >
    <ul v-if="results.length > 0">
      <li 
        v-for="(result, index) in results" 
        :key="index" 
        :data-index="index"
        tabindex="0" 
        :class="{selected: selectedID === index}"
        @click="searchResultClicked(result)"
      >
        {{result.displayString}}
        <span> 
          {{result.place.stateCode}}, {{result.place.countryCode}}
        </span>
      </li>
    </ul>
  </div>
</template>

<script type="text/javascript">
  import { Bus } from '@/mixins/bus.js'
  import {mapGetters} from 'vuex'
  
  export default {
    name: 'Search',
    props: {
      classlist: String,
      showCurrentSearch: Boolean
    },
    data() {
      return {
        searchBoxClass: '',
        selectedID: -1,
        searchTerm: '',
        results: []
      }
    },
    computed: {
      ...mapGetters({
        searchDisplay: 'map/currentSearchDisplay'
      })
    },
    methods: {
      keyup(e) {
        if (e.which !== 40 && e.which !== 38)
          this.searchTerm = this.$refs.input.value
      },
      keydown(e) {
        if (e.which === 13) {
          if (this.results.length > 0) {
            let index = this.selectedID > 0 ? this.selectedID : 0
            this.searchResultClicked(this.results[index])
            return
          }
        }
        if (e.which === 40 || e.which === 38) {
          e.preventDefault()
        }
        if (e.which === 40 && this.selectedID !== this.results.length-1) {
          this.selectedID++
          this.$refs.input.value = this.results[this.selectedID].name
        } else if (e.which === 38 && this.selectedID !== -1) {
            this.selectedID--
            if (this.selectedID === -1) {
              this.$refs.input.value = this.searchTerm
            } else {
              this.$refs.input.value = this.results[this.selectedID].name
            }
        } else {
          if (this.$refs.input.value.length > 1) {
            this.debounceSearch()
          } else {
            this.clearResults()
          }
        }
      },
      search() {
        let input = this.$refs.input
        // let input = {value: 'santa'}
        if (input.value.length > 1) {
          this.searchBoxClass = 'loading'
          let url = this.$root.api + '/search?q=' + input.value
          fetch(url).then( async (resp) => {
            let pending = resp.json() 
            let data = await pending
            this.processResults(data)
            this.searchBoxClass = ''
          }).catch((err) => {
            console.log(err)
          })
        }
      },      
      processResults(resp) {
        this.clearResults()
        for (let i = 0; i < 5 && i < resp.data.results.length-1; i++) {
          this.results.push(resp.data.results[i])
        }
      },      
      searchResultClicked(data) {
        this.$store.dispatch('map/updateSearch', data)
        this.clearResults()
        if (this.$router.currentRoute.name !== 'castles') {
          this.$router.push('/castles')
        } else {
          Bus.$emit('placeChanged')
        }
      },        
      clearResults() {
        this.results = []
      },
      inputFocused() {
        document.addEventListener('click', this.blurListener)
      },
      blurListener(e) {
        if (e.target.closest('.search-box') === null) {
          this.searchBoxBlurred()
        }
      },
      searchBoxBlurred() {
        let input = this.$refs.input
        // Firing unexpectedly when input is undefined. can't figure out why
        if (typeof input !== 'undefined') {
          input.value = this.searchDisplay;
          this.clearResults()
        }
        if (typeof this.blurListener !== 'undefined')
          document.removeEventListener('click', this.blurListener)
      },
      init () {
        var debounce = require('lodash/debounce')
        this.debounceSearch = debounce(this.search, 100)
        if (this.showCurrentSearch) this.$refs.input.value = this.searchDisplay
      }

    },
    mounted () {
      this.$nextTick(() => {
        // this.search()
        this.init();
      })
    }
  }
</script>

<style lang="scss">
  .search-box {
    position: relative;
    ul {
      background: #fff;
      width: 100%;
      border: $border;
      border-bottom-left-radius: $border-radius;
      border-bottom-right-radius: $border-radius;
      position: absolute;
      top: calc(100% - 2px);
      z-index: 100;
    }
    ul li {
      background: #fff;
      padding: 0.7rem 1rem;
      font-size: 13px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      cursor: pointer;
      &.selected, &:hover {
        background: #efefef;
      }
    }
  }
  .search-box input {
    background: #efefef;
    height: 30px;
    width: 100%;
    padding: 1.1rem;
    border: 0;
    border-radius: 15px;
    font-size: 80%;
    outline: 0;
    &:focus {
      outline-color: rgba(#f00e31, .5);
      outline-width: 1px;
    }
    &.big {
      background: #fff;
      @include input-base();
      padding: 1.9rem;
      font-size: 110%;
    }
  }
  .search-box.loading {
    position: relative;
    &:after {
      content: "";
      width: 10px;
      height: 10px;
      border: 2px solid transparent;
      border-top-color: #4d4d4d;
      border-left-color: #4d4d4d;
      border-radius: 50%;
      display: block;
      position: absolute;
      top: calc(50% - 5px);
      right: 1rem;
      // transform: translate3d(0, -50%, 0);
      animation: .45s ease-in infinite spin;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg)
    }
    100% {
      transform: rotate(360deg)
    }
  }  
  .solo-center {
    width: 100%;
    max-width: 640px;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
    z-index: 100;
  }
</style>
