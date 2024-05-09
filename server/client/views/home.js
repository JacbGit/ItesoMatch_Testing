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
  if (x) {
    window.location = '/client/views/swipe.html'
  }
})

let formData = null

// Envio del login
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('#LoginForm')

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault()

    const login = {
      username: document.querySelector('#user1').value,
      password: document.querySelector('#password1').value
    }

    fetch('https://itesomatch.xyz/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(login)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Guardado:', data)

        // Token
        localStorage.setItem('token', data.data.token)
        // localStorage.setItem('userData', JSON.stringify(data.data.userData));
        localStorage.setItem('userData', JSON.stringify(data.data.userData))
        if (data.data.token) {
          window.location = '/client/views/profile.html'
        }
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  })
})

// envio del Register
document.getElementById('RegisterForm').addEventListener('submit', function (event) {
  event.preventDefault()
  // asignamos los atributos y sus valores
  const registerData = {
    username: document.querySelector('#username').value,
    age: document.querySelector('#edad').value,
    name: document.querySelector('#name').value,
    email: document.querySelector('#email').value,
    expediente: document.querySelector('#expediente').value,
    phone: document.querySelector('#phone').value,
    password: document.querySelector('#password').value,
    image: document.querySelector('#image').files[0]
  }

  formData = new FormData()
  formData.append('username', document.querySelector('#username').value)
  formData.append('age', document.querySelector('#edad').value)
  formData.append('name', document.querySelector('#name').value)
  formData.append('email', document.querySelector('#email').value)
  formData.append('expediente', document.querySelector('#expediente').value)
  formData.append('phone', document.querySelector('#phone').value)
  formData.append('password', document.querySelector('#password').value)
  formData.append('image', document.querySelector('#image').files[0])
  console.log(formData)

  localStorage.setItem('registerData', JSON.stringify(registerData)) // guardamos el Item porque si no no se guarda

  // Validacion para que no nos deje pasar de modulo hasta que esten verificados
  if (this.checkValidity()) {
    console.log('Formulario válido, enviando datos...')

    $('#RegisterForm').modal('hide')

    setTimeout(() => {
      $('#tagsModal').modal('show')
    }, 500) // Delay para simular el tiempo
  }
  this.classList.add('was-validated') // (Añade esta clase para mostrar los resultados de la validación)
})

// Función para inicializar las etiquetas
function initializeTags () {
  const container = document.getElementById('tagsList')
  container.innerHTML = ''
  const tags = ['#Cine', '#Música', '#Fitness', '#Informática', '#Química', '#Matemática', '#Ciberseguridad', '#Arquitectura',
    '#Diseño', '#Psicología', '#Física', '#Abogacía', '#Comunicación']

  tags.forEach(tag => {
    const tagElement = document.createElement('span')
    tagElement.textContent = tag
    tagElement.className = 'badge badge-primary'
    tagElement.onclick = function () {
      moveTag(this.textContent)
      this.remove()
    }
    container.appendChild(tagElement)
  })
}

// Función para mover las etiquetas seleccionadas
function moveTag (tag) {
  const display = document.getElementById('selectedTags')
  const newTag = document.createElement('span')
  newTag.textContent = tag
  newTag.className = 'badge badge-secondary'
  newTag.setAttribute('data-tag', tag)
  display.appendChild(newTag)
}

// Función para sacar la info de los tags seleccionados
function submitTags () {
  const selectedTags = Array.from(document.querySelectorAll('#selectedTags .badge')).map(el => el.getAttribute('data-tag'))
  console.log('Etiquetas seleccionadas:', selectedTags)

  const registerData = JSON.parse(localStorage.getItem('registerData'))
  // Agregamos las tags al documento
  registerData.tags = selectedTags
  formData.append('tags', selectedTags)

  fetch('https://itesomatch.xyz/api/users', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      console.log('Guardado:', data)
      if(!data.ok){
        alert("Credenciales incorrectas");
      }
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('userData', JSON.stringify(data.data.userData))

      if (data.data.token) {
        window.location = '/client/views/profile.html'
      }
      // Optionally, you can perform further actions after successful data submission
    })
    .catch(error => {
      console.error('Error :', error)
    })

  $('#tagsModal').modal('hide')
}

// Si se sale de tags, reinicia el Modal de register
$('.modal').on('hidden.bs.modal', function () {
  const selectedTagsDisplay = document.getElementById('selectedTags')
  selectedTagsDisplay.innerHTML = 'Etiquetas:' // Reinicia el contenido, Lo puse aqui porque si no no se cierra.
  document.getElementById('RegisterForm').reset()
})
