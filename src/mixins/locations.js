export default {
  methods: {
    nextAvailablePhoto(id) {
      let photos = this.$store.state.photos, keys = Object.keys(photos);
      var i = 0, nextAvailable = null;
      while (nextAvailable === null) {
        var thisPhoto = photos[keys[i]];
        if (thisPhoto.mapPlaces.length === 0 ) {
          nextAvailable = thisPhoto
        } else if (i === keys.length-1) {
          nextAvailable = photos[keys[0]]
        } else {
          var nextPhoto = photos[keys[i+1]]
          if (nextPhoto.mapPlaces.length < thisPhoto.mapPlaces.length) {
            nextAvailable = nextPhoto
          } else {
            i++
          }
        }
      }
      this.$store.dispatch('addMapPlaceIDToPhoto', {photoID: nextAvailable.id, placeID: id})
      return nextAvailable;
    },
    getOrCreateLocation(data) {
      let locations = this.$store.state.map.locations;
      let location = locations[data.id];
      if (typeof location === 'undefined') {
        let photo = this.nextAvailablePhoto(data.id)
        location = {
          place: data,
          photo: photo,
          price: `$${(Math.floor(Math.random() * 10000000)).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`,
          bedrooms: Math.floor(Math.random() * 30),
          bathrooms: Math.floor(Math.random() * 20),
          sqft: `${(100000 + Math.floor(Math.random() * 100000)).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
        }
        this.$store.dispatch('map/addLocation', {id: data.id, location: location})
      }
      return location;
    }
  }
}
