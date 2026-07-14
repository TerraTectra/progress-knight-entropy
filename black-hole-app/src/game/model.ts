import Decimal from 'break_eternity.js'
import { GAME, MASS_UNIT_KG, PHYSICS } from './constants'

export type SimulationState = {
  coreMass: Decimal
  diskMass: Decimal
  diskTemperatureKelvin: number
  radiation: Decimal
  totalFed: Decimal
  totalAccreted: Decimal
  totalEjected: Decimal
  spin: number
  elapsedSeconds: number
}

export type DerivedState = {
  coreMassKg: number
  diskMassKg: number
  massRatio: number
  eventHorizonMeters: number
  hawkingTemperatureKelvin: number
  hawkingPowerWatts: number
  hawkingMassLossPerSecond: number
  infallTimeSeconds: number
  accretionCapacity: number
  accretionRate: number
  passiveCaptureRate: number
  diskLoad: number
  diskFormationMass: number
  diskFormationProgress: number
  diskFormed: boolean
  ejectionFraction: number
  accretionEfficiency: number
  ejectionRate: number
  diskTemperatureKelvin: number
  targetDiskTemperatureKelvin: number
  thermalResponseSeconds: number
  diskRotationPerSecond: number
  innerDiskVelocityC: number
  collectedRadiationPerSecond: number
}

export const createInitialSimulation = (): SimulationState => ({
  coreMass: new Decimal(GAME.startingCoreMass),
  diskMass: new Decimal(GAME.startingDiskMass),
  diskTemperatureKelvin: GAME.startingDiskTemperatureKelvin,
  radiation: new Decimal(0),
  totalFed: new Decimal(0),
  totalAccreted: new Decimal(0),
  totalEjected: new Decimal(0),
  spin: GAME.startingSpin,
  elapsedSeconds: 0,
})

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const safeNumber = (value: Decimal, fallback = 0) => {
  const number = value.toNumber()
  return Number.isFinite(number) ? number : fallback
}

export const deriveSimulation = (state: SimulationState): DerivedState => {
  const coreMass = Math.max(GAME.startingCoreMass * 0.999, safeNumber(state.coreMass, Number.MAX_VALUE))
  const diskMass = Math.max(0, safeNumber(state.diskMass, Number.MAX_VALUE))
  const coreMassKg = coreMass * MASS_UNIT_KG
  const diskMassKg = diskMass * MASS_UNIT_KG
  const startingMassKg = GAME.startingCoreMass * MASS_UNIT_KG
  const massRatio = Math.max(1, coreMassKg / startingMassKg)

  const eventHorizonMeters =
    (2 * PHYSICS.gravitationalConstant * coreMassKg) /
    PHYSICS.speedOfLight ** 2
  const hawkingTemperatureKelvin =
    (PHYSICS.reducedPlanckConstant * PHYSICS.speedOfLight ** 3) /
    (8 * Math.PI * PHYSICS.gravitationalConstant * coreMassKg * PHYSICS.boltzmannConstant)
  const hawkingPowerWatts =
    (PHYSICS.reducedPlanckConstant * PHYSICS.speedOfLight ** 6) /
    (15360 * Math.PI * PHYSICS.gravitationalConstant ** 2 * coreMassKg ** 2)
  const hawkingMassLossPerSecond = hawkingPowerWatts / PHYSICS.speedOfLight ** 2 / MASS_UNIT_KG

  const infallTimeSeconds = GAME.baseInfallSeconds * Math.pow(massRatio, 0.42)
  const diskFormationMass = GAME.manualFeedMass * 10 * Math.pow(massRatio, 0.06)
  const diskFormationProgress = clamp(diskMass / Math.max(0.001, diskFormationMass), 0, 1)
  const diskFormed = diskFormationProgress >= 0.999
  const diskReference = GAME.manualFeedMass * (8 + 4 * Math.pow(massRatio, 0.12))
  const diskLoad = diskMass / Math.max(0.001, diskReference)
  const overload = Math.max(0, diskLoad - 1)
  const ejectionFraction = clamp(
    0.012 + diskFormationProgress * 0.006 + state.spin * 0.025 + (overload * 0.17) / (1 + overload),
    0.01,
    0.52,
  )
  const orbitalTransport = 0.18 + 0.82 * Math.sqrt(diskFormationProgress)
  const accretionRate =
    diskMass <= 0
      ? 0
      : (diskMass / infallTimeSeconds) *
        (1 + 0.12 * Math.sqrt(Math.max(0, diskLoad))) *
        orbitalTransport
  const accretionCapacity = (diskReference / infallTimeSeconds) * orbitalTransport
  const accretionEfficiency = 1 - ejectionFraction
  const ejectionRate = accretionRate * ejectionFraction
  const passiveCaptureRate = GAME.passiveCapturePerSecond

  const flowIntensity = clamp(
    diskLoad * 0.75 +
      (accretionRate / Math.max(GAME.manualFeedMass / infallTimeSeconds, 0.001)) * 0.15,
    0,
    3.2,
  )
  const massCooling = Math.pow(massRatio, -0.23)
  const targetDiskTemperatureKelvin =
    (1.4e7 + (2.6e8 + 2.2e9 * flowIntensity) * diskFormationProgress) * massCooling
  const thermalResponseSeconds = 1.4 * Math.pow(massRatio, 0.45)
  const diskRotationPerSecond = clamp(
    (5.2 * Math.pow(massRatio, -0.38) * (0.9 + state.spin * 0.45)) /
      (1 + diskLoad * 0.035),
    0.0005,
    6,
  )
  const innerDiskVelocityC = clamp(0.2 + state.spin * 0.28, 0.2, 0.58)
  const collectedRadiationPerSecond =
    ejectionRate * (2 + state.diskTemperatureKelvin / 4e8) + hawkingPowerWatts * 0.01

  return {
    coreMassKg,
    diskMassKg,
    massRatio,
    eventHorizonMeters,
    hawkingTemperatureKelvin,
    hawkingPowerWatts,
    hawkingMassLossPerSecond,
    infallTimeSeconds,
    accretionCapacity,
    accretionRate,
    passiveCaptureRate,
    diskLoad,
    diskFormationMass,
    diskFormationProgress,
    diskFormed,
    ejectionFraction,
    accretionEfficiency,
    ejectionRate,
    diskTemperatureKelvin: state.diskTemperatureKelvin,
    targetDiskTemperatureKelvin,
    thermalResponseSeconds,
    diskRotationPerSecond,
    innerDiskVelocityC,
    collectedRadiationPerSecond,
  }
}

