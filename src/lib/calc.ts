/** Tiny arithmetic evaluator for amount fields: "850+120+45", "(100+50)*1.18".
 *  Digits, decimals, + - * / ( ) only — everything else is rejected (null).
 *  Never uses eval; hand-rolled tokenizer + shunting-yard. */

const MAX_LEN = 100;

function tokenize(s: string): (number | string)[] | null {
  const tokens: (number | string)[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c >= "0" && c <= "9" || c === ".") {
      let j = i;
      let dots = 0;
      while (j < s.length && ((s[j] >= "0" && s[j] <= "9") || s[j] === ".")) {
        if (s[j] === ".") dots++;
        j++;
      }
      if (dots > 1) return null;
      const num = parseFloat(s.slice(i, j));
      if (Number.isNaN(num)) return null;
      tokens.push(num);
      i = j;
    } else if (c === "+" || c === "-" || c === "*" || c === "/" || c === "(" || c === ")") {
      tokens.push(c);
      i++;
    } else {
      return null;
    }
  }
  return tokens;
}

const precedence = (op: string): number => (op === "+" || op === "-" ? 1 : op === "*" || op === "/" ? 2 : op === "u" ? 3 : 0);

/** Returns the computed value, or null when the input isn't valid arithmetic. */
export function evaluateExpression(input: string): number | null {
  if (typeof input !== "string") return null;
  const s = input
    .trim()
    .replace(/,/g, "")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\s+/g, "");
  if (!s || s.length > MAX_LEN) return null;
  if (!/^[0-9+\-*/().]+$/.test(s)) return null;
  const tokens = tokenize(s);
  if (!tokens || tokens.length === 0) return null;

  // Shunting-yard to RPN (u = unary minus)
  const output: (number | string)[] = [];
  const ops: string[] = [];
  let prev: "start" | "num" | "op" | "(" | ")" = "start";
  for (const t of tokens) {
    if (typeof t === "number") {
      output.push(t);
      prev = "num";
    } else if (t === "(") {
      ops.push(t);
      prev = "(";
    } else if (t === ")") {
      let found = false;
      while (ops.length > 0) {
        const o = ops.pop()!;
        if (o === "(") {
          found = true;
          break;
        }
        output.push(o);
      }
      if (!found) return null;
      prev = ")";
    } else {
      const isUnary = (t === "-" || t === "+") && (prev === "start" || prev === "op" || prev === "(");
      if (isUnary) {
        if (t === "-") {
          while (ops.length > 0 && precedence(ops[ops.length - 1]) >= precedence("u")) output.push(ops.pop()!);
          ops.push("u");
        }
        // unary plus: no-op
        prev = "op";
        continue;
      }
      if (prev !== "num" && prev !== ")") return null;
      while (ops.length > 0 && ops[ops.length - 1] !== "(" && precedence(ops[ops.length - 1]) >= precedence(t)) {
        output.push(ops.pop()!);
      }
      ops.push(t);
      prev = "op";
    }
  }
  while (ops.length > 0) {
    const o = ops.pop()!;
    if (o === "(") return null;
    output.push(o);
  }

  // Eval RPN
  const stack: number[] = [];
  for (const t of output) {
    if (typeof t === "number") {
      stack.push(t);
    } else if (t === "u") {
      if (stack.length < 1) return null;
      stack.push(-stack.pop()!);
    } else {
      if (stack.length < 2) return null;
      const b = stack.pop()!;
      const a = stack.pop()!;
      if (t === "+") stack.push(a + b);
      else if (t === "-") stack.push(a - b);
      else if (t === "*") stack.push(a * b);
      else {
        if (b === 0) return null;
        stack.push(a / b);
      }
    }
  }
  if (stack.length !== 1) return null;
  const v = stack[0];
  if (!Number.isFinite(v)) return null;
  return Math.round(v * 100) / 100;
}

/** Lenient amount parse for text inputs: expression value, else 0. */
export function parseAmount(value: string | undefined | null): number {
  if (value == null) return 0;
  return evaluateExpression(value) ?? 0;
}

/** True when the input is genuine arithmetic (has an operator to compute). */
export function isExpression(value: string): boolean {
  if (!value || !/[+\-*/()×÷]/.test(value.replace(/^\s*-/, ""))) return false;
  return evaluateExpression(value) !== null;
}
