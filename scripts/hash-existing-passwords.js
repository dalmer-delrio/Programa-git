
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ferreteria',
    waitForConnections: true
  });
  const [rows] = await pool.query('SELECT id_usuario, `contraseña` FROM usuarios');
  const saltRounds = 10;
  let updated = 0;
  for (const row of rows) {
    const pw = row['contraseña'];
    if (!pw) continue;
    if (/^\$2[aby]\$/.test(pw)) continue;
    const hashed = await bcrypt.hash(pw, saltRounds);
    await pool.query('UPDATE usuarios SET `contraseña` = ? WHERE id_usuario = ?', [hashed, row.id_usuario]);
    updated++;
    console.log('Re-hasheado usuario id:', row.id_usuario);
  }
  console.log('Total re-hasheados:', updated);
  await pool.end();
})().catch(err => { console.error(err); process.exit(1); });
