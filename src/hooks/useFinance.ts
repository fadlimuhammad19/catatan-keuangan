import { useEffect, useMemo, useState } from 'react'
import { AKUN_DEFAULT } from '../types'
import type { Akun, Anggaran, BackupData, Transaksi } from '../types'
import { newId } from '../utils'

// Seperti useState, tapi nilainya otomatis disimpan di localStorage
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // abaikan jika storage penuh / diblokir
    }
  }, [key, value])

  return [value, setValue] as const
}

export type DataTransaksi = Omit<Transaksi, 'id'>

export function useFinance() {
  const [transaksi, setTransaksi] = useLocalStorage<Transaksi[]>('keuangan.transaksi', [])
  const [akun, setAkun] = useLocalStorage<Akun[]>('keuangan.akun', AKUN_DEFAULT)
  const [anggaran, setAnggaran] = useLocalStorage<Anggaran>('keuangan.anggaran', {})

  // saldo tiap akun = saldo awal + semua mutasi
  const saldo = useMemo(() => {
    const hasil: Record<string, number> = {}
    akun.forEach((a) => {
      hasil[a.nama] = a.saldoAwal
    })
    transaksi.forEach((t) => {
      if (t.jenis === 'masuk') {
        hasil[t.akun] = (hasil[t.akun] ?? 0) + t.nominal
      } else if (t.jenis === 'keluar') {
        hasil[t.akun] = (hasil[t.akun] ?? 0) - t.nominal
      } else {
        hasil[t.akun] = (hasil[t.akun] ?? 0) - t.nominal
        hasil[t.akunTujuan] = (hasil[t.akunTujuan] ?? 0) + t.nominal
      }
    })
    return hasil
  }, [akun, transaksi])

  const tambahTransaksi = (t: DataTransaksi) =>
    setTransaksi((prev) => [{ ...t, id: newId() }, ...prev])

  const ubahTransaksi = (id: string, t: DataTransaksi) =>
    setTransaksi((prev) => prev.map((x) => (x.id === id ? { ...t, id } : x)))

  const hapusTransaksi = (id: string) => setTransaksi((prev) => prev.filter((x) => x.id !== id))

  // return string = pesan error, null = berhasil
  const tambahAkun = (nama: string): string | null => {
    const n = nama.trim()
    if (!n) return 'Nama akun masih kosong'
    if (akun.some((a) => a.nama.toLowerCase() === n.toLowerCase())) return 'Akun sudah ada'
    setAkun((prev) => [...prev, { nama: n, saldoAwal: 0 }])
    return null
  }

  const ubahSaldoAwal = (nama: string, nilai: number) =>
    setAkun((prev) => prev.map((a) => (a.nama === nama ? { ...a, saldoAwal: nilai } : a)))

  const hapusAkun = (nama: string): string | null => {
    if (transaksi.some((t) => t.akun === nama || t.akunTujuan === nama)) {
      return 'Akun ini masih dipakai di transaksi'
    }
    setAkun((prev) => prev.filter((a) => a.nama !== nama))
    return null
  }

  const setBatas = (kategori: string, nilai: number) =>
    setAnggaran((prev) => {
      const baru = { ...prev }
      if (nilai > 0) baru[kategori] = nilai
      else delete baru[kategori]
      return baru
    })

  const ekspor = (): BackupData => ({ transaksi, akun, anggaran })

  const impor = (data: BackupData) => {
    setTransaksi(data.transaksi)
    setAkun(data.akun)
    setAnggaran(data.anggaran)
  }

  const resetSemua = () => {
    setTransaksi([])
    setAkun(AKUN_DEFAULT)
    setAnggaran({})
  }

  return {
    transaksi,
    akun,
    anggaran,
    saldo,
    tambahTransaksi,
    ubahTransaksi,
    hapusTransaksi,
    tambahAkun,
    ubahSaldoAwal,
    hapusAkun,
    setBatas,
    ekspor,
    impor,
    resetSemua,
  }
}