import test from "node:test";
import assert from "node:assert/strict";
import { telephoneLink } from "../src/lib/contact.ts";

test("Sri Lankan local and international numbers create telephone links", () => {
  assert.equal(telephoneLink("077 000 0000", "/contact"), "tel:0770000000");
  assert.equal(telephoneLink("+94 77 000 0000", "/contact"), "tel:+94770000000");
  assert.equal(telephoneLink("+94 (0)77 000 0000", "/contact"), "tel:+94770000000");
  assert.equal(telephoneLink("011 000 0000", "/contact"), "tel:0110000000");
});

test("empty, placeholder and invalid numbers use the enquiry link", () => {
  for (const phone of ["", "+94 XX XXX XXXX", "Sri Lankan number to be added", "123", "javascript:12345678"]) {
    assert.equal(telephoneLink(phone, "/contact#contact"), "/contact#contact");
  }
});
