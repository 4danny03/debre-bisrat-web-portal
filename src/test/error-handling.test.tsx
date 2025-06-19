import { describe, it, expect } from "vitest";
import { getErrorMessage } from "../utils/error-handling";

describe("getErrorMessage utility", () => {
  it("returns the error message for Error objects", () => {
    expect(getErrorMessage(new Error("fail"))).toBe("fail");
  });
  it("returns string for string input", () => {
    expect(getErrorMessage("fail string")).toBe("fail string");
  });
  it("returns JSON string for objects", () => {
    expect(getErrorMessage({ foo: "bar" })).toContain("foo");
  });
});
