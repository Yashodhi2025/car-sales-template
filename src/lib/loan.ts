export type LoanInputs = { price: number; downPayment: number; annualRate: number; months: number };
export type LoanField = keyof LoanInputs;

/** Bounds also keep malformed editor values and non-finite results out of the UI. */
export function loanErrors({ price, downPayment, annualRate, months }: LoanInputs): LoanField[] {
  const errors: LoanField[] = [];
  if (!Number.isFinite(price) || price <= 0 || price > 1e12) errors.push("price");
  if (!Number.isFinite(downPayment) || downPayment < 0 || downPayment > price) errors.push("downPayment");
  if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100) errors.push("annualRate");
  if (!Number.isInteger(months) || months < 1 || months > 600) errors.push("months");
  return errors;
}

/** Fixed-rate, reducing-balance EMI. Round only for display, never between steps. */
export function calculateLoan(inputs: LoanInputs) {
  if (loanErrors(inputs).length) return null;
  const principal = inputs.price - inputs.downPayment;
  const rate = inputs.annualRate / 1200;
  // log1p/expm1 avoid cancellation for very small positive interest rates.
  const monthly = principal === 0 ? 0 : rate === 0 ? principal / inputs.months
    : principal * rate / -Math.expm1(-inputs.months * Math.log1p(rate));
  const totalRepayment = monthly * inputs.months;
  return { principal, monthly, totalRepayment, totalInterest: Math.max(0, totalRepayment - principal) };
}
