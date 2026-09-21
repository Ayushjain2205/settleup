import { describe, expect, it } from "vitest";
import { errorMessage } from "./error";

describe("errorMessage", () => {
  it("returns Error messages", () => {
    expect(errorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("returns PostgREST-style plain object messages", () => {
    expect(errorMessage({ message: "new row violates row-level security", code: "42501" }, "fallback")).toBe(
      "new row violates row-level security"
    );
  });

  it("returns strings directly", () => {
    expect(errorMessage("plain failure", "fallback")).toBe("plain failure");
  });

  it("falls back for null, undefined, and messageless objects", () => {
    expect(errorMessage(null, "fallback")).toBe("fallback");
    expect(errorMessage(undefined, "fallback")).toBe("fallback");
    expect(errorMessage({}, "fallback")).toBe("fallback");
    expect(errorMessage({ message: 42 }, "fallback")).toBe("fallback");
  });
});
