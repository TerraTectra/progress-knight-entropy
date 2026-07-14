import { useEffect, useMemo } from 'react'
import './App.css'
import { BlackHoleScene } from './components/BlackHoleScene'
import { GAME, MASS_UNIT_KG } from './game/constants'
import {
  formatDecimal,
  formatLength,
  formatMassKg,
  formatScientific,
  formatTemperature,
} from './game/format'
import { deriveSimulation } from './game/model'
import { useGameStore } from './game/store'

type MetricProps = {
  icon: string
  label: string
  value: string
  hint: string
  hot?: boolean
}

function Metric({ icon, label, value, hint, hot = false }: MetricProps) {
  return (
    <div className={`metric ${hot ? 'metric--hot' : ''}`}>
      <span className="metric__icon">{icon}</span>
      <div className="metric__copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </div>
  )
}

function phaseCopy(progress: number) {
  if (progress < 0.08) {
    return {
      name: 'ЗАРОЖДЕНИЕ',
      text: 'Крошечная чёрная дыра только появилась. Вокруг неё нет готового диска — лишь отдельные захваченные частицы.',
      hint: 'Накапливайте материю на орбите',
    }
  }
  if (progress < 0.45) {
    return {
      name: 'ОРБИТАЛЬНЫЕ ПОТОКИ',
      text: 'Материя вытягивается в редкие дуги. Потоки ещё не соединены и падают к горизонту отдельными рукавами.',
      hint: 'Орбитальные дуги постепенно уплотняются',
    }
  }
  if (progress < 1) {
    return {
      name: 'ФОРМИРОВАНИЕ ДИСКА',
      text: 'Столкновения разогревают вещество. Рваные потоки начинают собираться в единую аккреционную структуру.',
      hint: 'До устойчивого диска осталось немного',
    }
  }
  return {
    name: 'АККРЕЦИОННЫЙ ДИСК',
    text: 'Диск сформирован. Горячая материя вращается, сталкивается, теряет момент импульса и медленно падает внутрь.',
    hint: 'Диск существует только пока в нём есть материя',
  }
}

