const userToken = localStorage.getItem("token")
const userData = JSON.parse(localStorage.getItem("userData"))

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

document.addEventListener('DOMContentLoaded', function () {
    if (userData) {
        document.getElementById('username').value = userData.username;
        document.getElementById('age').value = userData.age;
        document.getElementById('name').value = userData.name;
        document.getElementById('email').value = userData.email;
        document.getElementById('expediente').value = userData.expediente;
        document.getElementById('phone').value = userData.phone;
        // El campo de la contraseña generalmente se deja en blanco por razones de seguridad.
        document.getElementById('password').value = '';
    } else {
        console.error('Error: No user data available');
    }
});