export type Jenis = 'masuk' | 'keluar' | 'transfer'

export interface Transaksi {
  id: string
  jenis: Jenis
  nominal: number
  akun: string
  akunTujuan: string // hanya dipakai kalau jenis === 'transfer'
  kategori: string
  catatan: string
  tanggal: string // format YYYY-MM-DD
}

export interface Akun {
  nama: string
  saldoAwal: number
}

// kategori -> batas pengeluaran per bulan
export type Anggaran = Record<string, number>

export interface BackupData {
  transaksi: Transaksi[]
  akun: Akun[]
  anggaran: Anggaran
}

export const AKUN_DEFAULT: Akun[] = ['Cash', 'BCA', 'BNI', 'BSI', 'Bank Jateng', 'Dana'].map(
  (nama) => ({ nama, saldoAwal: 0 })
)

export const KATEGORI_KELUAR = [
  'Makanan',
  'Transport',
  'Belanja',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Admin Bank',
  'Lainnya',
]

export const KATEGORI_MASUK = ['Gaji', 'Usaha', 'Bonus', 'Hadiah', 'Lainnya']