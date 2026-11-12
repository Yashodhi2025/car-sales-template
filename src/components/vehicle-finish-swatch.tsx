"use client";

import { EditableBox } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import styles from "./vanguard-vehicle.module.css";

/** A colour code is optional; an unconfirmed finish keeps its original placeholder. */
function hexColour(value: string) {
  const code = value.trim().replace(/^#/, "");
  return /^(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(code) ? `#${code}` : undefined;
}

export function VehicleFinishSwatch({ vehicleId, field }: { vehicleId: VehicleId; field: "interiorColor" | "exteriorColor" }) {
  const { t } = useSiteContent();
  const colour = hexColour(t(`vehicles.${vehicleId}.${field}`));
  const label = `finish-${vehicleId}-${field}`;

  // A separate card style target exposes Fivora's Background colour palette/HEX
  // controls, without coupling the swatch background to the colour-name typography.
  return <EditableBox as="span" stylePath={`vehicles.${vehicleId}.${field}Swatch`}
    className={styles.finishPreview} bg={colour} role="img"
    aria-labelledby={`${label}-label ${label}-value`} data-has-colour={colour ? "true" : undefined}>
    <span className={styles.finishUnknown} aria-hidden="true">?</span>
  </EditableBox>;
}
