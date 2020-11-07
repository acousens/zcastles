<template>
  <main id="app">
    <router-view/>
  </main>
</template>

<script type="text/javascript">
  export default {
    name: 'App',
    data () {
      return {
        secrets: null,
        page: 1,
        photos: {}
      }
    },   
    created: function() { 
      // TODO: Could refresh after x days 
      // localStorage.removeItem('zcastles-photos')
      const photos = localStorage.getItem('zcastles-photos')
      if (photos !== null) {
        this.$store.dispatch('addPhotos', {photos: JSON.parse(photos)})
      } else {
        try {
          let url = `${this.$root.api}/photos`
          fetch(url).then( async (resp) => {
            if (resp.status < 300) {
              const pending = resp.json()
              const data = await pending 
              this.$store.dispatch('addPhotos', {photos: data.photos})
            } else {
              console.log(resp)
            }
          }).catch((err) => {
            console.log(err)
          })
        } catch (error) {
          console.log(error)
        }
      }
      console.log('ready')
    }
  }
</script>

<style lang="scss">
  @import '@/assets/scss/app.scss'
</style>
