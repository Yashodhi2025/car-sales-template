"use client";

import { previewPath } from "@/lib/preview-path";
import { useState, type ComponentProps } from "react";
import { EditableImage, withBasePath } from "@deneb-ui/ui";

/** Keep the real Deneb image target mounted, including cleared or failed sources. */
export function VanguardImage({ src, fallbackSrc = "/placeholder.svg", onError, loading = "lazy", decoding = "async", ...props }: ComponentProps<typeof EditableImage>) {
  const [failedSource, setFailedSource] = useState<string>();
  const requested = String(src || "").trim();
  return <EditableImage {...props} suppressHydrationWarning data-preview-field-path={previewPath(props["data-preview-field-path"] || props.id || "")} loading={loading} decoding={decoding}
    src={requested && failedSource !== requested ? requested : fallbackSrc} fallbackSrc={fallbackSrc}
    onError={event => {
      if (event.currentTarget.getAttribute("src") !== withBasePath(fallbackSrc)) setFailedSource(requested);
      onError?.(event);
    }} />;
}
