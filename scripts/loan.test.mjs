import test from "node:test";
import assert from "node:assert/strict";
import { calculateLoan, loanErrors } from "../src/lib/loan.ts";

const quote = { price: 15000, downPayment: 5000, annualRate: 12, months: 12 };
const close = (actual, expected, tolerance = 1e-7) => assert(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test("EMI matches a reference quote and repays the reducing balance", () => {
  const result = calculateLoan(quote);
  close(result.monthly, 888.487886783416);
  close(result.totalInterest, 661.85464140099);
  close(result.totalRepayment, 10661.85464140099);
  assert.equal(result.principal, 10000);
  let balance = result.principal;
  for (let month = 0; month < quote.months; month++) balance = balance * 1.01 - result.monthly;
  close(balance, 0);
});

test("zero interest and full down payment produce finite, accurate estimates", () => {
  assert.deepEqual(calculateLoan({ ...quote, annualRate: 0, months: 10 }), { principal: 10000, monthly: 1000, totalRepayment: 10000, totalInterest: 0 });
  assert.deepEqual(calculateLoan({ ...quote, downPayment: 15000 }), { principal: 0, monthly: 0, totalRepayment: 0, totalInterest: 0 });
  close(calculateLoan({ ...quote, annualRate: 1e-10, months: 10 }).monthly, 1000);
});

test("invalid and empty numeric inputs never produce a quote", () => {
  for (const [field, values] of Object.entries({ price: [0, -1, 1e13, NaN, Infinity], downPayment: [-1, 15001, NaN, Infinity], annualRate: [-1, 101, NaN, Infinity], months: [0, -1, 12.5, 601, NaN, Infinity] })) {
    for (const value of values) {
      const inputs = { ...quote, [field]: value };
      assert(loanErrors(inputs).includes(field));
      assert.equal(calculateLoan(inputs), null);
    }
  }
});

test("large LKR prices and the maximum term stay finite without intermediate rounding", () => {
  const result = calculateLoan({ price: 225000000, downPayment: 45000000, annualRate: 8, months: 600 });
  assert(Object.values(result).every(Number.isFinite));
  assert(result.totalInterest > 0);
  close(result.monthly * 600, result.totalRepayment);
  assert.equal(calculateLoan({ ...quote, months: 1 }).monthly, 10100);
});
