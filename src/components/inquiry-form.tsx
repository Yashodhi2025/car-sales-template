"use client";
import { previewField } from "@/lib/preview-path";
import { EditableLink, EditableText, EditableFeedback } from "./vanguard-editable";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { emailDraft, localToday, validateRequest, type RequestErrors, type RequestMode, type RequestValues } from "@/lib/inquiries";
import { Arrow } from "./vanguard-arrow";

/** Template-specific request flow. No API, storage or claimed delivery. */
export function InquiryForm({ mode, vehicleId = "", onVehicleChange, inquiryType = "" }: { mode: RequestMode; vehicleId?: string; onVehicleChange?: (id: string) => void; inquiryType?: string }) {
  const { content, t } = useSiteContent();
  const form = useRef<HTMLFormElement>(null);
  const draftLink = useRef<HTMLAnchorElement>(null);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [recipientError, setRecipientError] = useState(false);
  const [draft, setDraft] = useState<{ href: string; body: string } | null>(null);
  const ids = Object.keys(content.cards.vehicles) as VehicleId[];
  const types = content.requests.types;
  const viewing = mode === "viewing";
  const prefix = `vm-${mode}`;
  useEffect(() => { setReady(true); setToday(localToday()); }, []);

  function readValues(): RequestValues {
    const values = new FormData(form.current!);
    const get = (key: string) => String(values.get(key) || "").trim();
    return { name: get("name"), email: get("email"), phone: get("phone"), inquiry: get("inquiry"), vehicle: viewing ? vehicleId : get("vehicle"), message: get("message"), date: get("date"), time: get("time") };
  }
  function validate(values: RequestValues) { return validateRequest(values, mode, ids, types.map(type => type.key), localToday()); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readValues();
    const nextErrors = validate(values);
    setAttempted(true); setErrors(nextErrors); setDraft(null); setRecipientError(false); setToday(localToday());
    if (Object.keys(nextErrors).length) {
      const first = form.current?.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`);
      first?.focus(); return;
    }
    const car = content.cards.vehicles[values.vehicle as VehicleId];
    const vehicle = car ? `${car.name} · ${car.meta} · ${car.details}` : t("requests.noVehicle");
    const rows = [
      `${t("requests.fields.name.label")}: ${values.name}`,
      `${t("requests.fields.email.label")}: ${values.email}`,
      `${t("requests.fields.phone.label")}: ${values.phone || "—"}`,
      ...(!viewing ? [`${t("requests.fields.inquiry.label")}: ${types.find(type => type.key === values.inquiry)?.label || ""}`] : []),
      `${t("requests.fields.vehicle.label")}: ${vehicle}`,
      ...(viewing ? [`${t("requests.fields.date.label")}: ${values.date}`, `${t("requests.fields.time.label")}: ${values.time}`, t("requests.fields.time.helper")] : []),
      "", `${t("requests.fields.message.label")}:`, values.message || "—", "", t("requests.emailNote"),
    ];
    const body = rows.join("\r\n");
    const subject = `${t(viewing ? "requests.viewingSubject" : "requests.contactSubject")}${car ? ` — ${car.name}` : ""}`;
    const href = emailDraft(t("common.business.email"), subject, body);
    if (!href) { setRecipientError(true); return; }
    setDraft({ href, body });
    // Use an actual mailto navigation. The visitor still has to send the email.
    if (draftLink.current) { draftLink.current.href = href; draftLink.current.click(); }
  }

  function field(key: keyof RequestValues, control: ReactNode, required = false, helper = false) {
    const errorKeys = key === "email" ? ["required", "email"] : key === "phone" ? ["required", "phone"] : key === "date" ? ["required", "date", "pastDate"] : key === "time" ? ["required", "time"] : key === "inquiry" || key === "vehicle" ? ["required", "choice"] : ["required", "length"];
    return <div className={`vm-request-field ${key === "message" ? "vm-request-wide" : ""}`} key={key}>
      <label htmlFor={`${prefix}-${key}`}><EditableText id={viewing && key === "message" ? "viewing.messageLabel" : `requests.fields.${key}.label`}>{t(viewing && key === "message" ? "viewing.messageLabel" : `requests.fields.${key}.label`)}</EditableText>{required && <span aria-hidden="true"> *</span>}</label>
      {control}
      {helper && <p id={`${prefix}-${key}-help`} className="vm-field-helper"><EditableText id={`requests.fields.${key}.helper`}>{t(`requests.fields.${key}.helper`)}</EditableText></p>}
      <div id={`${prefix}-${key}-error`}>{errorKeys.map(error => <EditableFeedback key={error} id={`requests.errors.${error}`} as="p" className="vm-field-error" show={errors[key] === error}>{t(`requests.errors.${error}`)}</EditableFeedback>)}</div>
    </div>;
  }
  function attributes(key: keyof RequestValues, required = false) {
    return { id: `${prefix}-${key}`, name: key, required, "aria-invalid": !!errors[key], "aria-describedby": `${prefix}-${key}-error`, onBlur: () => { if (attempted) setErrors(validate(readValues())); } };
  }
  return <form ref={form} className={`vm-request-form vm-${mode}-form`} aria-labelledby={viewing ? "viewing-title" : undefined} noValidate action={`mailto:${t("common.business.email")}`} method="post" encType="text/plain" onSubmit={submit} onChange={() => { setDraft(null); setRecipientError(false); if (attempted) setErrors(validate(readValues())); }}>
    <EditableText id={viewing ? "viewing.requiredNote" : "requests.requiredNote"} as="p" className="vm-form-intro">{t(viewing ? "viewing.requiredNote" : "requests.requiredNote")}</EditableText>
    <div role="alert"><EditableFeedback show={!!Object.keys(errors).length} id="requests.errorTitle" as="p" className="vm-form-error-summary">{t("requests.errorTitle")}</EditableFeedback></div>
    <fieldset disabled={!ready} className="vm-request-fields">
      {field("name", <input {...attributes("name", true)} autoComplete="name" maxLength={100} placeholder={t("requests.fields.name.placeholder")} {...previewField("requests.fields.name.placeholder")} />, true)}
      {field("email", <input {...attributes("email", true)} type="email" autoComplete="email" maxLength={254} placeholder={t("requests.fields.email.placeholder")} {...previewField("requests.fields.email.placeholder")} />, true)}
      {field("phone", <input {...attributes("phone", viewing)} type="tel" autoComplete="tel" maxLength={40} placeholder={t("requests.fields.phone.placeholder")} {...previewField("requests.fields.phone.placeholder")} />, viewing)}
      {!viewing && field("inquiry", <select key={inquiryType} data-preview-list-path="requests.types" {...attributes("inquiry", true)} defaultValue={inquiryType}><option value="" data-preview-field-path="requests.fields.inquiry.placeholder">{t("requests.fields.inquiry.placeholder")}</option>{types.map((type,index) => <option value={type.key} key={index} data-preview-item-path={`requests.types[${index}]`} data-preview-field-path={`requests.types[${index}].label`}>{type.label}</option>)}</select>, true)}
      {!viewing && field("vehicle", <select {...attributes("vehicle")} value={vehicleId} onChange={event => onVehicleChange?.(event.target.value)}><option value="" data-preview-field-path="requests.fields.vehicle.placeholder">{t("requests.fields.vehicle.placeholder")}</option>{ids.map(id => <option key={id} value={id} {...previewField(`cards.vehicles.${id}.name`)}>{content.cards.vehicles[id].name} · {content.cards.vehicles[id].meta}</option>)}</select>)}
      {viewing && field("date", <input {...attributes("date", true)} type="date" min={today} aria-describedby={`${prefix}-date-error ${prefix}-date-help`} />, true, true)}
      {viewing && field("time", <input {...attributes("time", true)} type="time" aria-describedby={`${prefix}-time-error ${prefix}-time-help`} />, true, true)}
      {field("message", <textarea {...attributes("message", !viewing)} rows={4} maxLength={1800} placeholder={t(viewing ? "viewing.messagePlaceholder" : "requests.fields.message.placeholder")} {...previewField(viewing ? "viewing.messagePlaceholder" : "requests.fields.message.placeholder")} />, !viewing)}
    </fieldset>
    {viewing && <EditableFeedback id="requests.errors.choice" as="p" className="vm-field-error" show={errors.vehicle === "choice"}>{t("requests.errors.choice")}</EditableFeedback>}
    <EditableFeedback id="requests.errors.recipient" as="p" className="vm-field-error" show={recipientError}>{t("requests.errors.recipient")}</EditableFeedback>
    <div className={viewing ? "vm-request-footer" : undefined}><EditableText id={viewing ? "viewing.emailNote" : "requests.emailNote"} as="p" className="vm-form-notice">{t(viewing ? "viewing.emailNote" : "requests.emailNote")}</EditableText><button type="submit" disabled={!ready} className="vm-button vm-button-primary vm-draft-submit">{viewing && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-4-7-7-4 18-7Z"/><path d="m10 14 11-11"/></svg>}<EditableText id={viewing ? "viewing.submitLabel" : "requests.submitLabel"}>{t(viewing ? "viewing.submitLabel" : "requests.submitLabel")}</EditableText>{!viewing && <Arrow />}</button></div>
    <div className={draft ? "vm-draft-status" : "vm-draft-pending"}>
      <div role="status"><EditableFeedback show={!!draft} id="requests.draftTitle" as="h3">{t("requests.draftTitle")}</EditableFeedback><EditableFeedback show={!!draft} id="requests.draftNote" as="p">{t("requests.draftNote")}</EditableFeedback></div>
      <a ref={draftLink} className="vm-text-link vm-email-draft" href={draft?.href}><EditableFeedback show={!!draft} id="requests.reopenLabel">{t("requests.reopenLabel")}</EditableFeedback>{draft && <Arrow />}</a>
      <details><summary><EditableFeedback show={!!draft} id="requests.previewLabel">{t("requests.previewLabel")}</EditableFeedback></summary><textarea aria-label={t("requests.draftTextLabel")} rows={10} readOnly value={draft?.body || ""} {...previewField("requests.draftTextLabel")} /></details>
    </div>
    <noscript><p className="vm-form-notice">{t("requests.noScript")} <EditableLink href={`mailto:${t("common.business.email")}`}>{t("common.business.email")}</EditableLink></p></noscript>
  </form>;
}
