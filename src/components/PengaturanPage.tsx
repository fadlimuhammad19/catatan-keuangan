import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Akun, BackupData, Transaksi } from '../types'
import { buatCSV, formatRupiah, unduh } from '../utils'
import { btn, btnDanger, btnPrimary, card, ikonAkun, input, judul, warnaAkun } from '../ui'

interface Props {
  akun: Akun[]
  saldo: Record<string, number>
  transaksi: Transaksi[]
  onSaldoAwal: (nama: string, nilai: number) => void
  onTambahAkun: (nama: string) => string | null
  onHapusAkun: (nama: string) => string | null
  onEkspor: () => BackupData
  onImpor: (data: BackupData) => void
  onReset: () => void
}

function validBackup(d: unknown): d is BackupData {
  if (typeof d !== 'object' || d === null) return false
  const x = d as Record<string, unknown>
  return Array.isArray(x.transaksi) && Array.isArray(x.akun) && typeof x.anggaran === 'object' && x.anggaran !== null
}

export default function PengaturanPage({
  akun,
  saldo,
  transaksi,
  onSaldoAwal,
  onTambahAkun,
  onHapusAkun,
  onEkspor,
  onImpor,
  onReset,
}: Props) {
  const [namaBaru, setNamaBaru] = useState('')
  const [pesanAkun, setPesanAkun] = useState('')
  const [pesanBackup, setPesanBackup] = useState('')

  const tambah = () => {
    const err = onTambahAkun(namaBaru)
    setPesanAkun(err ?? '')
    if (!err) setNamaBaru('')
  }

  const hapus = (nama: string) => {
    if (!confirm(`Hapus akun ${nama}?`)) return
    setPesanAkun(onHapusAkun(nama) ?? '')
  }

  const tanggalFile = new Date().toLocaleDateString('sv-SE')

  const pilihFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data: unknown = JSON.parse(await file.text())
      if (!validBackup(data)) throw new Error('format salah')
      if (confirm('Impor akan MENIMPA semua data yang ada sekarang. Lanjut?')) {
        onImpor(data)
        setPesanBackup('Data berhasil diimpor.')
      }
    } catch {
      setPesanBackup('File tidak valid. Pakai file backup JSON dari aplikasi ini.')
    }
    e.target.value = ''
  }

  const reset = () => {
    if (confirm('Hapus SEMUA data (transaksi, akun, anggaran)? Tidak bisa dibatalkan.')) {
      onReset()
      setPesanBackup('Semua data sudah dihapus.')
    }
  }

  return (
    <div className="grid gap-5">
      <section className={card}>
        <h2 className={judul}>Akun &amp; saldo awal</h2>
        <p className="mb-4 text-sm text-slate-400">
          Isi saldo awal sesuai saldo kamu saat mulai mencatat. Saldo sekarang dihitung otomatis dari saldo awal
          ditambah semua transaksi.
        </p>

        <ul className="grid gap-2">
          {akun.map((a) => (
            <li
              key={a.nama}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                style={{ background: `${warnaAkun(a.nama)}26` }}
              >
                {ikonAkun(a.nama)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.nama}</p>
                <p className="text-xs text-slate-500">Saldo sekarang: {formatRupiah(saldo[a.nama] ?? 0)}</p>
              </div>
              <input
                className={`${input} !w-36`}
                type="number"
                inputMode="numeric"
                placeholder="Saldo awal"
                value={a.saldoAwal || ''}
                onChange={(e) => onSaldoAwal(a.nama, Number(e.target.value))}
              />
              <button className={`${btnDanger} !px-3 !py-1.5`} onClick={() => hapus(a.nama)}>
                Hapus
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            className={input}
            placeholder="Tambah akun baru (misal: ShopeePay)"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
          />
          <button className={`${btnPrimary} whitespace-nowrap`} onClick={tambah}>
            Tambah
          </button>
        </div>
        {pesanAkun && <p className="mt-2 text-sm text-red-400">{pesanAkun}</p>}
      </section>

      <section className={card}>
        <h2 className={judul}>Backup &amp; data</h2>
        <p className="mb-4 text-sm text-slate-400">
          Data tersimpan di browser ini saja. Rutin download backup, dan pakai file backup untuk memindahkan data ke
          HP atau perangkat lain.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className={btnPrimary}
            onClick={() =>
              unduh(`keuangan-backup-${tanggalFile}.json`, JSON.stringify(onEkspor(), null, 2), 'application/json')
            }
          >
            ⬇️ Download backup (JSON)
          </button>
          <button
            className={btn}
            onClick={() => unduh(`transaksi-${tanggalFile}.csv`, buatCSV(transaksi), 'text/csv;charset=utf-8')}
          >
            📄 Export CSV
          </button>
          <label className={`${btn} cursor-pointer`}>
            ⬆️ Impor backup
            <input type="file" accept="application/json,.json" onChange={pilihFile} hidden />
          </label>
          <button className={btnDanger} onClick={reset}>
            🗑️ Hapus semua data
          </button>
        </div>
        {pesanBackup && <p className="mt-3 text-sm text-slate-400">{pesanBackup}</p>}
      </section>
    </div>
  )
}