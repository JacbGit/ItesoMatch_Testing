document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('#LoginForm'); 

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); 

        const login = {
            username: document.querySelector('#user1').value,
            password: document.querySelector('#password1').value
        }

        fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(login)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Guardado:', data);
            
            //Token 
            localStorage.setItem('token', data.token);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('#RegisterForm'); 

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); 

        const registro = {
            username: document.querySelector('#username').value,
            edad: document.querySelector('#edad').value,
            fullname: document.querySelector('#name').value,
            email: document.querySelector('#email').value,
            expediente: document.querySelector('#expediente').value,
            phone: document.querySelector('#phone').value,
            password: document.querySelector('#password').value
        };

        console.log(registro.edad);

        fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registro)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Guardado:', data);
            
            //Token 
            localStorage.setItem('token', data.token);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    });
});
