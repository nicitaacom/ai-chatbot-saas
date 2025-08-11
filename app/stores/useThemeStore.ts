import { TPaddings, TTheme } from "@/ts/types/TThemeAndPaddings"
import { create } from "zustand"
import { persist, subscribeWithSelector } from "zustand/middleware"

interface ThemeStore {
  paddings: TPaddings
  theme: TTheme
  setTheme: (theme: TTheme) => void
  setPaddings: (paddings: TPaddings) => void
}

type SetState = (fn: (prevState: ThemeStore) => Partial<ThemeStore>) => void
type GetState = () => ThemeStore

const themeStore = (set: SetState, get: GetState): ThemeStore => ({
  paddings: "Minimalist",
  theme: "dark",
  setTheme(theme: TTheme) {
    set(() => ({
      theme,
    }))
  },
  setPaddings(paddings: TPaddings) {
    set(() => ({
      paddings,
    }))
  },
})

const useThemeStore = create(
  subscribeWithSelector(
    persist(themeStore, {
      name: "themeStore",
      partialize: (state: ThemeStore) => ({
        theme: state.theme,
        paddings: state.paddings,
      }),
    }),
  ),
)

export default useThemeStore
