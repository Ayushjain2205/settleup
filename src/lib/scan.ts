export interface ScannedItem {
  name: string;
  amount: number;
}

export interface ScannedAdjustment {
  label: string;
  amount: number;
}

export interface ScanResult {
  merchant: string;
  total: number;
  /** YYYY-MM-DD, if the model could read one */
  date: string | null;
  items: ScannedItem[];
  adjustments: ScannedAdjustment[];
}

export interface FormLine {
  name: string;
  amount: string;
  splitAmong: string[];
}

/**
 * Map a scan to itemized form lines. Every line defaults to all members —
 * the user retargets each one (A→user1, D→everyone). Adjustments (tax, tip,
 * discounts) become ordinary lines so they stay visible and editable.
 */
export function mapScanToLines(scan: ScanResult, memberIds: string[]): FormLine[] {
  const lines: FormLine[] = [];
  for (const item of scan.items) {
    if (!item.name.trim() || !(item.amount > 0)) continue;
    lines.push({ name: item.name.trim(), amount: String(item.amount), splitAmong: [...memberIds] });
  }
  for (const adj of scan.adjustments) {
    if (!adj.label.trim() || adj.amount === 0 || Number.isNaN(adj.amount)) continue;
    lines.push({ name: adj.label.trim(), amount: String(adj.amount), splitAmong: [...memberIds] });
  }
  return lines;
}

/** Downscale an image to a JPEG blob for upload. Runs in the browser. */
export function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not compress image"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}
