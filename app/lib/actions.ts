'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama lengkap harus diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(1, 'Nomor telepon harus diisi'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"],
});

export async function authenticateUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const users = await sql`
      SELECT id, name, email, password, role, phone, kota_asal, avatar_url FROM users 
      WHERE LOWER(name) = LOWER(${username}) OR LOWER(email) = LOWER(${username})
    `;

    if (users.length === 0) {
      return { error: 'Username atau password salah' };
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: 'Username atau password salah' };
    }

    const cookieStore = await cookies();
    cookieStore.set('session_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    cookieStore.set('session_user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      } 
    };

  } catch (error) {
    return { error: 'Database Error: Gagal melakukan autentikasi.' };
  }
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const kota_asal = formData.get('kota_asal') as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`;
    if (existing.length > 0) {
      return { error: 'Email ini sudah terdaftar. Gunakan email lain.' };
    }

    await sql`
      INSERT INTO users (name, email, password, phone, kota_asal, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, ${kota_asal}, 'Pelanggan')
    `;
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Terjadi kesalahan sistem saat mendaftar.' };
  }

  revalidatePath('/dashboard-admin');
  redirect('/login');
}

export async function updateProfile(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const kota_asal = formData.get('kota_asal') as string;

  if (!name || !name.trim() || !email || !email.trim() || !phone || !phone.trim() || !kota_asal || !kota_asal.trim()) {
    return { error: true, message: 'Error: Semua kolom profil wajib diisi!' };
  }

  try {
    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, phone = ${phone}, kota_asal = ${kota_asal}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { error: true, message: 'Database Error: Failed to Update Profile.' };
  }

  revalidatePath('/dashboard/profile');
  return { success: true, message: 'Profil berhasil diperbarui' };
}

export async function changePassword(id: string, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword.length < 8) {
    return { error: 'new', message: 'Password baru harus minimal 8 karakter' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'confirm', message: 'Konfirmasi password tidak sesuai' };
  }

  try {
    const user = await sql`SELECT password FROM users WHERE id = ${id}`;
    if (!user.length) return { error: 'global', message: 'User tidak ditemukan' };

    const passwordMatch = await bcrypt.compare(currentPassword, user[0].password);
    if (!passwordMatch) {
        return { error: 'current', message: 'Password saat ini salah' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${id}`;
    
  } catch (error) {
    return { error: 'global', message: 'Database Error: Failed to Change Password.' };
  }

  return { success: true, message: 'Password berhasil diganti' };
}

