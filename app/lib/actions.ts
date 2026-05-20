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
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
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
      SELECT * FROM users 
      WHERE LOWER(name) = LOWER(${username})
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

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`;
    if (existing.length > 0) {
      return { error: 'Email ini sudah terdaftar. Gunakan email lain.' };
    }

    await sql`
      INSERT INTO users (name, email, password, phone, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, 'Pelanggan')
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

  try {
    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, phone = ${phone}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Profile.' };
  }

  revalidatePath('/dashboard/profile');
  return { message: 'Profil berhasil diperbarui' };
}

export async function changePassword(id: string, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

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
      SELECT id, name, email, role, phone, created_at
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
  redirect('/login');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (!userId) return null;

  try {
    const users = await sql`
      SELECT id, name, email, role, phone FROM users WHERE id = ${userId}
    `;
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    return null;
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

  if (!sender_name || !receiver_name || !origin || !destination || !weight) {
    return { error: 'Mohon lengkapi semua data!' };
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

  // Generate Resi otomatis CKL + 10 digit angka
  const resi = `CKL${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const total_price = weight * 10000;

  try {
    const result = await sql`
      INSERT INTO packages (resi, sender_name, receiver_name, origin, destination, weight, type, payment_method, total_price, user_id)
      VALUES (${resi}, ${sender_name}, ${receiver_name}, ${origin}, ${destination}, ${weight}, ${type}, ${payment_method}, ${total_price}, ${user_id})
      RETURNING *
    `;
    
    revalidatePath('/dashboard-admin');
    return { success: true, package: result[0] };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Gagal simpan paket ke database.' };
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
          origin ILIKE ${searchVal} OR
          destination ILIKE ${searchVal}
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
            origin ILIKE ${searchVal} OR
            destination ILIKE ${searchVal}
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
        SELECT * FROM complaints
        WHERE 
          name ILIKE ${searchVal} OR
          email ILIKE ${searchVal} OR
          title ILIKE ${searchVal} OR
          message ILIKE ${searchVal}
        ORDER BY created_at DESC
      `;
    } else if (typeFilter !== 'Semua' && statusFilter === 'Semua') {
      complaints = await sql`
        SELECT * FROM complaints
        WHERE 
          type = ${typeFilter} AND (
            name ILIKE ${searchVal} OR
            email ILIKE ${searchVal} OR
            title ILIKE ${searchVal} OR
            message ILIKE ${searchVal}
          )
        ORDER BY created_at DESC
      `;
    } else if (typeFilter === 'Semua' && statusFilter !== 'Semua') {
      complaints = await sql`
        SELECT * FROM complaints
        WHERE 
          status = ${statusFilter} AND (
            name ILIKE ${searchVal} OR
            email ILIKE ${searchVal} OR
            title ILIKE ${searchVal} OR
            message ILIKE ${searchVal}
          )
        ORDER BY created_at DESC
      `;
    } else {
      complaints = await sql`
        SELECT * FROM complaints
        WHERE 
          type = ${typeFilter} AND
          status = ${statusFilter} AND (
            name ILIKE ${searchVal} OR
            email ILIKE ${searchVal} OR
            title ILIKE ${searchVal} OR
            message ILIKE ${searchVal}
          )
        ORDER BY created_at DESC
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
      const dateStr = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      const found = rows.find((r: any) => {
        const rowDate = new Date(r.day).toISOString().slice(0, 10);
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
      const dateStr = d.toISOString().slice(0, 10);
      const found = rows.find((r: any) => {
        const rowDate = new Date(r.day).toISOString().slice(0, 10);
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
      const dateStr = d.toISOString().slice(0, 10);
      const found = rows.find((r: any) => {
        const rowDate = new Date(r.day).toISOString().slice(0, 10);
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
