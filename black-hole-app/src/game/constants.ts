export const MASS_UNIT_KG = 1e12

export const PHYSICS = {
  gravitationalConstant: 6.67430e-11,
  speedOfLight: 299_792_458,
  reducedPlanckConstant: 1.054_571_817e-34,
  boltzmannConstant: 1.380_649e-23,
} as const

const ATOMIC_EVENT_HORIZON_METERS = 1e-10
const ATOMIC_BLACK_HOLE_MASS_KG =
  (ATOMIC_EVENT_HORIZON_METERS * PHYSICS.speedOfLight ** 2) /
  (2 * PHYSICS.gravitationalConstant)

export const GAME = {
  atomicEventHorizonMeters: ATOMIC_EVENT_HORIZON_METERS,
  startingCoreMass: ATOMIC_BLACK_HOLE_MASS_KG / MASS_UNIT_KG,
  startingDiskMass: 0,
  startingDiskTemperatureKelvin: 3.2e8,
  manualFeedMass: 250,
  passiveCapturePerSecond: 0,
  baseInfallSeconds: 5,
  startingSpin: 0.16,
  maxDeltaSeconds: 0.25,
} as const
