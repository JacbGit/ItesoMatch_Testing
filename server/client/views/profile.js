const userToken = localStorage.getItem("token");
const userData = JSON.parse(localStorage.getItem("userData"));
let selectedTagsArray = [];

const checkToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  const tokenRes = await fetch("http://localhost:3000/api/users/checkToken", {
    headers: {
      Authorization: token,
    },
  });
  console.log(tokenRes.ok);
  const tokenData = await tokenRes.json();
  console.log(tokenData);
  return tokenData.ok;
};

checkToken().then((x) => {
  if (!x) {
    window.location = "/client/views/home.html";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  if (userData) {
    console.log(userData);
    document.getElementById("username").value = userData.username;
    document.getElementById("age").value = userData.age;
    document.getElementById("name").value = userData.name;
    document.getElementById("email").value = userData.email;
    document.getElementById("expediente").value = userData.expediente;
    document.getElementById("phone").value = userData.phone;
    document.getElementById("img").src =
      "http://localhost:3000/img/" + userData.imageURI;
  } else {
    console.error("Error: No user data available");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("editUserForm");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const userId = userData._id;
      const updatedData = {
        age: document.getElementById("age").value,
        name: document.getElementById("name").value,
        expediente: document.getElementById("expediente").value,
        tags: selectedTagsArray,
      };

      fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken,
        },
        body: JSON.stringify(updatedData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok) {
            alert("Actualizado correctamente");
            console.log("Usuario actualizado correctamente:", data.data);
            localStorage.setItem("userData", JSON.stringify(data.data));
          } else {
            console.error("Error al actualizar el usuario:", data.error);
          }
        })
        .catch((error) => {
          console.error("Error en la solicitud:", error);
        });
    });
  } else {
    console.error("Form not found!");
  }
});

// eslint-disable-next-line no-unused-vars
function deleteprofile() {
  fetch(`http://localhost:3000/api/users/${userData._id}`, {
    method: "DELETE",
    headers: {
      Authorization: userToken,
      adminToken: "admin123", // Token de administrador para autorización
    },
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
  logout();
}

function logout() {
  // Eliminar el token
  localStorage.removeItem("token");
  console.log(localStorage.userData);
  localStorage.removeItem("userData");
  localStorage.clear();
  window.location = "/client/views/home.html";
}

function initializeTags() {
  const tagsDiv = document.getElementById("tagsDiv");
  tagsDiv.innerHTML = "";

  const container = document.getElementById("tagsList");
  container.innerHTML = "";

  const predefinedTags = [
    "#Cine",
    "#Música",
    "#Fitness",
    "#Informática",
    "#Química",
    "#Matemática",
    "#Ciberseguridad",
    "#Arquitectura",
    "#Diseño",
    "#Psicología",
    "#Física",
    "#Abogacía",
    "#Comunicación",
  ];

  predefinedTags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "badge badge-primary";
    tagElement.onclick = function () {
      if (!isTagSelected(tag)) {
        moveTag(tag);
      } else {
        removeTag(tag);
      }
    };
    container.appendChild(tagElement);
  });

  // Move the selected tags from userData.tags
  const selectedTags = userData.tags;
  selectedTags.forEach((tag) => {
    moveTag(tag);
  });
}

// Check if a tag is already selected
function isTagSelected(tag) {
  const selectedTags = document
    .getElementById("selectedTags")
    .getElementsByTagName("span");
  for (let i = 0; i < selectedTags.length; i++) {
    if (selectedTags[i].textContent === tag) {
      return true;
    }
  }
  return false;
}

// Función para mover las etiquetas seleccionadas
function moveTag(tag) {
  const display = document.getElementById("selectedTags");
  const newTag = document.createElement("span");
  newTag.textContent = tag;
  newTag.className = "badge badge-secondary";
  newTag.onclick = function () {
    removeTag(tag);
  };
  display.appendChild(newTag);
  selectedTagsArray.push(tag);
}

// Function to remove selected tag
function removeTag(tag) {
  const selectedTags = document
    .getElementById("selectedTags")
    .getElementsByTagName("span");
  for (let i = 0; i < selectedTags.length; i++) {
    if (selectedTags[i].textContent === tag) {
      selectedTags[i].remove();
      selectedTagsArray = selectedTagsArray.filter((item) => item !== tag);
      break; // Exit loop once tag is removed
    }
  }
}

initializeTags();
