const userToken = localStorage.getItem('token')
const userData = JSON.parse(localStorage.getItem('userData'))
let selectedChat = null
let chats = []
const curChatData = {}

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

const socket = io('wss://itesomatch.xyz', {
  auth: {
    token: userToken
  }
})

socket.on('connect_error', (error) => {
  console.error('Connection error:', error)
})

socket.on('new-message', ({ chatId, message }) => {
  const selected = chats.find(x => x.otherUser._id == selectedChat)
  if (chatId != selected._id) return
  chatContainer.innerHTML += messageTemplate(false, message)
  chatContainer.scrollTop = chatContainer.scrollHeight
})

const messageTemplate = (isSelf, message) => isSelf
  ? `
<div class="d-flex justify-content-end">
                                <div class="chat w-50 rounded-pill border border-primary bg-white text-black p-2">
                                    ${message}
                                </div>
                            </div>
`
  : `
<div class="d-flex">
    <div class="chat w-50 rounded-pill border border-success bg-white text-black p-2">
        ${message}
    </div>
</div>`

const chatTemplate = (user) => `
<div class="btn btn-success w-100 d-flex align-items-center mb-2 gap-2" onclick="selectChat('${user._id}')">
                            <span style="color: white;" class="mr-2">
                                <i class="fa-solid fa-user fa-2x"></i>
                            </span>
                            ${user.username}
                        </div>`

const chatContainer = document.getElementById('chatContainer')
chatContainer.scrollTop = chatContainer.scrollHeight

const chatsContainer = document.getElementById('chatsContainer')
const chatTitle = document.getElementById('chatTitle')

const msgInput = document.getElementById('msgInput')
const sendBtn = document.getElementById('sendBtn')

const selectChat = async (targetId) => {
  selectedChat = targetId
  const selected = chats.find(x => x.otherUser._id == targetId)
  if (selected) {
    const chatRes = await fetch('https://itesomatch.xyz/api/chats/' + selected._id, {
      headers: {
        Authorization: userToken
      }
    })
    const chatData = await chatRes.json()
    if (chatData.ok) {
      chatTitle.innerHTML = ''
      chatTitle.innerHTML = selected.otherUser.username
      chatContainer.innerHTML = ''
      chatData.data.forEach(msg => {
        chatContainer.innerHTML += messageTemplate(msg.sender == userData._id, msg.content)
      })

      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }
}

const getChats = async () => {
  const chatRes = await fetch('https://itesomatch.xyz/api/chats', {
    headers: {
      Authorization: userToken
    }
  })
  const chatData = await chatRes.json()
  chatData.data = chatData.data.map(x => {
    return {
      ...x,
      otherUser: x.users.filter(x => x._id != userData._id)[0]
    }
  })

  let chatsHtml = ''
  chatData.data.forEach(x => {
    chatsHtml += chatTemplate(x.otherUser)
  })

  chats = chatData.data

  chatsContainer.innerHTML = chatsHtml
}

getChats()

sendBtn.onclick = (e) => {
  e.preventDefault()
  if (!selectedChat) return
  const selected = chats.find(x => x.otherUser._id == selectedChat)
  if (selected) {
    socket.emit('message', { chatId: selected._id, targetId: selectedChat, message: msgInput.value })

    chatContainer.innerHTML += messageTemplate(true, msgInput.value)
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}
