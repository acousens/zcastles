let url = null;

function initURL() {
  if (url === null) {
    url = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}';
    url += `?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
  }
}

module.exports = (req, res) => {
  initURL()
  res.status(200).send(url)
}

