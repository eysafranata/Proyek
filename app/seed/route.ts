import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers(sql: any) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone VARCHAR(20),
      kota_asal VARCHAR(100),
      role VARCHAR(20) DEFAULT 'Pelanggan',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`DROP TABLE IF EXISTS packages CASCADE`;
  await sql`
    CREATE TABLE IF NOT EXISTS packages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      resi VARCHAR(50) NOT NULL UNIQUE,
      user_id UUID NOT NULL,
      sender_name VARCHAR(255) NOT NULL,
      receiver_name VARCHAR(255) NOT NULL,
      origin VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      weight FLOAT NOT NULL,
      type VARCHAR(100),
      payment_method VARCHAR(100),
      total_price INT NOT NULL,
      status VARCHAR(50) DEFAULT 'Menunggu Konfirmasi',
      tanggal_kirim DATE,
      no_telepon VARCHAR(20),
      jenis_barang VARCHAR(255),
      jenis_kendaraan VARCHAR(100),
      deskripsi TEXT,
      status_barang VARCHAR(50) DEFAULT 'Aman',
      status_transaksi VARCHAR(50) DEFAULT 'Belum Lunas',
      plat_kendaraan VARCHAR(50),
      kode_pos VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`DROP TABLE IF EXISTS vehicles CASCADE`;
  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      nama_kendaraan VARCHAR(255) NOT NULL,
      jenis_kendaraan VARCHAR(100) NOT NULL,
      kode_kendaraan VARCHAR(50) NOT NULL,
      kapasitas_muatan FLOAT NOT NULL,
      status_kendaraan VARCHAR(50) DEFAULT 'Tersedia',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`DROP TABLE IF EXISTS complaints CASCADE`;
  await sql`
    CREATE TABLE IF NOT EXISTS complaints (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      admin_reply TEXT,
      replied_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${user.phone}, ${user.role})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

export async function GET() {
  try {
    await sql.begin(async (sql) => {
      await seedUsers(sql);
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