function App() {
  const state = useGameStore()
  const derived = useMemo(
    () =>
      deriveSimulation({
        coreMass: state.coreMass,
        diskMass: state.diskMass,
        diskTemperatureKelvin: state.diskTemperatureKelvin,
        radiation: state.radiation,
        totalFed: state.totalFed,
        totalAccreted: state.totalAccreted,
        totalEjected: state.totalEjected,
        spin: state.spin,
        elapsedSeconds: state.elapsedSeconds,
      }),
    [
      state.coreMass,
      state.diskMass,
      state.diskTemperatureKelvin,
      state.radiation,
      state.totalFed,
      state.totalAccreted,
      state.totalEjected,
      state.spin,
      state.elapsedSeconds,
    ],
  )

  useEffect(() => {
    let previous = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      useGameStore.getState().tick((now - previous) / 1000)
      previous = now
    }, 50)
    return () => window.clearInterval(timer)
  }, [])

  const formationPercent = derived.diskFormationProgress * 100
  const phase = phaseCopy(derived.diskFormationProgress)
  const diskTemperature = derived.diskFormationProgress < 0.08
    ? '—'
    : formatTemperature(derived.diskTemperatureKelvin)

  return (
    <main className="game-shell">
      <div className="cosmic-noise" />

      <header className="hud-top">
        <div className="hud-top__left">
          <button className="icon-button" type="button" aria-label="Меню">☰</button>
          <button className="mode-button" type="button">◉ РЕЖИМ: БЕСКОНЕЧНОСТЬ⌄</button>
        </div>
        <div className="brand">
          <h1>EVENT HORIZON</h1>
          <span>ПРОТОТИП v0.2.0</span>
        </div>
        <button className="icon-button" type="button" aria-label="Настройки">⚙</button>
      </header>

      <section className="game-layout">
        <aside className="stats-column">
          <Metric icon="◉" label="МАССА ДЫРЫ" value={formatMassKg(derived.coreMassKg)} hint={`+${formatScientific(derived.accretionRate * derived.accretionEfficiency * MASS_UNIT_KG, 2)} кг/с`} />
          <Metric icon="⌬" label="МАТЕРИЯ НА ОРБИТЕ" value={formatMassKg(derived.diskMassKg)} hint={`${formatScientific(formationPercent, 1)}% до устойчивого диска`} />
          <Metric icon="⊙" label="РАЗМЕР ГОРИЗОНТА" value={formatLength(derived.eventHorizonMeters)} hint="атомный масштаб" />
          <Metric icon="◷" label="ВРЕМЯ ПАДЕНИЯ" value={`${formatScientific(derived.infallTimeSeconds, 2)} с`} hint="растёт вместе с массой" />
          <Metric icon="♨" label="ТЕМПЕРАТУРА ДЫРЫ" value={formatTemperature(derived.hawkingTemperatureKelvin)} hint="Хокингово излучение" hot />
          <Metric icon="〽" label="ТЕМПЕРАТУРА ДИСКА" value={diskTemperature} hint={derived.diskFormationProgress < 0.08 ? 'диск не сформирован' : 'тепловая инерция потока'} hot={derived.diskFormationProgress >= 0.08} />
        </aside>

        <section className="space-stage">
          <BlackHoleScene />
          <div className="stage-vignette" />
          <div className="stage-message">
            <span className="stage-message__icon">◎</span>
            <div>
              <strong>{phase.hint}</strong>
              <p>Материя сначала находит орбиту, сталкивается с другими потоками и лишь затем теряет энергию и падает за горизонт.</p>
            </div>
          </div>
        </section>

        <aside className="right-column">
          <section className="hud-panel phase-panel">
            <span className="panel-kicker">СОСТОЯНИЕ</span>
            <h2>{phase.name}</h2>
            <p>{phase.text}</p>
          </section>
          <section className="hud-panel formation-panel">
            <div className="panel-title-row"><span>ДО СОЗДАНИЯ ДИСКА</span><b>◎</b></div>
            <small>Нужно материи на орбите:</small>
            <strong>{formatMassKg(derived.diskFormationMass * MASS_UNIT_KG)}</strong>
            <div className="gold-progress"><i style={{ width: `${formationPercent}%` }} /></div>
            <em>{formatScientific(formationPercent, 2)}%</em>
          </section>
          <section className="hud-panel multipliers-panel">
            <span className="panel-kicker">МНОЖИТЕЛИ</span>
            <div><span>Прирост материи</span><b>×1,00</b></div>
            <div><span>Эффективность поглощения</span><b>×1,00</b></div>
            <div><span>Температура</span><b>×1,00</b></div>
            <div><span>Время</span><b>×1,00</b></div>
          </section>
          <section className="hud-panel upgrade-panel">
            <span className="panel-kicker">СЛЕДУЮЩЕЕ УЛУЧШЕНИЕ</span>
            <h3>СБОР МАТЕРИИ I</h3>
            <p>Увеличивает приток материи на орбиту.</p>
            <small>Стоимость: {formatMassKg(GAME.manualFeedMass * MASS_UNIT_KG * 8)}</small>
            <button type="button" disabled>▣ РАЗБЛОКИРОВАТЬ</button>
          </section>
        </aside>
      </section>

      <footer className="control-dock">
        <div className="flow-readout"><span>ПРИТОК МАТЕРИИ</span><strong>ручная подача</strong></div>
        <button className="matter-button" type="button" onClick={() => state.feed()}>
          <span className="matter-button__plus">＋</span>
          <span><b>ДОБАВИТЬ МАТЕРИЮ</b><small>+{formatMassKg(GAME.manualFeedMass * MASS_UNIT_KG)}</small></span>
        </button>
        <button className="auto-button" type="button" disabled><span>◌</span><b>АВТОСБОР</b><small>ВЫКЛ</small></button>
        <div className="dock-spacer" />
        <div className="radiation-readout"><span>ИЗЛУЧЕНИЕ</span><strong>{formatDecimal(state.radiation, 2)} E</strong></div>
        <button className="reset-button" type="button" onClick={() => state.reset()}>↻ СБРОС</button>
      </footer>
    </main>
  )
}

export default App
