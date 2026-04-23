/**
 * @param {Response} res 
 * @returns {boolean} 
 */
function sesionExpirada(res) {
  if (res && (res.status === 401 || res.status === 403)) {
    localStorage.removeItem("token");
    alert("Sesión expirada o inválida. Vuelve a iniciar sesión.");
    window.location.href = "login.html";
    return true;
  }
  return false;
}