export const stepSimulation = (state: SimulationState, rawDeltaSeconds: number): SimulationState => {
  const deltaSeconds = clamp(rawDeltaSeconds, 0, GAME.maxDeltaSeconds)
  if (deltaSeconds <= 0) return state
  const derived = deriveSimulation(state)
  const inflow = Math.min(state.diskMass.toNumber(), derived.accretionRate * deltaSeconds)
  const swallowed = inflow * derived.accretionEfficiency
  const ejected = inflow - swallowed
  const captured = derived.passiveCaptureRate * deltaSeconds
  const hawkingLoss = Math.min(
    state.coreMass.toNumber() * 0.000001,
    derived.hawkingMassLossPerSecond * deltaSeconds,
  )
  const radiationGain = derived.collectedRadiationPerSecond * deltaSeconds
  const temperatureBlend =
    1 - Math.exp(-deltaSeconds / Math.max(0.1, derived.thermalResponseSeconds))
  const nextMass = Decimal.max(
    GAME.startingCoreMass * 0.999,
    state.coreMass.add(swallowed).sub(hawkingLoss),
  )
  const nextDisk = Decimal.max(0, state.diskMass.add(captured).sub(inflow))
  const spinGain = (swallowed / Math.max(1, state.coreMass.toNumber())) * 0.018
  const spinDrag = state.spin * 0.0000008 * deltaSeconds

  return {
    coreMass: nextMass,
    diskMass: nextDisk,
    diskTemperatureKelvin:
      state.diskTemperatureKelvin +
      (derived.targetDiskTemperatureKelvin - state.diskTemperatureKelvin) * temperatureBlend,
    radiation: state.radiation.add(radiationGain),
    totalFed: state.totalFed.add(captured),
    totalAccreted: state.totalAccreted.add(swallowed),
    totalEjected: state.totalEjected.add(ejected),
    spin: clamp(state.spin + spinGain - spinDrag, 0, 0.98),
    elapsedSeconds: state.elapsedSeconds + deltaSeconds,
  }
}
