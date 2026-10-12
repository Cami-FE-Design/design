// Every read and write of the demo's localStorage goes through here.
//
// Storage can refuse: a private window, blocked site data, a full quota. Each
// store used to call `window.localStorage` itself, some inside a try and some
// not, so a browser that refused storage could throw on mount and take the
// page with it. These never throw. A refused read is "nothing saved", and a
// refused write leaves the state in memory for the rest of the visit.
//
// Keys and stored shapes stay each store's own; this file only moves bytes.

function storage(): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** The saved string, or null when nothing is saved or storage refuses. */
export function readStored(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

/**
 * The saved value parsed as JSON, or null when nothing is saved, storage
 * refuses, or the value is not JSON. The caller still checks its shape.
 */
export function readStoredJson(key: string): unknown {
  const raw = readStored(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: string): void {
  try {
    storage()?.setItem(key, value)
  } catch {
    // Full or refused — the state still holds for this visit.
  }
}

export function writeStoredJson(key: string, value: unknown): void {
  writeStored(key, JSON.stringify(value))
}

export function removeStored(key: string): void {
  try {
    storage()?.removeItem(key)
  } catch {
    // Refused — there was nothing this visit could have saved there either.
  }
}
