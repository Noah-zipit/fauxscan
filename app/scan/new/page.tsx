"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full bg-panel border border-hairline px-4 py-3.5 text-ink placeholder:text-inkfaint focus:border-stamp outline-none min-h-[52px]";
const labelCls = "micro-label mb-2 block";
const errCls = "font-mono text-xs text-risk mt-2";

export default function NewScan() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return; // duplicate-submission guard
    const fd = new FormData(e.currentTarget);
    const brand = {
      name: String(fd.get("brandName") ?? "").trim(),
      category: String(fd.get("category") ?? "").trim(),
      products: String(fd.get("products") ?? "").trim(),
    };
    const market = {
      country: String(fd.get("country") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      demographic: String(fd.get("demographic") ?? "").trim(),
    };
    const fe: Record<string, string> = {};
    if (!brand.name) fe.brandName = "Brand name is required.";
    if (!brand.category) fe.category = "Category is required.";
    if (!market.country) fe.country = "Target country is required.";
    if (!market.city) fe.city = "Target city is required.";
    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, market }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The scan failed.");
      router.push(`/scan/${data.scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The scan failed.");
      setPending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-14 pb-20">
      <p className="micro-label mb-4">New intake</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">Brief the desk</h1>
      <p className="text-inkdim mb-12 max-w-xl">
        Describe the brand and the market. The desk pulls both taste profiles,
        computes the deltas, and files the dossier. Takes about ten seconds.
      </p>

      <form onSubmit={onSubmit} noValidate>
        <fieldset className="border border-hairline bg-panel p-8 mb-8">
          <legend className="micro-label px-2">The brand</legend>
          <div className="grid gap-6">
            <div>
              <label htmlFor="brandName" className={labelCls}>
                Brand name
              </label>
              <input
                id="brandName"
                name="brandName"
                className={inputCls}
                placeholder="e.g. Velocity Footwear"
                autoComplete="organization"
                aria-invalid={!!fieldErrors.brandName}
              />
              {fieldErrors.brandName && <p className={errCls}>{fieldErrors.brandName}</p>}
            </div>
            <div>
              <label htmlFor="category" className={labelCls}>
                Category
              </label>
              <input
                id="category"
                name="category"
                className={inputCls}
                placeholder="e.g. Sneakers / streetwear"
                aria-invalid={!!fieldErrors.category}
              />
              {fieldErrors.category && <p className={errCls}>{fieldErrors.category}</p>}
            </div>
            <div>
              <label htmlFor="products" className={labelCls}>
                Key products or lines <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="products"
                name="products"
                className={`${inputCls} min-h-[110px]`}
                placeholder="What the brand actually sells: hero products, price tier, drop model, creative codes."
              />
              <p className="font-mono text-xs text-inkfaint mt-2">
                The more specific this is, the sharper the dossier.
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-hairline bg-panel p-8 mb-8">
          <legend className="micro-label px-2">The target market</legend>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className={labelCls}>
                Country
              </label>
              <input
                id="country"
                name="country"
                className={inputCls}
                placeholder="e.g. Japan"
                autoComplete="country-name"
                aria-invalid={!!fieldErrors.country}
              />
              {fieldErrors.country && <p className={errCls}>{fieldErrors.country}</p>}
            </div>
            <div>
              <label htmlFor="city" className={labelCls}>
                City
              </label>
              <input
                id="city"
                name="city"
                className={inputCls}
                placeholder="e.g. Tokyo"
                aria-invalid={!!fieldErrors.city}
              />
              {fieldErrors.city && <p className={errCls}>{fieldErrors.city}</p>}
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="demographic" className={labelCls}>
              Who are you trying to reach? <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="demographic"
              name="demographic"
              className={`${inputCls} min-h-[96px]`}
              placeholder="e.g. Affluent 20-40, family-oriented early adopters"
            />
          </div>
        </fieldset>

        {error && (
          <div className="border border-risk bg-panel p-5 mb-8" role="alert">
            <p className="font-mono text-sm text-risk">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="font-mono text-sm tracking-[0.14em] uppercase bg-ink text-canvas px-8 py-4 hover:bg-stamp disabled:opacity-50 disabled:cursor-wait min-h-[56px] w-full md:w-auto"
        >
          {pending ? "Desk is working…" : "File the dossier"}
        </button>
        <p className="font-mono text-xs text-inkfaint mt-4">
          Prototype engine. Scores are computed from taste-graph affinities and
          published with their evidence.
        </p>
      </form>
    </div>
  );
}
