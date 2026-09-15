"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, House, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

type PriceKey =
  | "standardProject"
  | "standardMonthly"
  | "silverProject"
  | "silverMonthly"
  | "goldProject"
  | "goldMonthly";

type PriceValues = Record<PriceKey, string>;

const emptyValues: PriceValues = {
  standardProject: "",
  standardMonthly: "",
  silverProject: "",
  silverMonthly: "",
  goldProject: "",
  goldMonthly: "",
};

const packages: Array<{
  name: string;
  eyebrow: string;
  projectKey: PriceKey;
  monthlyKey: PriceKey;
  accent: string;
}> = [
  {
    name: "Standard",
    eyebrow: "Essential protection",
    projectKey: "standardProject",
    monthlyKey: "standardMonthly",
    accent: "#334155",
  },
  {
    name: "Silver",
    eyebrow: "Enhanced GAF coverage",
    projectKey: "silverProject",
    monthlyKey: "silverMonthly",
    accent: "#94a3b8",
  },
  {
    name: "Gold",
    eyebrow: "Maximum workmanship coverage",
    projectKey: "goldProject",
    monthlyKey: "goldMonthly",
    accent: "#d7a92f",
  },
];

const placements: Array<{ key: PriceKey; x: number; y: number }> = [
  { key: "standardProject", x: 169, y: 106.1 },
  { key: "standardMonthly", x: 169, y: 79.1 },
  { key: "silverProject", x: 425, y: 106.1 },
  { key: "silverMonthly", x: 425, y: 79.1 },
  { key: "goldProject", x: 681, y: 106.1 },
  { key: "goldMonthly", x: 681, y: 79.1 },
];

const previewPlacements: Array<{ key: PriceKey; left: string; top: string }> = [
  { key: "standardProject", left: "21.34%", top: "81.24%" },
  { key: "standardMonthly", left: "21.34%", top: "85.65%" },
  { key: "silverProject", left: "53.66%", top: "81.24%" },
  { key: "silverMonthly", left: "53.66%", top: "85.65%" },
  { key: "goldProject", left: "85.98%", top: "81.24%" },
  { key: "goldMonthly", left: "85.98%", top: "85.65%" },
];

