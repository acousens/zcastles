'use strict'

import axios from "axios"

let baseURL = 'https://www.mapquestapi.com/search/v4/place';
    baseURL += '?sort=relevance&feedback=false&pageSize=10&q=church'
    baseURL += `&key=${process.env.MAPQUEST_KEY}`

let url;
function search() {
  return axios.get(url).then((resp) => {
    return resp
  }).catch((err) => {
    return {error: err}
  })
}

module.exports = async (req, res) => {
  url = null
  url = baseURL
  url += `&bbox=${req.query.bbox}`;
  url += `&page=${req.query.page}`;
  const resp = await search(req)
  
  let data;
  if (resp.status === 200) {
    data = { 
      results: resp.data.results,
      next: false
    } 
    if ( resp.data.pagination.nextUrl && resp.data.pagination.currentPage < 4 ) {
      data.next = resp.data.pagination.currentPage + 1
    }
  } else {
    data = {
      error: resp
    }
  }
  res.json( data )

}