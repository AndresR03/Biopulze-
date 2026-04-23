const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión primero");
    window.location.href = "login.html";
}