import { create } from "zustand"

interface LoadingStore {
  isLoading: boolean // user clicked on button and waiting for something (disable button to don't make 2+ requests)
  setIsLoading: (isLoading: boolean) => void
}

export const useLoading = create<LoadingStore>()(set => ({
  isLoading: false,

  setIsLoading: isLoading => {
    set(() => ({
      isLoading,
    }))
  },
}))
