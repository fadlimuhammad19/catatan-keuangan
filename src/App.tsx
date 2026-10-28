import { useState } from 'react'
import { useFinance } from './hooks/useFinance'
import Dashboard from './components/Dashboard'
import TransaksiPage from './components/TransaksiPage'
import AnggaranPage from './components/AnggaranPage'
import PengaturanPage from './components/PengaturanPage'
import { bulanIni, geserBulan, namaBulan } from './utils'
import { btn, input } from './ui'

type Tab = 'dashboard' | 'transaksi' | 'anggaran' | 'pengaturan'

const TABS: { id: Tab; label: string; ikon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', ikon: '📊' },
  { id: 'transaksi', label: 'Transaksi', ikon: '🧾' },
  { id: 'anggaran', label: 'Anggaran', ikon: '🎯' },
  { id: 'pengaturan', label: 'Pengaturan', ikon: '⚙️' },
]

export default function App() {
  const f = useFinance()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [bulan, setBulan] = useState(bulanIni())

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 font-sans text-slate-100">
      {/* cahaya latar */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-xl shadow-lg shadow-indigo-500/30">
              💰
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Catatan Keuangan</h1>
              <p className="text-xs text-slate-400">Tahu uangmu pergi ke mana</p>
            </div>
          </div>

          {tab !== 'pengaturan' && (
            <div className="flex items-center gap-2">
              <button className={btn} onClick={() => setBulan(geserBulan(bulan, -1))} aria-label="Bulan sebelumnya">
                ‹
              </button>
              <input
                type="month"
                className={`${input} w-auto`}
                value={bulan}
                onChange={(e) => e.target.value && setBulan(e.target.value)}
                title={namaBulan(bulan)}
              />
              <button className={btn} onClick={() => setBulan(geserBulan(bulan, 1))} aria-label="Bulan berikutnya">
                ›
              </button>
              {bulan !== bulanIni() && (
                <button className={btn} onClick={() => setBulan(bulanIni())}>
                  Bulan ini
                </button>
              )}
            </div>
          )}
        </header>

        {/* navigasi: bawah layar di HP, pill di atas untuk layar lebar */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/10 bg-slate-950/90 backdrop-blur sm:static sm:mb-5 sm:gap-1 sm:rounded-2xl sm:border sm:bg-white/5 sm:p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-2.5 text-[11px] font-medium transition sm:flex-none sm:flex-row sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm ${
                tab === t.id
                  ? 'text-cyan-300 sm:bg-white/10 sm:text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-lg sm:text-base">{t.ikon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <main>
          {tab === 'dashboard' && (
            <Dashboard transaksi={f.transaksi} akun={f.akun} saldo={f.saldo} bulan={bulan} />
          )}
          {tab === 'transaksi' && (
            <TransaksiPage
              transaksi={f.transaksi}
              akun={f.akun}
              bulan={bulan}
              onTambah={f.tambahTransaksi}
              onUbah={f.ubahTransaksi}
              onHapus={f.hapusTransaksi}
            />
          )}
          {tab === 'anggaran' && (
            <AnggaranPage transaksi={f.transaksi} bulan={bulan} anggaran={f.anggaran} onSetBatas={f.setBatas} />
          )}
          {tab === 'pengaturan' && (
            <PengaturanPage
              akun={f.akun}
              saldo={f.saldo}
              transaksi={f.transaksi}
              onSaldoAwal={f.ubahSaldoAwal}
              onTambahAkun={f.tambahAkun}
              onHapusAkun={f.hapusAkun}
              onEkspor={f.ekspor}
              onImpor={f.impor}
              onReset={f.resetSemua}
            />
          )}
        </main>
      </div>
    </div>
  )
}