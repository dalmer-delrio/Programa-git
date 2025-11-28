document.addEventListener("DOMContentLoaded", () => {
  const contador = document.getElementById("cartCount");

  // 🔹 Actualizar contador global
  function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem("carritoPublico") || "[]");
    if (contador) contador.textContent = carrito.length;
  }

  // 🔹 Agregar producto al carrito
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const producto = {
        id: btn.dataset.id,
        nombre: btn.dataset.nombre,
        precio: parseFloat(btn.dataset.precio),
        imagen: btn.dataset.imagen,
        cantidad: 1,
      };

      let carrito = JSON.parse(localStorage.getItem("carritoPublico") || "[]");
      const existente = carrito.find((p) => p.id === producto.id);

      if (existente) {
        existente.cantidad++;
      } else {
        carrito.push(producto);
      }

      localStorage.setItem("carritoPublico", JSON.stringify(carrito));
      actualizarContador();

      // 🩵 Modal elegante o alerta
      const modal = document.createElement("div");
      modal.classList.add("modal", "fade");
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content text-center p-3">
            <h5 class="mb-3">✅ ${producto.nombre} agregado al carrito</h5>
            <button class="btn btn-brand w-50 mx-auto" data-bs-dismiss="modal">Continuar</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
      modal.addEventListener("hidden.bs.modal", () => modal.remove());
    });
  });

  actualizarContador();
});
