import { KATEGORI_KELUAR } from '../types'
import type { Anggaran, Transaksi } from '../types'
import { formatRupiah, monthOf, sum } from '../utils'
import { card, ikonKategori, input } from '../ui'

interface Props {
  transaksi: Transaksi[]
  bulan: string
  anggaran: Anggaran
  onSetBatas: (kategori: string, nilai: number) => void
}

const WARNA_BAR: Record<string, string> = {
  '': 'bg-indigo-400',
  ok: 'bg-emerald-400',
  warn: 'bg-amber-400',
  over: 'bg-red-400',
}

export default function AnggaranPage({ transaksi, bulan, anggaran, onSetBatas }: Props) {
  const keluarBulanIni = transaksi.filter((t) => t.jenis === 'keluar' && monthOf(t.tanggal) === bulan)

  const baris = KATEGORI_KELUAR.map((k) => {
    const terpakai = sum(keluarBulanIni.filter((t) => t.kategori === k))
    const batas = anggaran[k] ?? 0
    const persen = batas > 0 ? (terpakai / batas) * 100 : 0
    return { kategori: k, terpakai, batas, persen }
  })

  const totalBatas = baris.reduce((a, b) => a + b.batas, 0)
  const totalTerpakai = baris.filter((b) => b.batas > 0).reduce((a, b) => a + b.terpakai, 0)
  const persenTotal = totalBatas > 0 ? Math.min((totalTerpakai / totalBatas) * 100, 100) : 0

  return (
    <div className="grid gap-5">
      <div className="rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 p-6 shadow-xl shadow-indigo-500/20">
        <p className="text-sm font-medium text-white/70">Total anggaran bulanan</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">{formatRupiah(totalBatas)}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${persenTotal}%` }} />
        </div>
        <p className="mt-2 text-sm text-white/80">
          Terpakai {formatRupiah(totalTerpakai)} dari kategori yang punya anggaran
        </p>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {baris.map((b) => {
          const status = b.batas === 0 ? '' : b.persen >= 100 ? 'over' : b.persen >= 80 ? 'warn' : 'ok'
          return (
            <li key={b.kategori} className={`${card} grid gap-2.5`}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-lg">
                  {ikonKategori(b.kategori)}
                </span>
                <b className="flex-1">{b.kategori}</b>
                <input
                  className={`${input} !w-36`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Batas / bulan"
                  value={b.batas || ''}
                  onChange={(e) => onSetBatas(b.kategori, Number(e.target.value))}
                />
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${WARNA_BAR[status]}`}
                  style={{ width: `${Math.min(b.persen, 100)}%` }}
                />
              </div>

              <p className="text-xs text-slate-400">
                Terpakai {formatRupiah(b.terpakai)}
                {b.batas > 0 &&
                  (b.terpakai > b.batas
                    ? ` · lebih ${formatRupiah(b.terpakai - b.batas)}`
                    : ` · sisa ${formatRupiah(b.batas - b.terpakai)}`)}
              </p>
              {status === 'over' && <p className="text-sm font-medium text-red-400">⚠️ Anggaran terlampaui!</p>}
              {status === 'warn' && (
                <p className="text-sm font-medium text-amber-400">Hampir habis ({Math.round(b.persen)}%)</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}