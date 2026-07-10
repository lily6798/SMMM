import ExcelJS from "exceljs";

const TEXT_EXTENSIONS = [".csv", ".tsv", ".txt"];
const EXCEL_EXTENSIONS = [".xlsx", ".xls"];

// PDF is intentionally unsupported for now — pdf-parse's pdfjs-dist
// dependency dynamically imports a worker script relative to its own
// bundled location, and Turbopack mangles that path no matter how it's
// pointed at the real on-disk file (tried explicit workerSrc + serverExternalPackages).
// Needs either an upstream fix or a non-Turbopack extraction path.
export const SUPPORTED_EXTENSIONS = [...TEXT_EXTENSIONS, ...EXCEL_EXTENSIONS];

function hasExtension(filename: string, extensions: string[]): boolean {
  const lower = filename.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("result" in obj) return cellToString(obj.result);
    if ("text" in obj) return cellToString(obj.text);
    return String(value);
  }
  return String(value);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

async function excelToCsvText(buffer: Buffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const worksheet = workbook.worksheets[0];
  const lines: string[] = [];
  worksheet.eachRow((row) => {
    const values = (row.values as unknown[]).slice(1);
    lines.push(values.map((v) => csvEscape(cellToString(v))).join(","));
  });
  return lines.join("\n");
}

// Extracts text from an uploaded file so it can be fed to the Claude
// extraction step. Returns null for unsupported file types.
export async function extractTextFromFile(
  blob: Blob,
  filename: string,
): Promise<string | null> {
  if (hasExtension(filename, TEXT_EXTENSIONS)) {
    return blob.text();
  }

  if (hasExtension(filename, EXCEL_EXTENSIONS)) {
    const buffer = Buffer.from(await blob.arrayBuffer());
    return excelToCsvText(buffer);
  }

  return null;
}