function numericValue(value: string) {
  if (!value.trim()) return null;
  const normalized = value.replace(/,/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 && number <= 9_999_999.99
    ? number
    : null;
}

function formatValue(value: string) {
  const number = numericValue(value);
  if (number === null) return "";
  const hasCents = value.includes(".");
  return number.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function safeInput(value: string) {
  const cleaned = value.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const [whole = "", ...decimalParts] = cleaned.split(".");
  const decimal = decimalParts.join("").slice(0, 2);
  return decimalParts.length ? `${whole}.${decimal}` : whole;
}

export default function Home() {
  const [values, setValues] = useState<PriceValues>(emptyValues);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const modelContext = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: {
              name: string;
              title: string;
              description: string;
              inputSchema: object;
              annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
              execute: (input: unknown) => Promise<object>;
            },
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;

    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();

    void Promise.resolve(
      modelContext.registerTool(
        {
          name: "set_roofing_package_prices",
          title: "Set roofing package prices",
          description:
            "Fill all six Velocity Roofing project-price and monthly-payment fields in the visible PDF pricer.",
          inputSchema: {
            type: "object",
            properties: {
              standardProject: { type: "number", minimum: 0, maximum: 9999999.99 },
              standardMonthly: { type: "number", minimum: 0, maximum: 9999999.99 },
              silverProject: { type: "number", minimum: 0, maximum: 9999999.99 },
              silverMonthly: { type: "number", minimum: 0, maximum: 9999999.99 },
              goldProject: { type: "number", minimum: 0, maximum: 9999999.99 },
              goldMonthly: { type: "number", minimum: 0, maximum: 9999999.99 },
            },
            required: [
              "standardProject",
              "standardMonthly",
              "silverProject",
              "silverMonthly",
              "goldProject",
              "goldMonthly",
            ],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!input || typeof input !== "object") {
              throw new Error("All six prices are required.");
            }
            const record = input as Record<string, unknown>;
            const nextValues = {} as PriceValues;
            for (const key of Object.keys(emptyValues) as PriceKey[]) {
              const amount = record[key];
              if (
                typeof amount !== "number" ||
                !Number.isFinite(amount) ||
                amount < 0 ||
                amount > 9_999_999.99
              ) {
                throw new Error(`Invalid amount for ${key}.`);
              }
              nextValues[key] = amount.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              });
            }
            setValues(nextValues);
            return { status: "ready", fieldsCompleted: 6 };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, []);

  const allComplete = useMemo(
    () => Object.values(values).every((value) => numericValue(value) !== null),
    [values],
  );

  const completedCount = Object.values(values).filter(
    (value) => numericValue(value) !== null,
  ).length;

  function updateValue(key: PriceKey, value: string) {
    setValues((current) => ({ ...current, [key]: safeInput(value) }));
  }

  function formatInput(key: PriceKey) {
    setValues((current) => ({
      ...current,
      [key]: formatValue(current[key]) || current[key],
    }));
  }

  function clearAll() {
    setValues(emptyValues);
    toast("All pricing fields cleared");
  }

  async function downloadPdf() {
    if (!allComplete) {
      toast.error("Enter all six prices before downloading");
      return;
    }

    setIsGenerating(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const templateResponse = await fetch(
        `${import.meta.env.BASE_URL}velocity-roofing-package-options.pdf`,
      );
      if (!templateResponse.ok) throw new Error("Template could not be loaded");

      const templateBytes = await templateResponse.arrayBuffer();
      const pdfDocument = await PDFDocument.load(templateBytes);
      const page = pdfDocument.getPages()[0];
      const font = await pdfDocument.embedFont(StandardFonts.HelveticaBold);
      const fieldBackground = rgb(243 / 255, 246 / 255, 250 / 255);
      const fieldText = rgb(29 / 255, 41 / 255, 57 / 255);

      for (const placement of placements) {
        const amount = formatValue(values[placement.key]);
        const fontSize = amount.length > 11 ? 8 : amount.length > 9 ? 8.8 : 9.5;
        page.drawRectangle({
          x: placement.x - 1.5,
          y: placement.y - 2.3,
          width: 71.5,
          height: 14.5,
          color: fieldBackground,
        });
        page.drawText(amount, {
          x: placement.x,
          y: placement.y,
          size: fontSize,
          font,
          color: fieldText,
        });
      }

      pdfDocument.setTitle("Velocity Roofing Package Options");
      pdfDocument.setSubject("Completed roofing package pricing");
      const completedPdf = await pdfDocument.save();
      const blob = new Blob([completedPdf as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Velocity-Roofing-Package-Options-Completed.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Completed PDF downloaded");
    } catch (error) {
      console.error(error);
      toast.error("The PDF could not be created. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-white/10 bg-[#101827] text-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#f47c0b] shadow-[0_8px_24px_rgba(244,124,11,.28)]">
              <House aria-hidden="true" className="size-5" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-[0.74rem] font-extrabold tracking-[0.2em] text-[#ff8b18]">
                VELOCITY ROOFING
              </p>
              <p className="text-sm font-medium text-slate-300">PDF Pricer</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
            <CheckCircle2 aria-hidden="true" className="size-4 text-[#ff8b18]" />
            Pricing stays in your browser
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-7 px-5 py-7 sm:px-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-10 lg:py-10">
        <section aria-labelledby="pricing-title" className="min-w-0">
          <div className="mb-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.13em] text-[#d96700]">
              Package pricing
            </p>
            <h1 id="pricing-title" className="text-3xl font-extrabold tracking-tight text-[#101827] sm:text-[2.15rem]">
              Complete the proposal
            </h1>
            <p className="mt-2 max-w-md text-base leading-7 text-slate-600">
              Enter the project price and monthly payment for each package. Your PDF is generated on this device.
            </p>
          </div>

          <div className="space-y-3.5">
            {packages.map((packageOption, index) => (
              <fieldset
                key={packageOption.name}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_34px_rgba(15,23,42,.05)]"
              >
                <legend className="sr-only">{packageOption.name} package pricing</legend>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-lg text-sm font-black text-white"
                    style={{ backgroundColor: packageOption.accent }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-extrabold text-[#101827]">{packageOption.name}</h2>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {packageOption.eyebrow}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <PriceInput
                    id={packageOption.projectKey}
                    label="Project price"
                    value={values[packageOption.projectKey]}
                    onChange={(value) => updateValue(packageOption.projectKey, value)}
                    onBlur={() => formatInput(packageOption.projectKey)}
                  />
                  <PriceInput
                    id={packageOption.monthlyKey}
                    label="Monthly payment"
                    value={values[packageOption.monthlyKey]}
                    onChange={(value) => updateValue(packageOption.monthlyKey, value)}
                    onBlur={() => formatInput(packageOption.monthlyKey)}
                  />
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_34px_rgba(15,23,42,.05)]">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-slate-600">
                {completedCount} of 6 fields complete
              </span>
              <span className="text-sm font-bold text-[#d96700]">
                {Math.round((completedCount / 6) * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#f47c0b] transition-[width] duration-300"
                style={{ width: `${(completedCount / 6) * 100}%` }}
              />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={downloadPdf}
                disabled={!allComplete || isGenerating}
                className="h-12 flex-1 rounded-xl bg-[#f47c0b] text-base font-bold text-white shadow-[0_8px_22px_rgba(244,124,11,.25)] hover:bg-[#de6f05] disabled:shadow-none"
              >
                <Download aria-hidden="true" className="size-4.5" />
                {isGenerating ? "Creating PDF..." : "Download completed PDF"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearAll}
                disabled={completedCount === 0}
                className="h-12 rounded-xl border-slate-200 px-4 font-bold text-slate-700"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Clear
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="preview-title" className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,.1)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText aria-hidden="true" className="size-4.5" />
                </span>
                <div>
                  <h2 id="preview-title" className="font-extrabold text-[#101827]">PDF preview</h2>
                  <p className="text-sm text-slate-500">Pricing updates as you type</p>
                </div>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#c95d00]">
                1 page
              </span>
            </div>

            <div className="bg-[#e9edf2] p-3 sm:p-6 lg:p-8">
              <div className="pdf-preview relative mx-auto w-full max-w-[980px] overflow-hidden rounded-md bg-white shadow-[0_16px_45px_rgba(15,23,42,.18)]">
                <img
                  src={`${import.meta.env.BASE_URL}velocity-roofing-package-options-preview.png`}
                  alt="Velocity Roofing package options PDF preview"
                  className="block h-auto w-full"
                />
                {previewPlacements.map((placement) => {
                  const value = formatValue(values[placement.key]);
                  return value ? (
                    <span
                      key={placement.key}
                      className="pdf-value absolute bg-[#f3f6fa] font-bold leading-none text-[#1d2939]"
                      style={{ left: placement.left, top: placement.top }}
                    >
                      {value}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Toaster position="bottom-right" richColors />
    </main>
  );
}

function PriceInput({
  id,
  label,
  value,
  onChange,
  onBlur,
}: {
  id: PriceKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const invalid = Boolean(value) && numericValue(value) === null;

  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-sm font-bold text-slate-600">
        {label}
      </Label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-bold text-slate-500">
          $
        </span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={label === "Project price" ? "12,500" : "249"}
          value={value}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-7 text-base font-bold text-[#101827] shadow-none focus-visible:border-[#f47c0b] focus-visible:ring-[#f47c0b]/20"
        />
      </div>
      {invalid ? (
        <p id={`${id}-error`} className="text-xs font-semibold text-red-600">
          Enter an amount under $10,000,000.
        </p>
      ) : null}
    </div>
  );
}
