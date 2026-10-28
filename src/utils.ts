import type { Transaksi } from './types'

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// Tanggal hari ini (zona waktu lokal) format YYYY-MM-DD
export function todayISO(): string {
  return new Date().toLocaleDateString('sv-SE')
}

export function bulanIni(): string {
  return todayISO().slice(0, 7)
}

// Ambil YYYY-MM dari YYYY-MM-DD
export function monthOf(date: string): string {
  return date.slice(0, 7)
}

export function geserBulan(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function namaBulan(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function bulanPendek(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' })
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function sum(list: Transaksi[]): number {
  return list.reduce((a, t) => a + t.nominal, 0)
}

export function buatCSV(list: Transaksi[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
  const header = ['Tanggal', 'Jenis', 'Akun', 'Akun Tujuan', 'Kategori', 'Nominal', 'Catatan']
  const baris = list.map((t) =>
    [t.tanggal, t.jenis, t.akun, t.akunTujuan, t.kategori, String(t.nominal), t.catatan]
      .map(esc)
      .join(',')
  )
  return '\uFEFF' + [header.map(esc).join(','), ...baris].join('\n')
}

export function unduh(namaFile: string, isi: string, tipe: string) {
  const url = URL.createObjectURL(new Blob([isi], { type: tipe }))
  const a = document.createElement('a')
  a.href = url
  a.download = namaFile
  a.click()
  URL.revokeObjectURL(url)
}