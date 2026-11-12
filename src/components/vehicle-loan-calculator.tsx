"use client";
import { EditableText, EditableFeedback } from "./vanguard-editable";

import { useState } from "react";
import { EditableSection } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { priceNumber } from "@/lib/inventory";
import { calculateLoan, loanErrors, type LoanField, type LoanInputs } from "@/lib/loan";
import styles from "./vehicle-loan-calculator.module.css";

const path = (field: string) => `loanCalculator.${field}`;

export function VehicleLoanCalculator({ vehicleId }: { vehicleId: VehicleId }) {
  const { content } = useSiteContent();
  const savedPrice = priceNumber(content.cards.vehicles[vehicleId].price);
  const defaults = content.loanCalculator.defaults;
  // A live Fivora price/default edit refreshes the initial quote as well as the copy.
  return <Calculator key={JSON.stringify([vehicleId, savedPrice, defaults])} price={savedPrice} />;
}

function Calculator({ price }: { price: number | null }) {
  const { content, t } = useSiteContent();
  const defaults = content.loanCalculator.defaults;
  const initial = {
    price: price === null ? "" : String(price),
    downPayment: price === null ? "0" : String(Math.round(price * defaults.downPaymentPercent) / 100),
    annualRate: String(defaults.annualRate ?? ""),
    months: String(defaults.months ?? ""),
  };
  const [values, setValues] = useState(initial);
  const [focused, setFocused] = useState<LoanField | null>(null);
  const numbers = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() === "" ? NaN : Number(value)])) as LoanInputs;
  const errors = loanErrors(numbers);
  const result = calculateLoan(numbers);
  const code = t("common.currencyCode").trim().toUpperCase();
  let formatter: Intl.NumberFormat;
  try { formatter = new Intl.NumberFormat("en-LK", { style: "currency", currency: code, currencyDisplay: "code", minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  catch { formatter = new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  const money = (value: number | undefined) => value === undefined ? "—" : formatter.format(value);
  const groupedAmount = (value: string) => value.trim() && Number.isFinite(Number(value))
    ? new Intl.NumberFormat("en-LK", { maximumFractionDigits: 20 }).format(Number(value)) : value;
  const fields: { key: LoanField; min: number; max: number; step: string; unit: string }[] = [
    { key: "price", min: .01, max: 1e12, step: "any", unit: code },
    { key: "downPayment", min: 0, max: Number.isFinite(numbers.price) ? numbers.price : 1e12, step: "any", unit: code },
    { key: "annualRate", min: 0, max: 100, step: "any", unit: "%" },
    { key: "months", min: 1, max: 600, step: "1", unit: t(path("monthsUnit")) },
  ];

  return <EditableSection name="vehicle-loan-calculator" padding="0 0 26px" className={styles.section} aria-labelledby="loan-calculator-title">
    <div className="vm-container">
      <div className={styles.heading} data-reveal>
        <EditableText id={path("eyebrow")} as="p" className="vm-eyebrow">{t(path("eyebrow"))}</EditableText>
        <h2 id="loan-calculator-title"><EditableText id={path("title")} className={`vm-title ${styles.title}`}>{t(path("title"))}</EditableText></h2>
        <EditableText id={path("description")} as="p" className={styles.description}>{t(path("description"))}</EditableText>
      </div>
      <div className={styles.layout}>
        <form className={styles.form} data-reveal noValidate onSubmit={event => event.preventDefault()} onReset={() => { setValues(initial); setFocused(null); }}>
          <div className={styles.fields}>
            {fields.map(({ key, min, max, step, unit }) => <div key={key} className={styles.field}>
              <label htmlFor={`loan-${key}`}><EditableText id={path(`fields.${key}.label`)}>{t(path(`fields.${key}.label`))}</EditableText></label>
              <div className={styles.inputWrap} data-invalid={errors.includes(key)}>
                {(key === "price" || key === "downPayment") && <span data-preview-field-path="common.currencyCode" className={styles.currency}>{unit}</span>}
                <input id={`loan-${key}`} name={key} type={key === "price" || key === "downPayment" ? "text" : "number"} inputMode={key === "months" ? "numeric" : "decimal"} required min={min} max={max} step={step}
                  value={(key === "price" || key === "downPayment") && focused !== key ? groupedAmount(values[key]) : values[key]}
                  onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                  onChange={event => { const next = key === "price" || key === "downPayment" ? event.target.value.replaceAll(",", "") : event.target.value; setValues(current => ({ ...current, [key]: next })); }}
                  aria-invalid={errors.includes(key)} aria-describedby={`loan-${key}-help loan-${key}-error`} />
                {key === "months" ? <EditableText id={path("monthsUnit")} className={styles.unit}>{unit}</EditableText> : key === "annualRate" ? <span className={styles.unit} aria-hidden="true">{unit}</span> : null}
              </div>
              <p id={`loan-${key}-help`} className={styles.helper}><EditableText id={path(`fields.${key}.helper`)}>{t(path(`fields.${key}.helper`))}</EditableText></p>
              <div id={`loan-${key}-error`}><EditableFeedback show={errors.includes(key)} id={path(`errors.${key}`)} as="p" className={styles.error}>{t(path(`errors.${key}`))}</EditableFeedback></div>
            </div>)}
          </div>
          <div className={styles.actions}><button type="reset" className={styles.reset}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/></svg><EditableText id={path("resetLabel")}>{t(path("resetLabel"))}</EditableText></button></div>
          <noscript><p>{t(path("noScript"))}</p></noscript>
        </form>
        <div className={styles.summary} data-reveal>
          <div role="status" aria-live="polite" aria-atomic="true">
            <EditableText id={path("monthlyLabel")} as="p" className={styles.summaryLabel}>{t(path("monthlyLabel"))}</EditableText>
            <output data-preview-static="Calculated monthly loan estimate" aria-label={t(path("monthlyLabel"))} className={styles.monthly} data-loan-result="monthly" htmlFor="loan-price loan-downPayment loan-annualRate loan-months">{money(result?.monthly)}</output>
            <EditableText id={path("paymentNote")} as="p" className={styles.paymentNote}>{t(path("paymentNote"))}</EditableText>
            <dl className={styles.breakdown}>
              {(["principal", "totalInterest", "totalRepayment"] as const).map(key => <div key={key}>
                <dt><EditableText id={path(`${key}Label`)}>{t(path(`${key}Label`))}</EditableText></dt>
                <dd data-preview-static="Calculated loan breakdown amount" data-loan-result={key}>{money(result?.[key])}</dd>
              </div>)}
            </dl>
            <EditableFeedback show={!result} id={path("invalidNote")} as="p" className={styles.invalidNote}>{t(path("invalidNote"))}</EditableFeedback>
          </div>
          <EditableText id={path("disclaimer")} as="p" className={styles.disclaimer}>{t(path("disclaimer"))}</EditableText>
        </div>
      </div>
    </div>
  </EditableSection>;
}
