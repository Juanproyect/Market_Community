function loadModule(moduleName) {
  fetch(`./modules/${moduleName}`)
    .then(response => response.text())
    .then(html => {
      document.getElementById("module-container").innerHTML = html;
    })
    .catch(err => console.error("Error cargando módulo:", err));
}

// Cargar por defecto la página principal
window.onload = () => loadModule("main_pages.html");

function toggleProductForm() {
  const form = document.getElementById("product-form");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

