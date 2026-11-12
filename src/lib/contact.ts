/** Keep unconfigured demonstration numbers away from the phone dialler. */
export function telephoneLink(value: string, fallback: string) {
  const phone = value.trim().replace("(0)", "");
  const digits = phone.replace(/\D/g, "");
  return /^\+?[\d\s().-]+$/.test(phone) && /^\d{7,16}$/.test(digits)
    ? `tel:${phone.startsWith("+") ? "+" : ""}${digits}`
    : fallback;
}
