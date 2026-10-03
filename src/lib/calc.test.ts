import { describe, expect, it } from "vitest";
import { evaluateExpression, isExpression, parseAmount } from "./calc";

describe("evaluateExpression", () => {
  it("evaluates plain numbers", () => {
    expect(evaluateExpression("120")).toBe(120);
    expect(evaluateExpression("  45.5 ")).toBe(45.5);
  });

  it("respects operator precedence", () => {
    expect(evaluateExpression("2+3*4")).toBe(14);
    expect(evaluateExpression("100-20/4")).toBe(95);
  });

  it("handles parentheses and unary minus", () => {
    expect(evaluateExpression("(100+50)*2")).toBe(300);
    expect(evaluateExpression("-5+10")).toBe(5);
    expect(evaluateExpression("100*-2")).toBe(-200);
  });

  it("handles spaces, commas, and x/×/÷ symbols", () => {
    expect(evaluateExpression("1,000 + 500")).toBe(1500);
    expect(evaluateExpression("2x3")).toBe(6);
    expect(evaluateExpression("100÷4")).toBe(25);
  });

  it("rounds to 2 decimals", () => {
    expect(evaluateExpression("10/3")).toBe(3.33);
  });

  it("rejects garbage", () => {
    expect(evaluateExpression("")).toBeNull();
    expect(evaluateExpression("abc")).toBeNull();
    expect(evaluateExpression("100+")).toBeNull();
    expect(evaluateExpression("(100+50")).toBeNull();
    expect(evaluateExpression("100/0")).toBeNull();
    expect(evaluateExpression("1.2.3")).toBeNull();
    expect(evaluateExpression("alert(1)")).toBeNull();
  });
});

describe("parseAmount / isExpression", () => {
  it("parses expressions or falls back to 0", () => {
    expect(parseAmount("850+120+45")).toBe(1015);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("junk")).toBe(0);
  });

  it("detects real expressions", () => {
    expect(isExpression("850+120")).toBe(true);
    expect(isExpression("120")).toBe(false);
    expect(isExpression("-50")).toBe(false);
    expect(isExpression("100+")).toBe(false);
  });
});
