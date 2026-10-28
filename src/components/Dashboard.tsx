import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Akun, Transaksi } from '../types'
import { bulanPendek, formatRupiah, geserBulan, monthOf, sum } from '../utils'
import { card, ikonAkun, judul, warnaAkun } from '../ui'

const WARNA = ['#60a5fa', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#f472b6', '#22d3ee', '#fb923c', '#94a3b8']

interface Props {
  transaksi: Transaksi[]
  akun: Akun[]
  saldo: Record<string, number>
  bulan: string
}

function Mini({ label, nilai, ikon }: { label: string; nilai: number; ikon: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/15 p-3">
      <p className="text-[11px] font-medium text-slate-900/70">
        {ikon} {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold sm:text-base">{formatRupiah(nilai)}</p>
    </div>
  )
}

function BarisLegend({ warna, nama, nilai, persen }: { warna?: string; nama: string; nilai: number; persen: number }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {warna && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: warna }} />}
      <span className="flex-1 truncate text-slate-300">{nama}</span>
      <span className="font-medium">{formatRupiah(nilai)}</span>
      <span className="w-10 text-right text-xs text-slate-500">{persen}%</span>
    </li>
  )
}

export default function Dashboard({ transaksi, akun, saldo, bulan }: Props) {
  const bulanIni = transaksi.filter((t) => monthOf(t.tanggal) === bulan)
  const masuk = sum(bulanIni.filter((t) => t.jenis === 'masuk'))
  const keluar = sum(bulanIni.filter((t) => t.jenis === 'keluar'))
  const totalSaldo = Object.values(saldo).reduce((a, b) => a + b, 0)

  // pengeluaran per kategori (bulan terpilih)
  const perKategori = Object.entries(
    bulanIni
      .filter((t) => t.jenis === 'keluar')
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.kategori] = (acc[t.kategori] ?? 0) + t.nominal
        return acc
      }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // pengeluaran per akun (bulan terpilih)
  const perAkun = akun
    .map((a) => ({
      nama: a.nama,
      total: sum(bulanIni.filter((t) => t.jenis === 'keluar' && t.akun === a.nama)),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)

  // tren 6 bulan terakhir sampai bulan terpilih
  const tren = [-5, -4, -3, -2, -1, 0].map((i) => {
    const ym = geserBulan(bulan, i)
    const tx = transaksi.filter((t) => monthOf(t.tanggal) === ym)
    return {
      bulan: bulanPendek(ym),
      Masuk: sum(tx.filter((t) => t.jenis === 'masuk')),
      Keluar: sum(tx.filter((t) => t.jenis === 'keluar')),
    }
  })

  const ringkas = (v: number) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(v)

  return (
    <div className="grid gap-5">
      {/* kartu saldo utama */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 p-6 text-slate-950 shadow-xl shadow-indigo-500/20">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-slate-900/70">Total saldo semua akun</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatRupiah(totalSaldo)}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <Mini label="Masuk" nilai={masuk} ikon="↓" />
            <Mini label="Keluar" nilai={keluar} ikon="↑" />
            <Mini label="Selisih" nilai={masuk - keluar} ikon="＝" />
          </div>
        </div>
      </section>

      {/* saldo per akun */}
      <section>
        <h2 className={judul}>Saldo per akun</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {akun.map((a) => {
            const s = saldo[a.nama] ?? 0
            return (
              <div key={a.nama} className={`${card} relative overflow-hidden pl-5`}>
                <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: warnaAkun(a.nama) }} />
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="text-lg">{ikonAkun(a.nama)}</span>
                  {a.nama}
                </div>
                <p className={`mt-2 truncate text-lg font-bold ${s < 0 ? 'text-red-400' : 'text-white'}`}>
                  {formatRupiah(s)}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className={card}>
          <h2 className={judul}>Uangmu kemana aja</h2>
          {perKategori.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada pengeluaran di bulan ini.</p>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={perKategori} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {perKategori.map((_, i) => (
                        <Cell key={i} fill={WARNA[i % WARNA.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatRupiah(Number(v ?? 0))}
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 grid gap-2">
                {perKategori.map((k, i) => (
                  <BarisLegend
                    key={k.name}
                    warna={WARNA[i % WARNA.length]}
                    nama={k.name}
                    nilai={k.value}
                    persen={Math.round((k.value / keluar) * 100)}
                  />
                ))}
              </ul>
            </>
          )}
        </div>

        <div className={card}>
          <h2 className={judul}>Pengeluaran per akun</h2>
          {perAkun.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada pengeluaran di bulan ini.</p>
          ) : (
            <ul className="grid gap-3">
              {perAkun.map((x) => (
                <li key={x.nama}>
                  <BarisLegend
                    warna={warnaAkun(x.nama)}
                    nama={x.nama}
                    nilai={x.total}
                    persen={Math.round((x.total / keluar) * 100)}
                  />
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(x.total / keluar) * 100}%`, background: warnaAkun(x.nama) }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={card}>
        <h2 className={judul}>Tren 6 bulan terakhir</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tren}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="bulan" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={ringkas} />
              <Tooltip
                formatter={(v) => formatRupiah(Number(v ?? 0))}
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Legend />
              <Bar dataKey="Masuk" fill="#34d399" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Keluar" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}