export async function deleteUser(id: string) {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
  } catch (error) {
    return { message: 'Database Error: Failed to Delete User.' };
  }

  revalidatePath('/dashboard-admin/users');
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredUsers(query: string, currentPage: number = 1) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const users = await sql`
      SELECT id, name, email, role, phone, avatar_url, created_at
      FROM users
      WHERE
        name ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`} OR
        role ILIKE ${`%${query}%`}
      ORDER BY created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    // Convert dates to strings for transport
    return users.map(u => ({
      ...u,
      created_at: u.created_at.toISOString()
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchUsersPages(query: string) {
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM users
      WHERE
        name ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`} OR
        role ILIKE ${`%${query}%`}
    `;
    const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of users.');
  }
}

export async function getUserStats() {
  try {
    const data = await sql`SELECT COUNT(*) FROM users WHERE role = 'Pelanggan'`;
    return { totalCustomers: Number(data[0].count) };
  } catch (error) {
    return { totalCustomers: 0 };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('session_user_id');
  cookieStore.delete('session_user_role');
  redirect('/');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (!userId) return null;

  try {
    const users = await sql`
      SELECT id, name, email, role, phone, kota_asal, avatar_url FROM users WHERE id = ${userId}
    `;
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    return null;
  }
}

export async function updateAvatar(userId: string, formData: FormData) {
  const file = formData.get('avatar') as File;
  if (!file) {
    return { error: 'Tidak ada file yang dipilih' };
  }

  // Validate size (max 1MB)
  if (file.size > 1 * 1024 * 1024) {
    return { error: 'Ukuran file terlalu besar. Maksimal adalah 1MB.' };
  }

  // Validate type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Format file tidak didukung. Harap unggah PNG, JPG, JPEG, atau WEBP.' };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const avatarUrl = `data:${file.type};base64,${base64Image}`;

    // Update database
    await sql`UPDATE users SET avatar_url = ${avatarUrl} WHERE id = ${userId}`;

    return { success: true, avatarUrl };
  } catch (error: any) {
    console.error('Error updating avatar:', error);
    return { error: 'Database Error: Gagal mengunggah foto profil.' };
  }
}

export async function createPackage(formData: FormData) {
  const sender_name = formData.get('sender_name') as string;
  const receiver_name = formData.get('receiver_name') as string;
  const origin = formData.get('origin') as string;
  const destination = formData.get('destination') as string;
  const weight = parseFloat(formData.get('weight') as string);
  const type = formData.get('type') as string;
  const payment_method = formData.get('payment_method') as string;

  const tanggal_kirim = formData.get('tanggal_kirim') as string;
  const no_telepon = formData.get('no_telepon') as string;
  const jenis_barang = formData.get('jenis_barang') as string;
  const jenis_kendaraan = formData.get('jenis_kendaraan') as string;
  const plat_kendaraan = formData.get('plat_kendaraan') as string;
  const deskripsi = (formData.get('deskripsi') as string) || '';
  const kode_pos = (formData.get('kode_pos') as string) || '';
  const alamat = (formData.get('alamat') as string) || '';

  // deskripsi is now optional, but others are required
  if (!sender_name || !receiver_name || !origin || !destination || !weight || !tanggal_kirim || !no_telepon || !jenis_barang || !jenis_kendaraan || !kode_pos || !alamat) {
    return { error: 'Mohon lengkapi semua data!' };
  }

  // Validate no_telepon: minimal 10 digit, maksimal 12 digit
  const phoneDigits = no_telepon.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 12) {
    return { error: 'Nomor telepon harus terdiri dari 10 sampai 12 digit.' };
  }

  // Validate sender_name against users table
  const userRows = await sql`
    SELECT id FROM users 
    WHERE LOWER(name) = LOWER(${sender_name}) AND role = 'Pelanggan'
  `;

  if (userRows.length === 0) {
    return { error: 'Nama pelanggan tidak terdaftar di sistem. Mohon pastikan pelanggan sudah memiliki akun.' };
  }
  
  const user_id = userRows[0].id;

  // Gunakan resi kustom jika dikirim dari klien, jika tidak generate resi otomatis CKL + 10 digit angka
  const resi = (formData.get('resi') as string) || `CKL${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const total_price = parseInt(formData.get('total_price') as string) || 0;

  try {
    const result = await sql`
      INSERT INTO packages (resi, sender_name, receiver_name, origin, destination, weight, type, payment_method, total_price, user_id, tanggal_kirim, no_telepon, jenis_barang, jenis_kendaraan, plat_kendaraan, deskripsi, kode_pos, alamat)
      VALUES (${resi}, ${sender_name}, ${receiver_name}, ${origin}, ${destination}, ${weight}, ${type}, ${payment_method}, ${total_price}, ${user_id}, ${tanggal_kirim}, ${no_telepon}, ${jenis_barang}, ${jenis_kendaraan}, ${plat_kendaraan}, ${deskripsi}, ${kode_pos}, ${alamat})
      RETURNING *
    `;
    
    revalidatePath('/dashboard-admin');
    return { success: true, package: result[0] };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal simpan paket ke database.' };
  }
}

export async function fetchPackageByResi(resi: string) {
  try {
    const packages = await sql`
      SELECT * FROM packages 
      WHERE UPPER(resi) = UPPER(${resi.trim()})
    `;
    if (packages.length === 0) return null;
    const pkg = packages[0];
    return {
      ...pkg,
      created_at: pkg.created_at ? pkg.created_at.toISOString() : null,
      tanggal_kirim: pkg.tanggal_kirim ? pkg.tanggal_kirim.toISOString().split('T')[0] : null
    };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function fetchMyPackages() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const packages = await sql`
      SELECT * FROM packages 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC
    `;
    
    return packages.map(p => ({
      ...p,
      created_at: p.created_at ? p.created_at.toISOString() : null
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchAllPackages(query: string = '', statusFilter: string = 'Semua') {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') throw new Error('Unauthorized');

  try {
    const searchVal = `%${query}%`;
    let packages;

    if (statusFilter === 'Semua') {
      packages = await sql`
        SELECT * FROM packages
        WHERE
          resi ILIKE ${searchVal} OR
          sender_name ILIKE ${searchVal} OR
          receiver_name ILIKE ${searchVal} OR
          jenis_barang ILIKE ${searchVal} OR
          origin ILIKE ${searchVal} OR
          destination ILIKE ${searchVal} OR
          no_telepon ILIKE ${searchVal}
        ORDER BY created_at DESC
      `;
    } else {
      packages = await sql`
        SELECT * FROM packages
        WHERE
          status = ${statusFilter} AND (
            resi ILIKE ${searchVal} OR
            sender_name ILIKE ${searchVal} OR
            receiver_name ILIKE ${searchVal} OR
            jenis_barang ILIKE ${searchVal} OR
            origin ILIKE ${searchVal} OR
            destination ILIKE ${searchVal} OR
            no_telepon ILIKE ${searchVal}
          )
        ORDER BY created_at DESC
      `;
    }

    return packages.map((p: any) => ({
      ...p,
      created_at: p.created_at ? p.created_at.toISOString() : null,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function updatePackageStatus(id: string, status: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return { error: 'Unauthorized' };

  try {
    await sql`UPDATE packages SET status = ${status} WHERE id = ${id}`;
    revalidatePath('/dashboard-admin/packages');
    revalidatePath('/dashboard-admin/laporan-kinerja');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal mengubah status paket.' };
  }
}

export async function submitComplaint(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Anda harus login terlebih dahulu!' };
  }

  const type = formData.get('type') as string;
  const title = formData.get('title') as string;
  const message = formData.get('message') as string;

  if (!type || !title || !message) {
    return { error: 'Mohon lengkapi semua field!' };
  }

  try {
    const result = await sql`
      INSERT INTO complaints (user_id, name, email, type, title, message, status)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${type}, ${title}, ${message}, 'Pending')
      RETURNING *
    `;
    
    revalidatePath('/dashboard/feedback');
    revalidatePath('/dashboard-admin/complaints');
    return { success: true, complaint: {
      ...result[0],
      created_at: result[0].created_at ? result[0].created_at.toISOString() : null
    } };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal mengirim keluhan/feedback.' };
  }
}

export async function fetchMyComplaints() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const complaints = await sql`
      SELECT * FROM complaints 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC
    `;
    
    return complaints.map((c: any) => ({
      ...c,
      created_at: c.created_at ? c.created_at.toISOString() : null
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchAllComplaints(query: string = '', typeFilter: string = 'Semua', statusFilter: string = 'Semua') {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') {
    throw new Error('Unauthorized');
  }

  try {
    let complaints;
    const searchVal = `%${query}%`;
    
    if (typeFilter === 'Semua' && statusFilter === 'Semua') {
      complaints = await sql`
        SELECT c.*, u.avatar_url
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE 
          c.name ILIKE ${searchVal} OR
          c.email ILIKE ${searchVal} OR
          c.title ILIKE ${searchVal} OR
          c.message ILIKE ${searchVal}
        ORDER BY c.created_at DESC
      `;
    } else if (typeFilter !== 'Semua' && statusFilter === 'Semua') {
      complaints = await sql`
        SELECT c.*, u.avatar_url
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE 
          c.type = ${typeFilter} AND (
            c.name ILIKE ${searchVal} OR
            c.email ILIKE ${searchVal} OR
            c.title ILIKE ${searchVal} OR
            c.message ILIKE ${searchVal}
          )
        ORDER BY c.created_at DESC
      `;
    } else if (typeFilter === 'Semua' && statusFilter !== 'Semua') {
      complaints = await sql`
        SELECT c.*, u.avatar_url
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE 
          c.status = ${statusFilter} AND (
            c.name ILIKE ${searchVal} OR
            c.email ILIKE ${searchVal} OR
            c.title ILIKE ${searchVal} OR
            c.message ILIKE ${searchVal}
          )
        ORDER BY c.created_at DESC
      `;
    } else {
      complaints = await sql`
        SELECT c.*, u.avatar_url
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE 
          c.type = ${typeFilter} AND
          c.status = ${statusFilter} AND (
            c.name ILIKE ${searchVal} OR
            c.email ILIKE ${searchVal} OR
            c.title ILIKE ${searchVal} OR
            c.message ILIKE ${searchVal}
          )
        ORDER BY c.created_at DESC
      `;
    }

    return complaints.map((c: any) => ({
      ...c,
      created_at: c.created_at ? c.created_at.toISOString() : null
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function updateComplaintStatus(id: string, status: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') {
    return { error: 'Unauthorized' };
  }

  try {
    await sql`
      UPDATE complaints
      SET status = ${status}
      WHERE id = ${id}
    `;
    
    revalidatePath('/dashboard/feedback');
    revalidatePath('/dashboard-admin/complaints');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal memperbarui status keluhan.' };
  }
}

export async function fetchLaporanStats() {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [totalRes, selesaiRes, prosesRes, revenueThisMonthRes, revenueLastMonthRes] = await Promise.all([
      sql`SELECT COUNT(*) FROM packages`,
      sql`SELECT COUNT(*) FROM packages WHERE status = 'Selesai'`,
      sql`SELECT COUNT(*) FROM packages WHERE status != 'Selesai'`,
      sql`SELECT COALESCE(SUM(total_price), 0) as total FROM packages WHERE created_at >= ${thisMonthStart}`,
      sql`SELECT COALESCE(SUM(total_price), 0) as total FROM packages WHERE created_at >= ${lastMonthStart} AND created_at < ${lastMonthEnd}`,
    ]);

    const revenueThisMonth = Number(revenueThisMonthRes[0].total);
    const revenueLastMonth = Number(revenueLastMonthRes[0].total);
    let percentChange = 0;
    if (revenueLastMonth > 0) {
      percentChange = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
    } else if (revenueThisMonth > 0) {
      percentChange = 100;
    }

    return {
      totalPaket: Number(totalRes[0].count),
      selesai: Number(selesaiRes[0].count),
      dalamProses: Number(prosesRes[0].count),
      revenueThisMonth,
      revenueLastMonth,
      percentChange: Math.round(percentChange * 10) / 10,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      totalPaket: 0,
      selesai: 0,
      dalamProses: 0,
      revenueThisMonth: 0,
      revenueLastMonth: 0,
      percentChange: 0,
    };
  }
}

function toLocalYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export async function fetchDailyRevenue(days: number = 7) {
  try {
    const rows = await sql`
      SELECT 
        DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Jakarta') AS day,
        COALESCE(SUM(total_price), 0) AS revenue
      FROM packages
      WHERE created_at >= NOW() - INTERVAL '${sql.unsafe(String(days))} days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    // Build a complete array for all N days (fill missing days with 0)
    const result: { date: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalYYYYMMDD(d); // "YYYY-MM-DD"
      const found = rows.find((r: any) => {
        const rowDate = toLocalYYYYMMDD(new Date(r.day));
        return rowDate === dateStr;
      });
      result.push({ date: dateStr, revenue: found ? Number(found.revenue) : 0 });
    }
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchDailyPackageVolume(days: number = 7) {
  try {
    const rows = await sql`
      SELECT 
        DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Jakarta') AS day,
        COUNT(*) AS count
      FROM packages
      WHERE created_at >= NOW() - INTERVAL '${sql.unsafe(String(days))} days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const result: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalYYYYMMDD(d);
      const found = rows.find((r: any) => {
        const rowDate = toLocalYYYYMMDD(new Date(r.day));
        return rowDate === dateStr;
      });
      result.push({ date: dateStr, count: found ? Number(found.count) : 0 });
    }
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchDailyPackageVolumeByStatus(days: number = 7) {
  try {
    const rows = await sql`
      SELECT 
        DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Jakarta') AS day,
        status,
        COUNT(*) AS count
      FROM packages
      WHERE created_at >= NOW() - INTERVAL '${sql.unsafe(String(days))} days'
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `;

    const result: { date: string; sukses: number; proses: number; batal: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalYYYYMMDD(d);
      
      const dayRows = rows.filter((r: any) => {
        const rowDate = toLocalYYYYMMDD(new Date(r.day));
        return rowDate === dateStr;
      });

      let sukses = 0;
      let proses = 0;
      let batal = 0;

      dayRows.forEach((r: any) => {
        const status = r.status;
        const count = Number(r.count);
        if (status === 'Selesai') {
          sukses += count;
        } else if (status === 'Dibatalkan') {
          batal += count;
        } else {
          proses += count;
        }
      });

      result.push({ date: dateStr, sukses, proses, batal });
    }
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchDailyUserRegistration(days: number = 7) {
  try {
    const rows = await sql`
      SELECT 
        DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Jakarta') AS day,
        COUNT(*) AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${sql.unsafe(String(days))} days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const result: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalYYYYMMDD(d);
      const found = rows.find((r: any) => {
        const rowDate = toLocalYYYYMMDD(new Date(r.day));
        return rowDate === dateStr;
      });
      result.push({ date: dateStr, count: found ? Number(found.count) : 0 });
    }
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function checkUserExists(emailOrUsername: string) {
  try {
    const users = await sql`
      SELECT id FROM users 
      WHERE LOWER(email) = LOWER(${emailOrUsername}) OR LOWER(name) = LOWER(${emailOrUsername})
    `;
    if (users.length === 0) {
      return { error: 'Email/username tidak ditemukan. Pastikan Anda sudah terdaftar.' };
    }
    return { success: true, userId: users[0].id };
  } catch (error) {
    return { error: 'Database Error: Gagal mengecek pengguna.' };
  }
}

export async function resetPassword(userId: string, formData: FormData) {
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' };
  }
  if (newPassword.length < 8) {
    return { error: 'Password harus minimal 8 karakter.' };
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`;
    return { success: true };
  } catch (error) {
    return { error: 'Database Error: Gagal mereset password.' };
  }
}

export async function updatePackageDetails(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return { error: 'Unauthorized' };

  const status = formData.get('status') as string;
  const status_barang = formData.get('status_barang') as string;
  const status_transaksi = formData.get('status_transaksi') as string;
  const plat_kendaraan = formData.get('plat_kendaraan') as string;
  const total_price = parseInt(formData.get('total_price') as string);

  try {
    await sql`
      UPDATE packages 
      SET status = ${status}, status_barang = ${status_barang}, status_transaksi = ${status_transaksi}, plat_kendaraan = ${plat_kendaraan}, total_price = ${total_price} 
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard-admin/packages');
    revalidatePath('/dashboard-admin/laporan-kinerja');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal memperbarui data paket.' };
  }
}

export async function fetchVehicles() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return [];

  try {
    const vehicles = await sql`SELECT * FROM vehicles ORDER BY created_at DESC`;
    return vehicles.map(v => ({ ...v, created_at: v.created_at ? v.created_at.toISOString() : null }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function createVehicle(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return { error: 'Unauthorized' };

  const nama_kendaraan = formData.get('nama_kendaraan') as string;
  const jenis_kendaraan = formData.get('jenis_kendaraan') as string;
  const kode_kendaraan = formData.get('kode_kendaraan') as string;
  const kapasitas_muatan = parseFloat(formData.get('kapasitas_muatan') as string);
  const status_kendaraan = formData.get('status_kendaraan') as string;

  if (!nama_kendaraan || !jenis_kendaraan || !kode_kendaraan || isNaN(kapasitas_muatan)) {
    return { error: 'Semua kolom wajib diisi!' };
  }

  const platRegex = /^[bB]\s?\d{4}\s?[a-zA-Z]+$/;
  if (!platRegex.test(kode_kendaraan.trim())) {
    return { error: 'Format plat nomor salah. Contoh format yang benar: B 1234 ABC' };
  }

  try {
    await sql`
      INSERT INTO vehicles (nama_kendaraan, jenis_kendaraan, kode_kendaraan, kapasitas_muatan, status_kendaraan)
      VALUES (${nama_kendaraan}, ${jenis_kendaraan}, ${kode_kendaraan.trim().toUpperCase()}, ${kapasitas_muatan}, ${status_kendaraan})
    `;
    revalidatePath('/dashboard-admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal menambahkan kendaraan.' };
  }
}

export async function updateVehicle(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return { error: 'Unauthorized' };

  const nama_kendaraan = formData.get('nama_kendaraan') as string;
  const jenis_kendaraan = formData.get('jenis_kendaraan') as string;
  const kode_kendaraan = formData.get('kode_kendaraan') as string;
  const kapasitas_muatan = parseFloat(formData.get('kapasitas_muatan') as string);
  const status_kendaraan = formData.get('status_kendaraan') as string;

  if (!nama_kendaraan || !jenis_kendaraan || !kode_kendaraan || isNaN(kapasitas_muatan)) {
    return { error: 'Semua kolom wajib diisi!' };
  }

  const platRegex = /^[bB]\s?\d{4}\s?[a-zA-Z]+$/;
  if (!platRegex.test(kode_kendaraan.trim())) {
    return { error: 'Format plat nomor salah. Contoh format yang benar: B 1234 ABC' };
  }

  try {
    await sql`
      UPDATE vehicles 
      SET nama_kendaraan = ${nama_kendaraan}, jenis_kendaraan = ${jenis_kendaraan}, kode_kendaraan = ${kode_kendaraan.trim().toUpperCase()}, kapasitas_muatan = ${kapasitas_muatan}, status_kendaraan = ${status_kendaraan}
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard-admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal mengubah kendaraan.' };
  }
}

export async function deleteVehicle(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return { error: 'Unauthorized' };

  try {
    await sql`DELETE FROM vehicles WHERE id = ${id}`;
    revalidatePath('/dashboard-admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal menghapus kendaraan.' };
  }
}

export async function deletePackage(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return { error: 'Unauthorized' };

  try {
    await sql`DELETE FROM packages WHERE id = ${id}`;
    revalidatePath('/dashboard-admin/packages');
    revalidatePath('/dashboard-admin/laporan-kinerja');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal menghapus data paket.' };
  }
}

export async function replyToComplaint(id: string, reply: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Admin') return { error: 'Unauthorized' };

  try {
    await sql`
      UPDATE complaints
      SET admin_reply = ${reply}, status = 'Selesai', replied_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/feedback');
    revalidatePath('/dashboard-admin/complaints');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal mengirim balasan keluhan.' };
  }
}
