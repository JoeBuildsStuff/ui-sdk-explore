import { useSyncExternalStore } from "react"

const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

function useHash(fallback: string) {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash || fallback,
    () => fallback
  )
}

export { useHash }
