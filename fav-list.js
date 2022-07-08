const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))  //收藏的電影清單


//放入電影清單
function renderList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button> 
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
          </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//把favorite movies清單拿出來，remove掉不要的名單後，再存回去localStorage
function removeFromFavorite(id){
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  
  //設條件限制:如果清單式空的則不執行
  if (!movies || !movies.length) return
  if (movieIndex === -1) return
  //刪除電影
  movies.splice(movieIndex, 1)
  //存回localStorage
  localStorage.setItem('moviesFavorite', JSON.stringify(movies))
  //重新render
  renderList(movies)
}


//設置監聽器在父層元素dataPanel上
dataPanel.addEventListener('click', function onPanelClicked(event) {  //將function命名方便未來debug，可利用console.log找出問題，因為只用匿名函式會看不出來問題在哪
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))   //在modal上綁data-id，讓modal點擊後之後要找哪一項id對應的資料
  } else if (event.target.matches('.btn-remove-favorite')) {  //在 "+" 按鈕上也綁上監聽器
    removeFromFavorite(Number(event.target.dataset.id))   //加入favorite清單
  }
})

//製作modal內容
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
    .catch((err) => console.log(err))
}


renderList(movies)


