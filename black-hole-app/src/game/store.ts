import Decimal from 'break_eternity.js'
import { create } from 'zustand'
import { GAME } from './constants'
import { createInitialSimulation, stepSimulation, type SimulationState } from './model'

type GameStore = SimulationState & {
  feedPulse: number
  feed: (multiplier?: number) => void
  tick: (deltaSeconds: number) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialSimulation(),
  feedPulse: 0,
  feed: (multiplier = 1) => {
    const amount = new Decimal(GAME.manualFeedMass * Math.max(0.1, multiplier))
    set((state) => ({
      diskMass: state.diskMass.add(amount),
      totalFed: state.totalFed.add(amount),
      feedPulse: state.feedPulse + 1,
    }))
  },
  tick: (deltaSeconds) => {
    set((state) => ({ ...stepSimulation(state, deltaSeconds) }))
  },
  reset: () => set({ ...createInitialSimulation(), feedPulse: 0 }),
}))
