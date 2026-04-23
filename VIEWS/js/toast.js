function showToast(mensaje, tipo) {
  tipo = tipo === "error" ? "error" : "success";
  const el = document.createElement("div");
  el.className = "toast toast--" + tipo;
  el.textContent = mensaje;
  document.body.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 4000);
}
