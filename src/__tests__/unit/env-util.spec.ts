import { isEnv } from "../../utils/env";
import { describe, expect, it } from "bun:test";

describe("env util", () => {
  it("works for valid entries", () => {
    const env: string = "local";

    const isValid = isEnv(env);

    expect(isValid).toBe(true);
  });

  it("works for nonvalid entries", () => {
    const env = "wrong";

    const isValid = isEnv(env);

    expect(isValid).toBe(false);
  });
});
