"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/media/media-uploader";
import {
  createDraftListing,
  updateListingDetails,
  publishListing,
} from "@/lib/actions/listings";
import { Loader2, Check } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Tigray",
  "SNNPR",
  "Somali",
  "Afar",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
  "Dire Dawa",
  "Sidama",
  "South West Ethiopia",
];

export default function NewListingPage() {
  const t = useTranslations("Sell");
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = (searchParams.get("category") || "cars") as
    | "cars"
    | "trucks"
    | "heavy_machinery"
    | "agricultural";

  const isVehicle = category === "cars" || category === "trucks";

  const [step, setStep] = useState<Step>(1);
  const [listingId, setListingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "Addis Ababa",
    region: "Addis Ababa",
    city: "Addis Ababa",
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    condition: "used",
    bodyType: "",
    color: "",
    seats: "",
    driveType: "",
    // machinery
    equipmentType: "",
    operatingHours: "",
    capacity: "",
    power: "",
    weight: "",
  });

  // Create draft on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await createDraftListing({ category });
        setListingId(res.listingId);
        // Persist draft id in localStorage for recovery
        localStorage.setItem("dalala_draft_listing", res.listingId);
      } catch (e: any) {
        setError(e.message || "Failed to create draft. Please log in as a seller.");
      }
    }
    init();
  }, [category]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveDetails() {
    if (!listingId) return;
    setLoading(true);
    setError("");
    try {
      const res = await updateListingDetails(listingId, {
        ...form,
        price: Number(form.price),
        year: form.year ? Number(form.year) : undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        seats: form.seats ? Number(form.seats) : undefined,
        operatingHours: form.operatingHours
          ? Number(form.operatingHours)
          : undefined,
        category,
      });
      if (res.error) {
        setError("Please check the form fields.");
        return;
      }
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!listingId) return;
    setLoading(true);
    setError("");
    try {
      // Save details one more time
      await updateListingDetails(listingId, {
        ...form,
        price: Number(form.price),
        year: form.year ? Number(form.year) : undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        category,
      });
      const res = await publishListing(listingId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      localStorage.removeItem("dalala_draft_listing");
      setTimeout(() => {
        router.push(`/listings/${res.slug}`);
      }, 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-emerald text-white">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Listing submitted!</h2>
        <p className="mt-2 text-muted-foreground">Redirecting to your listing…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between text-sm">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step >= s
                  ? "bg-brand-emerald text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  step > s ? "bg-brand-emerald" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mb-4 flex justify-between text-xs text-muted-foreground">
        <span>{t("step1")}</span>
        <span>{t("step2")}</span>
        <span>{t("step3")}</span>
        <span>{t("step4")}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1 – Category (already chosen, just confirm) */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Category: {category.replace("_", " ")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              You selected this category. Continue to fill in the details.
            </p>
            <Button onClick={() => setStep(2)} className="w-full">
              {t("continue")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 – Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("step2")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title *</label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Toyota Land Cruiser Prado 2019"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Condition, history, extras…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Price (ETB) *</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="4500000"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">City *</label>
                <Input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Region</label>
              <select
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
              >
                {ETHIOPIAN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle fields */}
            {isVehicle && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Make *</label>
                    <Input
                      value={form.make}
                      onChange={(e) => update("make", e.target.value)}
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Model *</label>
                    <Input
                      value={form.model}
                      onChange={(e) => update("model", e.target.value)}
                      placeholder="Land Cruiser"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Year *</label>
                    <Input
                      type="number"
                      value={form.year}
                      onChange={(e) => update("year", e.target.value)}
                      placeholder="2019"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Mileage (km)</label>
                    <Input
                      type="number"
                      value={form.mileage}
                      onChange={(e) => update("mileage", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Fuel</label>
                    <select
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.fuelType}
                      onChange={(e) => update("fuelType", e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Transmission</label>
                    <select
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.transmission}
                      onChange={(e) => update("transmission", e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Condition</label>
                    <select
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.condition}
                      onChange={(e) => update("condition", e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="certified">Certified</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Drive</label>
                    <select
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={form.driveType}
                      onChange={(e) => update("driveType", e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="2WD">2WD</option>
                      <option value="4WD">4WD</option>
                      <option value="AWD">AWD</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Machinery fields */}
            {!isVehicle && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Equipment type *
                  </label>
                  <Input
                    value={form.equipmentType}
                    onChange={(e) => update("equipmentType", e.target.value)}
                    placeholder="Excavator, Tractor, Bulldozer…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Make *</label>
                    <Input
                      value={form.make}
                      onChange={(e) => update("make", e.target.value)}
                      placeholder="Caterpillar"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Model *</label>
                    <Input
                      value={form.model}
                      onChange={(e) => update("model", e.target.value)}
                      placeholder="320D"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Year</label>
                    <Input
                      type="number"
                      value={form.year}
                      onChange={(e) => update("year", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Operating hours
                    </label>
                    <Input
                      type="number"
                      value={form.operatingHours}
                      onChange={(e) => update("operatingHours", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Power</label>
                    <Input
                      value={form.power}
                      onChange={(e) => update("power", e.target.value)}
                      placeholder="150 HP"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Capacity</label>
                    <Input
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={saveDetails}
                disabled={loading || !form.title || !form.price || !form.make}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("continue")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 – Media */}
      {step === 3 && listingId && (
        <Card>
          <CardHeader>
            <CardTitle>{t("step3")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MediaUploader listingId={listingId} maxFiles={20} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(4)}>
                {t("continue")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 – Review & Publish */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("step4")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Title</dt>
                <dd className="font-medium">{form.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-medium">
                  {Number(form.price).toLocaleString()} ETB
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-medium">
                  {form.city}, {form.region}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {isVehicle ? "Vehicle" : "Equipment"}
                </dt>
                <dd className="font-medium">
                  {form.make} {form.model} {form.year}
                </dd>
              </div>
            </dl>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                className="flex-1"
                variant="gold"
                onClick={handlePublish}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("publish")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
