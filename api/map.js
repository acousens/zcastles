import axios from "axios"

let url = 'https://www.mapquestapi.com/search/v4/place';
    url += '?sort=relevance&feedback=false&pageSize=10&page=1&q=church'
    url += `&key=${process.env.MAPQUEST_KEY}`

let searchData = {
  results: [],
  status: null
};

function mapQuestResp(resolve, reject) {

  return axios.get(url).then((resp) => {
    searchData.status = resp.status
    if (resp.status === 200) {
      if (resp.data.pagination.nextUrl && resp.data.pagination.currentPage < 4) {
        searchData.results = searchData.results.concat(resp.data.results)
        url = resp.data.pagination.nextUrl;
        mapQuestResp(resolve, reject)
      } else {
        url = null
        resolve(searchData)
      }
    } else {
      reject(resp)
    }
  }).catch((err) => {
    reject(err)
  })
}

const search = function(req) {
  url += `&bbox=${req.query.bbox}`;
  return new Promise((resolve, reject) => {
    mapQuestResp(resolve, reject)
  }).then(() => {
    return searchData
  })
}

module.exports = async (req, res) => {
  const resp = await search(req)
  console.log(resp)
  res.json( resp )
}