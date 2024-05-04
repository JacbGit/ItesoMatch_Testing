const checkToken = async() => {
    const token = localStorage.getItem("token")
    if(!token)
        return false

    const tokenRes = await fetch('http://localhost:3000/api/users/checkToken', {
        headers: {
            'Authorization': token
        }
    })
    console.log(tokenRes.ok)
    const tokenData = await tokenRes.json()
    console.log(tokenData)
    return tokenData.ok
}

checkToken().then(x=>{
    if(!x) {
        window.location = "/client/views/home.html"
    }
})

function onMouseHoverLeft() {
    card.classList.add('card__animate--left')
}

function onMouseOutLeft(e) {
    card.classList.remove('card__animate--left')
}

function onMouseHoverRight() {
    card.classList.add('card__animate--right')
}

function onMouseOutRight(e) {
    card.classList.remove('card__animate--right')
}

function onClickLeft() {
    swipeText.innerText = "No match!"
    card.classList.add('fade__animation')
    card.classList.add('fade__out')
    setTimeout(() => {
        swipeText.innerText = ""
        card.classList.remove('fade__out')
    },1000) 
}

function onClickRight() {
    swipeText.innerText = "Match!"
    card.classList.add('fade__animation')
    card.classList.add('fade__out')
    setTimeout(() => {
        swipeText.innerText = ""
        card.classList.remove('fade__out')
    },1000) 
}

document.querySelector('#swipeContainer').innerHTML = String.raw`
    <div>
        <div class="w-full swipe__body h-auto">
            <div class="card relative card__animate" id="card">
                <div class="w-full h-full absolute z-index-10">
                    <div class="flex justify-center w-100 h-full">
                        <div class="w-50 h-full bg-danger opacity-25" id="cardLeftTrigger">
                            
                        </div>
                        <div class="w-50 h-full bg-success opacity-25" id="cardRightTrigger">
                            
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-column text-center">
                    <p class="card__title">
                        Andrea Rojo - 23
                    </p>
                    <div class="separator w-full my"></div>
                    <div>
                        <img src="../assets/karen.jpeg" style="max-height: 300px; width:100%">
                    </div>
                </div>
            </div>

            <p id="swipeText" class="text-white"></p>
        </div>
    </div>
`
const card = document.getElementById('card')

const cardLeftTrigger = document.getElementById('cardLeftTrigger')
cardLeftTrigger.addEventListener('mouseover', onMouseHoverLeft)
cardLeftTrigger.addEventListener('mouseout', onMouseOutLeft)
cardLeftTrigger.addEventListener('click', onClickLeft)

const cardRightTrigger = document.getElementById('cardRightTrigger')
cardRightTrigger.addEventListener('mouseover', onMouseHoverRight)
cardRightTrigger.addEventListener('mouseout', onMouseOutRight)
cardRightTrigger.addEventListener('click', onClickRight)

const swipeText = document.getElementById('swipeText')