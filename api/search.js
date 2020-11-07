import axios from "axios"

let url = 'http://www.mapquestapi.com/search/v3/prediction?limit=7&collection=address,adminArea,airport,category,franchise,poi';
    url += `&key=${process.env.MAPQUEST_KEY}`

module.exports = async (req, res) => {
  url += `&q=${req.query.q}`
  const resp = await axios.get(url)
  res.json( {data: resp.data} )
}
