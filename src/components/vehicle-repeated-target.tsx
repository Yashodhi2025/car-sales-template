"use client";

import { cloneElement, type ReactElement } from "react";
import type { VehicleId } from "@/lib/site-content";

function Target({ child, ...props }: { child: ReactElement; [key: string]: unknown }) {
  return cloneElement(child as ReactElement<Record<string, unknown>>, { ...props, suppressHydrationWarning: true });
}

type Kind = "galleryItem" | "galleryImage" | "galleryCaption" | "featureItem" | "featureName";

/** Exact source mappings keep each stable vehicle route and newly added list items editable. */
export function VehicleRepeatedTarget({ vehicleId, index, kind, children }: { vehicleId: VehicleId; index: number; kind: Kind; children: ReactElement }) {
  const targets = {
    "porsche-panamera": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.porsche-panamera.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.porsche-panamera.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.porsche-panamera.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.porsche-panamera.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.porsche-panamera.features[${index}].name`} />,
    },
    "bmw-m5": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.bmw-m5.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.bmw-m5.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.bmw-m5.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.bmw-m5.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.bmw-m5.features[${index}].name`} />,
    },
    "mercedes-amg": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.mercedes-amg.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.mercedes-amg.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.mercedes-amg.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.mercedes-amg.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.mercedes-amg.features[${index}].name`} />,
    },
    "audi-rs6": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.audi-rs6.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.audi-rs6.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.audi-rs6.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.audi-rs6.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.audi-rs6.features[${index}].name`} />,
    },
    "tesla-model-3": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.tesla-model-3.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.tesla-model-3.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.tesla-model-3.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.tesla-model-3.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.tesla-model-3.features[${index}].name`} />,
    },
    "honda-crv": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.honda-crv.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.honda-crv.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.honda-crv.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.honda-crv.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.honda-crv.features[${index}].name`} />,
    },
    "chevrolet-camaro": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.chevrolet-camaro.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.chevrolet-camaro.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.chevrolet-camaro.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.chevrolet-camaro.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.chevrolet-camaro.features[${index}].name`} />,
    },
    "ferrari-458": {
      galleryItem: <Target child={children} data-preview-item-path={`photos.vehicles.ferrari-458.gallery[${index}]`} />,
      galleryImage: <Target child={children} data-preview-field-path={`photos.vehicles.ferrari-458.gallery[${index}].image`} />,
      galleryCaption: <Target child={children} data-preview-field-path={`photos.vehicles.ferrari-458.gallery[${index}].caption`} />,
      featureItem: <Target child={children} data-preview-item-path={`vehicles.ferrari-458.features[${index}]`} />,
      featureName: <Target child={children} data-preview-field-path={`vehicles.ferrari-458.features[${index}].name`} />,
    },
  };
  return targets[vehicleId][kind];
}
