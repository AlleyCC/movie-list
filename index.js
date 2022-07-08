const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const movies = [] //總電影清單
let filteredMovies = [] //符合搜尋條件的電影清單=>儲存符合篩選條件的有效項目

const MOVIES_PER_PAGE = 12 //for pagination
const paginator = document.querySelector('#paginator')

//放入電影清單
function renderList(data){
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
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}


//add to Favorite
function addToFavorite(id) {
  console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []  //有可能找到item的陣列，或者空清單
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)){
    return alert('This movie is already existed in your Fav list!')
  }
  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}




//設置監聽器在父層元素dataPanel上
dataPanel.addEventListener('click', function onPanelClicked(event){  //將function命名方便未來debug，可利用console.log找出問題，因為只用匿名函式會看不出來問題在哪
  if (event.target.matches('.btn-show-movie')){
    showMovieModal(event.target.dataset.id)   //在modal上綁data-id，讓modal點擊後之後要找哪一項id對應的資料
  } else if (event.target.matches('.btn-add-favorite')){  //在 "+" 按鈕上也綁上監聽器
    addToFavorite(Number(event.target.dataset.id))   //加入favorite清單
  }
})

//製作modal內容
function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then ((response) => {
    const data = response.data.results
    
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
  .catch((err) => console.log(err))
}


//監聽(listener綁在form表單上，取input的值!!)表單提交事件
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')   
searchForm.addEventListener('submit', function onSearchFormSubmmitted (event) {
  event.preventDefault()    //preventDefault會終止元件預設行為，頁面不會跳轉
  const keyword = searchInput.value.trim().toLowerCase()
  
  if (!keyword.length){
    return alert('Please enter valid data!')    //若沒有輸入內容則跳出警告訊息
  }
  //條件篩選
  
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  console.log(filteredMovies)

  //錯誤處理:無符合條件的結果
  if (filteredMovies.length === 0){
    return alert('您輸入的關鍵字${keyword}查無符合結果')
  }
  //重新render畫面
  renderPaginator(filteredMovies.length)
  renderList(getMoviesByPage(1)) //display第一頁的搜尋結果
})


//Pagination
//先切割電影清單=> .slice()
function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const data = filteredMovies.length? filteredMovies : movies //condition=>搜尋清單有無東西，有=>filteredMovies 無=>movies

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//將切割清單function置入api中，request get資料後，切割清單並render畫面
//render paginator(計算資料(清單)長度可以做成幾頁)
function renderPaginator(amount){
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)  //Math.ceil()(=>無條件進位)可將無法整除的餘數一併render成新的一個頁面
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>` //在<a>中增加data-page屬性，點擊時才能進入相對應的頁面
  }
  paginator.innerHTML = rawHTML
}

//監聽<a>
paginator.addEventListener('click', function onPaginatorClicked(event){
  if (event.target.tagName !== 'A') return       //tagname記得大寫，如果點擊事件不是a，結束
    
  const page = Number(event.target.dataset.page)

  renderList(getMoviesByPage(page))
  
})

 // send request to index api
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)  //render paginator，變數是清單長度
  console.log(renderList(getMoviesByPage(1)))  //切割清單並render，getMoviesByPage變數先填1，因為網頁一開始會先呈現第一頁
})
  .catch((err) => console.log(err))