const userToken = localStorage.getItem("token")

const socket = io("ws://localhost:3000", {
    auth: {
        token: userToken
    }
})

socket.on('connect_error', (error) => {
    console.error('Connection error:', error)
})

socket.on("new-message", (message) => {
    console.log("New message echo:", message)
    chatContainer.innerHTML += messageTemplate(message)
    chatContainer.scrollTop = chatContainer.scrollHeight;
})

const messageTemplate = (message)=>`
<div class="d-flex">
    <div class="chat w-50 rounded-pill bg-white text-black p-2">
        ${message}
    </div>
</div>`

const chatContainer = document.getElementById("chatContainer")
chatContainer.scrollTop = chatContainer.scrollHeight;

const msgInput = document.getElementById("msgInput")
const sendBtn = document.getElementById("sendBtn")

sendBtn.onclick = (e) => {
    e.preventDefault();
    socket.emit('message', msgInput.value)
}