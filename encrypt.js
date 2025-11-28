const bcrypt = require("bcrypt");

(async () => {
  const password = "123456"; // contraseña actual del admin
  const hash = await bcrypt.hash(password, 10);
  console.log("🔑 Hash generado para guardar en la BD:");
  console.log(hash);
})();
