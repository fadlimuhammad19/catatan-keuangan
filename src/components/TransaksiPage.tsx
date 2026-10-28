import { useState } from 'react'
import type { FormEvent } from 'react'
import { KATEGORI_KELUAR, KATEGORI_MASUK } from '../types'
import type { Akun, Jenis, Transaksi } from '../types'
import type { DataTransaksi } from '../hooks/useFinance'
import { formatDate, formatRupiah, monthOf, todayISO } from '../utils'
import { btn, btnDanger, btnPrimary, card, ikonKategori, input, judul, label } from '../ui'

interface Props {
  transaksi: Transaksi[]
  akun: Akun[]
  bulan: string
  onTambah: (t: DataTransaksi) => void
  onUbah: (id: string, t: DataTransaksi) => void
  onHapus: (id: string) => void
}

const JENIS_AKTIF: Record<Jenis, string> = {
  keluar: 'bg-red-400 text-red-950 border-red-400',
  masuk: 'bg-emerald-400 text-emerald-950 border-emerald-400',
  transfer: 'bg-sky-400 text-sky-950 border-sky-400',
}

const WARNA_JUMLAH: Record<Jenis, string> = {
  keluar: 'text-red-400',
  masuk: 'text-emerald-400',
  transfer: 'text-sky-400',
}

