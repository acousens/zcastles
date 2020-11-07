import axios from "axios"
import { Promise } from "core-js";

let url  = 'https://api.unsplash.com/collections/9881644/photos';
    url += `?client_id=${process.env.UNSPLASH_CLIENT_ID}`
    url += `&client_secret=${process.env.UNSPLASH_CLIENT_SECRET}`

// module.exports = async (req, res) => {
//   url += `&per_page=${req.query.per}`;
//   url += `&page=${req.query.page}`
//   const resp = await axios.get(url)
//   res.json({photos: resp.data})
// }

let page = 0, batch;
function unsplashRequest(resolve, reject) {
  if (page < 1) {
    page ++; 
    batch = {}
  }
  
  let per = 30
  url += `&per_page=${per}`;
  url += `&page=${page}`

  axios.get(url).then((resp) => {
    resp.data.forEach((item) => {
      item.mapPlaces = []
      batch[item.id] = item
    })
    if (resp.data.length < per ) {
      resolve()
    } else {
      page++
      unsplashRequest(resolve, reject)
    }
  })
}

const init = function() {
  return new Promise((resolve, reject) => {
    unsplashRequest(resolve, reject)
  }).then(() => {
    return batch
  })
}

module.exports = async (req, res) => {
  let photos = await init()
  res.json({photos: photos})
}