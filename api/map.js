import axios from "axios"

let url = 'https://www.mapquestapi.com/search/v4/place';
    url += '?sort=relevance&feedback=false&pageSize=10&page=1&q=church'
    url += `&key=${process.env.MAPQUEST_KEY}`

function search() {
  return axios.get(url).then((resp) => {
    return resp
  }).catch((err) => {
    return {error: err}
  })
}

module.exports = async (req, res) => {
  url += `&bbox=${req.query.bbox}`;
  const resp = await search(req)
  res.json( resp.data )
}