export default function TransaksiPage({ transaksi, akun, bulan, onTambah, onUbah, onHapus }: Props) {
  const namaAkun = akun.map((a) => a.nama)

  // --- state form ---
  const [editId, setEditId] = useState<string | null>(null)
  const [jenis, setJenis] = useState<Jenis>('keluar')
  const [akunAsal, setAkunAsal] = useState(namaAkun.includes('BCA') ? 'BCA' : (namaAkun[0] ?? ''))
  const [akunTujuan, setAkunTujuan] = useState(namaAkun.includes('Cash') ? 'Cash' : (namaAkun[0] ?? ''))
  const [kategori, setKategori] = useState(KATEGORI_KELUAR[0])
  const [nominal, setNominal] = useState('')
  const [tanggal, setTanggal] = useState(todayISO())
  const [catatan, setCatatan] = useState('')
  const [pesan, setPesan] = useState('')

  // --- state filter ---
  const [cari, setCari] = useState('')
  const [filterJenis, setFilterJenis] = useState<'semua' | Jenis>('semua')
  const [filterAkun, setFilterAkun] = useState('semua')

  const daftarKategori = jenis === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR

  const ubahJenis = (j: Jenis) => {
    setJenis(j)
    setKategori((j === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR)[0])
  }

  const kosongkanForm = () => {
    setEditId(null)
    setNominal('')
    setCatatan('')
    setPesan('')
  }

  const kirim = (e: FormEvent) => {
    e.preventDefault()
    const angka = Number(nominal)
    if (!angka || angka <= 0) return setPesan('Nominal harus lebih dari 0')
    if (jenis === 'transfer' && akunAsal === akunTujuan) {
      return setPesan('Akun asal dan tujuan tidak boleh sama')
    }
    const data: DataTransaksi = {
      jenis,
      nominal: angka,
      akun: akunAsal,
      akunTujuan: jenis === 'transfer' ? akunTujuan : '',
      kategori: jenis === 'transfer' ? 'Transfer' : kategori,
      catatan: catatan.trim(),
      tanggal,
    }
    if (editId) onUbah(editId, data)
    else onTambah(data)
    kosongkanForm()
  }

  const mulaiEdit = (t: Transaksi) => {
    setEditId(t.id)
    setJenis(t.jenis)
    setAkunAsal(t.akun)
    setAkunTujuan(t.akunTujuan || namaAkun[0] || '')
    setKategori(t.kategori)
    setNominal(String(t.nominal))
    setTanggal(t.tanggal)
    setCatatan(t.catatan)
    setPesan('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hapus = (t: Transaksi) => {
    if (!confirm('Hapus transaksi ini?')) return
    if (editId === t.id) kosongkanForm()
    onHapus(t.id)
  }

  const kata = cari.trim().toLowerCase()
  const daftar = transaksi
    .filter((t) => monthOf(t.tanggal) === bulan)
    .filter((t) => filterJenis === 'semua' || t.jenis === filterJenis)
    .filter((t) => filterAkun === 'semua' || t.akun === filterAkun || t.akunTujuan === filterAkun)
    .filter((t) => !kata || `${t.catatan} ${t.kategori}`.toLowerCase().includes(kata))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  return (
    <div className="grid gap-5">
      <form className={`${card} grid gap-4 ${editId ? 'ring-2 ring-amber-400/50' : ''}`} onSubmit={kirim}>
        <h2 className="text-base font-semibold text-white">{editId ? '✏️ Edit transaksi' : 'Catat transaksi'}</h2>

        <div className="grid grid-cols-3 gap-2">
          {(['keluar', 'masuk', 'transfer'] as Jenis[]).map((j) => (
            <button
              type="button"
              key={j}
              onClick={() => ubahJenis(j)}
              className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition active:scale-95 ${
                jenis === j ? JENIS_AKTIF[j] : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {j === 'keluar' ? '↑ Keluar' : j === 'masuk' ? '↓ Masuk' : '⇄ Transfer'}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className={label}>{jenis === 'transfer' ? 'Dari akun' : 'Akun'}</span>
            <select className={input} value={akunAsal} onChange={(e) => setAkunAsal(e.target.value)}>
              {namaAkun.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          {jenis === 'transfer' ? (
            <label className="grid gap-1">
              <span className={label}>Ke akun</span>
              <select className={input} value={akunTujuan} onChange={(e) => setAkunTujuan(e.target.value)}>
                {namaAkun.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="grid gap-1">
              <span className={label}>Kategori</span>
              <select className={input} value={kategori} onChange={(e) => setKategori(e.target.value)}>
                {daftarKategori.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
          )}

          <label className="grid gap-1">
            <span className={label}>Nominal (Rp)</span>
            <input
              className={input}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="0"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className={label}>Tanggal</span>
            <input className={input} type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className={label}>Catatan</span>
            <input
              className={input}
              placeholder="Contoh: makan siang, top up Dana..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </label>
        </div>

        {pesan && <p className="text-sm text-red-400">{pesan}</p>}

        <div className="flex gap-2">
          <button type="submit" className={`${btnPrimary} flex-1 sm:flex-none`}>
            {editId ? 'Simpan perubahan' : 'Tambah transaksi'}
          </button>
          {editId && (
            <button type="button" className={btn} onClick={kosongkanForm}>
              Batal
            </button>
          )}
        </div>
      </form>

      <section>
        <h2 className={judul}>Riwayat bulan ini ({daftar.length})</h2>

        <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            className={input}
            placeholder="🔍 Cari catatan / kategori..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
          <select
            className={`${input} sm:w-auto`}
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value as 'semua' | Jenis)}
          >
            <option value="semua">Semua jenis</option>
            <option value="keluar">Keluar</option>
            <option value="masuk">Masuk</option>
            <option value="transfer">Transfer</option>
          </select>
          <select className={`${input} sm:w-auto`} value={filterAkun} onChange={(e) => setFilterAkun(e.target.value)}>
            <option value="semua">Semua akun</option>
            {namaAkun.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        {daftar.length === 0 && (
          <div className={`${card} text-center text-sm text-slate-400`}>
            <p className="text-3xl">🗒️</p>
            <p className="mt-2">Belum ada transaksi yang cocok.</p>
          </div>
        )}

        <ul className="grid gap-2">
          {daftar.map((t) => (
            <li key={t.id} className={`${card} flex flex-wrap items-center gap-3 !p-3`}>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">
                {ikonKategori(t.kategori)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {t.jenis === 'transfer' ? `${t.akun} → ${t.akunTujuan}` : t.kategori}
                  {t.catatan && <span className="font-normal text-slate-400"> · {t.catatan}</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(t.tanggal)}
                  {t.jenis !== 'transfer' && ` · ${t.akun}`}
                </p>
              </div>

              <p className={`whitespace-nowrap font-bold ${WARNA_JUMLAH[t.jenis]}`}>
                {t.jenis === 'masuk' ? '+' : t.jenis === 'keluar' ? '−' : ''}
                {formatRupiah(t.nominal)}
              </p>

              <div className="flex w-full justify-end gap-2 sm:w-auto">
                <button className={`${btn} !px-3 !py-1.5`} onClick={() => mulaiEdit(t)}>
                  Edit
                </button>
                <button className={`${btnDanger} !px-3 !py-1.5`} onClick={() => hapus(t)}>
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}