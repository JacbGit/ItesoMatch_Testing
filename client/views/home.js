document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('#LoginForm'); // Asegúrate de agregar el id "loginForm" al formulario de login

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Evitar que el formulario se envíe de manera predeterminada

        const email = document.querySelector('#email1').value;
        const password = document.querySelector('#password1').value;

        console.log('Email:', email);
        console.log('Contraseña:', password);

        // Aquí podrías llamar a una función que maneje estos datos, como enviarlos a un servidor
    });
});
