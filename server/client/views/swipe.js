const userToken = localStorage.getItem('token')
const userData = JSON.parse(localStorage.getItem('userData'))
let matches = []

const loader = document.getElementById('preloader')
window.addEventListener('load', function () {
  loader.style.display = 'none'
})

const checkToken = async () => {
  const token = localStorage.getItem('token')
  if (!token) { return false }

  const tokenRes = await fetch('https://itesomatch.xyz/api/users/checkToken', {
    headers: {
      Authorization: token
    }
  })
  console.log(tokenRes.ok)
  const tokenData = await tokenRes.json()
  console.log(tokenData)
  return tokenData.ok
}

checkToken().then(x => {
  if (!x) {
    window.location = '/client/views/home.html'
  }
})

const cardTemplate = (user) => String.raw`
<div>
    <div class="w-full swipe__body h-auto">
        <div class="card relative card__animate" id="card">
            <div class="w-full h-full absolute z-index-10">
                <div class="flex justify-center w-100 h-full">
                    <div class="w-50 h-full bg-danger opacity-25" id="cardLeftTrigger">
                        
                    </div>
                    <div class="w-50 h-full bg-success opacity-25" id="cardRightTrigger" onclick="onClickRight('${user._id}')">
                        
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column text-center">
                <p class="card__title">
                    ${user.name} - ${user.age}
                </p>
                <div class="separator w-full my"></div>
                <div>
                    <img src="/img/${user.imageURI}" style="max-height: 300px; width:100%">
                </div>
            </div>
        </div>

        <p id="swipeText" class="text-white"></p>
    </div>
</div>
`

let card = null

let cardLeftTrigger = null

let cardRightTrigger = null

let swipeText = null

const updateMatchCard = () => {
  document.querySelector('#swipeContainer').innerHTML = cardTemplate(matches[0].user)
  document.querySelector('#descriptionCard').innerHTML = `
  <h3>${matches[0].user.name} - ${matches[0].user.age}</h3>
  <hr>
  <p style="max-width=100%; word-wrap: break-word;">${matches[0].user.tags}</p>
  `
  card = document.getElementById('card')

  cardLeftTrigger = document.getElementById('cardLeftTrigger')
  cardLeftTrigger.addEventListener('mouseover', onMouseHoverLeft)
  cardLeftTrigger.addEventListener('mouseout', onMouseOutLeft)
  cardLeftTrigger.addEventListener('click', onClickLeft)

  cardRightTrigger = document.getElementById('cardRightTrigger')
  cardRightTrigger.addEventListener('mouseover', onMouseHoverRight)
  cardRightTrigger.addEventListener('mouseout', onMouseOutRight)

  swipeText = document.getElementById('swipeText')
}

const getMatches = async () => {
  const matchRes = await fetch('https://itesomatch.xyz/api/swipe/top_matches', {
    headers: {
      Authorization: userToken
    }
  })
  const matchData = await matchRes.json()
  console.log(matchData)
  matches = matchData
  updateMatchCard()
}
getMatches()

function onMouseHoverLeft () {
  card.classList.add('card__animate--left')
}

function onMouseOutLeft (e) {
  card.classList.remove('card__animate--left')
}

function onMouseHoverRight () {
  card.classList.add('card__animate--right')
}

function onMouseOutRight (e) {
  card.classList.remove('card__animate--right')
}

function onClickLeft () {
  swipeText.innerText = 'No match!'
  card.classList.add('fade__animation')
  card.classList.add('fade__out')
  setTimeout(() => {
    swipeText.innerText = ''
    card.classList.remove('fade__out')
    matches.shift()
    updateMatchCard()
  }, 1000)
}

async function onClickRight (userId) {
  swipeText.innerText = 'Match!'
  card.classList.add('fade__animation')
  card.classList.add('fade__out')
  await fetch('https://itesomatch.xyz/api/swipe/like_user', {
    method: 'POST',
    headers: {
      Authorization: userToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ targetUser: userId })
  })

  setTimeout(() => {
    swipeText.innerText = ''
    card.classList.remove('fade__out')
    matches.shift()
    updateMatchCard()
  }, 1000)
}
