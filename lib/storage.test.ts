import { afterEach, describe, expect, it, vi } from "vitest"

import {
  readStored,
  readStoredJson,
  removeStored,
  writeStored,
  writeStoredJson,
} from "@/lib/storage"

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe("demo storage", () => {
  it("round-trips strings and JSON", () => {
    writeStored("k", "v")
    expect(readStored("k")).toBe("v")
    writeStoredJson("j", { a: 1 })
    expect(readStoredJson("j")).toEqual({ a: 1 })
    removeStored("j")
    expect(readStoredJson("j")).toBeNull()
  })

  it("reads a value that is not JSON as nothing saved", () => {
    window.localStorage.setItem("bad", "{not json")
    expect(readStoredJson("bad")).toBeNull()
  })

  it("never throws when the browser refuses storage", () => {
    const refuse = () => {
      throw new DOMException("refused", "SecurityError")
    }
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(refuse)
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(refuse)
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(refuse)

    expect(readStored("k")).toBeNull()
    expect(readStoredJson("k")).toBeNull()
    expect(() => writeStored("k", "v")).not.toThrow()
    expect(() => writeStoredJson("k", { a: 1 })).not.toThrow()
    expect(() => removeStored("k")).not.toThrow()
  })
})
