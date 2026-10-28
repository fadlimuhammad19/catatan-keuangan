// Kumpulan class Tailwind yang dipakai berulang, biar JSX tetap rapi

export const card =
  'rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/20 backdrop-blur'

export const input =
  'w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30'

export const btn =
  'rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 active:scale-95'

export const btnPrimary =
  'rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-95'

export const btnDanger =
  'rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/20 active:scale-95'

export const label = 'text-xs font-medium text-slate-400'

export const judul = 'mb-3 text-base font-semibold text-white'

const WARNA_AKUN: Record<string, string> = {
  Cash: '#34d399',
  BCA: '#60a5fa',
  BNI: '#fb923c',
  BSI: '#2dd4bf',
  'Bank Jateng': '#f87171',
  Dana: '#38bdf8',
}

const IKON_AKUN: Record<string, string> = {
  Cash: '💵',
  Dana: '📱',
}

const IKON_KATEGORI: Record<string, string> = {
  Makanan: '🍜',
  Transport: '🚗',
  Belanja: '🛍️',
  Tagihan: '🧾',
  Hiburan: '🎮',
  Kesehatan: '💊',
  Pendidikan: '📚',
  'Admin Bank': '🏦',
  Lainnya: '📦',
  Gaji: '💼',
  Usaha: '🏪',
  Bonus: '🎁',
  Hadiah: '🎉',
  Transfer: '🔁',
}

export const warnaAkun = (nama: string) => WARNA_AKUN[nama] ?? '#a78bfa'
export const ikonAkun = (nama: string) => IKON_AKUN[nama] ?? '🏦'
export const ikonKategori = (nama: string) => IKON_KATEGORI[nama] ?? '📦'