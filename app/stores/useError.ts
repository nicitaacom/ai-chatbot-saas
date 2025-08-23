import { create } from "zustand"

export interface Error {
  error?: string
  setError: (error: string) => void
}

const useError = create<Error>((set, get) => ({
  error: "",
  setError: error => set(() => ({ error })),
}))

export default useError
