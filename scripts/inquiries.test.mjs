import test from "node:test";
import assert from "node:assert/strict";
import { emailDraft, localToday, validateRequest } from "../src/lib/inquiries.ts";

const valid = { name: "Alex Driver", email: "alex+cars@example.com", phone: "+44 (0)20 7946 0000", inquiry: "vehicle", vehicle: "bmw-m5", message: "Please confirm the service history & condition.", date: "2026-11-02", time: "10:30" };
const validate = (values, mode = "contact", today = "2026-10-27") => validateRequest(values, mode, ["bmw-m5"], ["general", "vehicle", "viewing"], today);
test("contact required fields, optional phone/vehicle and invalid choices", () => {
  assert.deepEqual(validate(valid), {});
  assert.deepEqual(validate({ ...valid, phone: "", vehicle: "" }), {});
  assert.deepEqual(Object.keys(validate({ ...valid, name: " ", email: "", inquiry: "", message: "" })), ["name", "email", "inquiry", "message"]);
  assert.equal(validate({ ...valid, vehicle: "unknown" }).vehicle, "choice");
  assert.equal(validate({ ...valid, inquiry: "injected" }).inquiry, "choice");
});
test("invalid email, phone and overlong content are rejected", () => {
  assert.equal(validate({ ...valid, email: "not-an-email" }).email, "email");
  assert.equal(validate({ ...valid, phone: "call me" }).phone, "phone");
  assert.equal(validate({ ...valid, message: "x".repeat(1801) }).message, "length");
});
test("viewing requires contact/date/time and rejects past or impossible dates", () => {
  assert.deepEqual(validate({ ...valid, message: "" }, "viewing"), {});
  assert.equal(validate({ ...valid, phone: "" }, "viewing").phone, "required");
  assert.equal(validate({ ...valid, date: "2026-10-26" }, "viewing").date, "pastDate");
  assert.equal(validate({ ...valid, date: "2026-02-30" }, "viewing").date, "date");
  assert.equal(validate({ ...valid, date: "2026-10-27" }, "viewing").date, undefined);
  assert.equal(validate({ ...valid, time: "25:00" }, "viewing").time, "time");
  assert.equal(validate({ ...valid, time: "" }, "viewing").time, "required");
});
test("local calendar dates preserve local year, month and day", () => {
  assert.equal(localToday(new Date(2026, 9, 27, 0, 5)), "2026-10-27");
});
test("email drafts safely encode visitor text and never introduce extra headers", () => {
  const body = "Name: Zoë & Alex\r\nMessage: #1 car? 100% yes + thanks";
  const href = emailDraft("hello@vanguardmotors.example", "Viewing\r\nBcc: nobody", body);
  const url = new URL(href);
  assert.equal(url.protocol, "mailto:");
  assert.equal(decodeURIComponent(url.pathname), "hello@vanguardmotors.example");
  assert.equal(url.searchParams.get("body"), body);
  assert.equal(url.searchParams.get("subject"), "Viewing Bcc: nobody");
  assert.equal(url.searchParams.size, 2);
  assert.equal(emailDraft("hello@example.com?bcc=someone@example.com", "Request", body), null);
  assert.equal(emailDraft("", "Request", body), null);
});
