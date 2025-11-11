import { create } from 'zustand'

type PanelType = 'content' | 'wellness' | 'plan' | null

interface PanelStore {
  activePanel: PanelType
  openPanel: (panel: PanelType) => void
  closePanel: () => void
  togglePanel: (panel: PanelType) => void
}

export const usePanelStore = create<PanelStore>((set) => ({
  activePanel: null,
  
  openPanel: (panel) => set({ activePanel: panel }),
  
  closePanel: () => set({ activePanel: null }),
  
  togglePanel: (panel) => set((state) => ({
    activePanel: state.activePanel === panel ? null : panel
  })),
}))
