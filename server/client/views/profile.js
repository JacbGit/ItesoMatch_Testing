const userToken = localStorage.getItem('token')
const userData = JSON.parse(localStorage.getItem('userData'))

const checkToken = async () => {
  const token = localStorage.getItem('token')
  if (!token) { return false }

  const tokenRes = await fetch('http://itesomatch.xyz/api/users/checkToken', {
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

document.addEventListener('DOMContentLoaded', function () {
  if (userData) {
    console.log(userData)
    document.getElementById('username').value = userData.username
    document.getElementById('age').value = userData.age
    document.getElementById('name').value = userData.name
    document.getElementById('email').value = userData.email
    document.getElementById('expediente').value = userData.expediente
    document.getElementById('phone').value = userData.phone
  } else {
    console.error('Error: No user data available')
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('editUserForm')

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault()

      const userId = userData._id
      const token = localStorage.getItem('token')
      const updatedData = {
        age: document.getElementById('age').value,
        name: document.getElementById('name').value,
        expediente: document.getElementById('expediente').value
      }

      fetch(`http://itesomatch.xyz/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userToken
        },
        body: JSON.stringify(updatedData)
      })
        .then(response => response.json())
        .then(data => {
          if (data.ok) {
            alert('Actualizado correctamente')
            console.log('Usuario actualizado correctamente:', data.data)
            localStorage.setItem('userData', JSON.stringify(data.data))
          } else {
            console.error('Error al actualizar el usuario:', data.error)
          }
        })
        .catch(error => {
          console.error('Error en la solicitud:', error)
        })
    })
  } else {
    console.error('Form not found!')
  }
})

function deleteprofile () {
  fetch(`http://itesomatch.xyz/api/users/${userData._id}`, {
    method: 'DELETE',
    headers: {
      Authorization: userToken,
      adminToken: 'admin123' // Token de administrador para autorización
    }
  }).then(response => response.json())
    .then(data => console.log(data))
  logout()
}

function logout () {
  // Eliminar el token
  localStorage.removeItem('token')
  console.log(localStorage.userData)
  localStorage.removeItem('userData')
  localStorage.clear()
  window.location = '/client/views/home.html'
}
