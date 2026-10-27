export type RequestMode = "contact" | "viewing";
export type RequestValues = Record<"name" | "email" | "phone" | "inquiry" | "vehicle" | "message" | "date" | "time", string>;
export type RequestError = "required" | "email" | "phone" | "date" | "pastDate" | "time" | "choice" | "length";
export type RequestErrors = Partial<Record<keyof RequestValues, RequestError>>;

/** A visitor's local calendar day, without UTC conversion near midnight. */
export function localToday(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@<>,;:?#&]+@[^\s@<>,;:?#&]+\.[^\s@<>,;:?#&]+$/.test(value);
}

export function validateRequest(values: RequestValues, mode: RequestMode, vehicles: string[], types: string[], today: string): RequestErrors {
  const errors: RequestErrors = {};
  const required: (keyof RequestValues)[] = mode === "viewing" ? ["name", "email", "phone", "date", "time"] : ["name", "email", "inquiry", "message"];
  for (const field of required) if (!values[field].trim()) errors[field] = "required";
  if (values.name.length > 100 || values.message.length > 1800) errors[values.name.length > 100 ? "name" : "message"] = "length";
  if (values.email.trim() && !validEmail(values.email.trim())) errors.email = "email";
  if (values.phone.trim() && (!/^[+()\d\s.-]+$/.test(values.phone) || !/^\d{7,16}$/.test(values.phone.replace(/\D/g, "")))) errors.phone = "phone";
  if (values.vehicle && !vehicles.includes(values.vehicle)) errors.vehicle = "choice";
  if (mode === "contact" && values.inquiry && !types.includes(values.inquiry)) errors.inquiry = "choice";
  if (mode === "viewing") {
    if (!vehicles.includes(values.vehicle)) errors.vehicle = "choice";
    if (values.date) {
      const parts = values.date.split("-").map(Number);
      const parsed = new Date(`${values.date}T12:00:00`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || !Number.isFinite(parsed.getTime()) || parsed.getFullYear() !== parts[0] || parsed.getMonth() + 1 !== parts[1] || parsed.getDate() !== parts[2]) errors.date = "date";
      else if (values.date < today) errors.date = "pastDate";
    }
    if (values.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time)) errors.time = "time";
  }
  return errors;
}

export function emailDraft(recipient: string, subject: string, body: string) {
  const email = recipient.trim();
  if (!validEmail(email)) return null;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject.replace(/[\r\n]+/g, " "))}&body=${encodeURIComponent(body)}`;
}
