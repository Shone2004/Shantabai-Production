import { useState, useRef, useCallback } from "react";
import FoodPreviewCard from "./FoodPreviewCard";

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Home Chef", "Tiffin Service", "Bakery", "Event Chef",
  "Cook", "South Indian", "North Indian", "Chinese", "Continental",
];

const INITIAL = {
  name: "", category: "", price: "", description: "",
  prepTime: "", quantity: "", isVeg: true, spicyLevel: 0, status: "available",
};

const SPICY_OPTS = [
  { label: "Mild",      emoji: "🌿", color: "text-green-600",  bg: "bg-green-50",  border: "border-green-400" },
  { label: "Medium",    emoji: "🌶️", color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-400" },
  { label: "Hot",       emoji: "🔥", color: "text-red-600",    bg: "bg-red-50",    border: "border-red-400"   },
  { label: "Extra Hot", emoji: "💥", color: "text-red-900",    bg: "bg-red-100",   border: "border-red-700"   },
];

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form, images) {
  const e = {};
  if (!form.name.trim() || form.name.length < 3)                    e.name        = "Food name is required (min 3 chars)";
  if (!form.category)                                               e.category    = "Please select a category";
  if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price       = "Enter a valid price";
  if (!form.description.trim() || form.description.length < 20)    e.description = "Description required (min 20 chars)";
  if (!form.prepTime || isNaN(form.prepTime) || Number(form.prepTime) <= 0) e.prepTime = "Enter valid prep time in minutes";
  if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 0)  e.quantity = "Enter valid quantity";
  if (images.length === 0)                                          e.images      = "Upload at least one food image";
  return e;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddFood({ onBack }) {
  const [form, setForm]       = useState(INITIAL);
  const [images, setImages]   = useState([]);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (touched[field]) {
      const errs = validate({ ...form, [field]: value }, images);
      setErrors(p => ({ ...p, [field]: errs[field] }));
    }
  };

  const touch = field => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(p => ({ ...p, [field]: validate(form, images)[field] }));
  };

  const processFiles = useCallback((files) => {
    Array.from(files).filter(f => f.type.startsWith("image/")).forEach(file => {
      const r = new FileReader();
      r.onload = e => {
        setImages(prev => {
          const next = [...prev, e.target.result].slice(0, 5);
          if (touched.images) setErrors(p => ({ ...p, images: validate(form, next).images }));
          return next;
        });
      };
      r.readAsDataURL(file);
    });
  }, [form, touched.images]);

  const removeImage = idx => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (touched.images) setErrors(p => ({ ...p, images: validate(form, next).images }));
      return next;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const allTouched = Object.fromEntries([...Object.keys(form), "images"].map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(form, images);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setToast({ type: "success", msg: "🎉 Food item added successfully!" });
    setTimeout(() => setToast(null), 3500);
    setForm(INITIAL); setImages([]); setErrors({}); setTouched({});
  };

  const fld = (field) => ({
    value: form[field] || "",
    onChange: e => set(field, e.target.value),
    onBlur: () => touch(field),
  });

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-800 outline-none transition-all bg-gray-50 focus:bg-white ${
      errors[field] && touched[field]
        ? "border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-semibold text-sm shadow-xl flex items-center gap-2 animate-bounce-once ${toast.type === "success" ? "bg-brand-green text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-green-50 hover:text-brand-green flex items-center justify-center text-gray-600 transition-colors text-sm font-bold">
              ←
            </button>
          )}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-green">Chef Dashboard</p>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Add New Food Item</h1>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Preview Active
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ══ LEFT — FORM ══ */}
            <div className="space-y-5">

              {/* SECTION: Basic Info */}
              <SectionCard icon="📋" title="Basic Information">
                <div className="space-y-4">

                  <Field label="Food Name" required error={errors.name} touched={touched.name}>
                    <input {...fld("name")} className={inputCls("name")} placeholder="e.g. Paneer Butter Masala" />
                  </Field>

                  <Field label="Category" required error={errors.category} touched={touched.category}>
                    <select {...fld("category")} className={inputCls("category") + " cursor-pointer"} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px", appearance: "none" }}>
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>

                  <Field label="Description" required error={errors.description} touched={touched.description}>
                    <textarea
                      {...fld("description")}
                      className={inputCls("description") + " resize-none min-h-[88px] leading-relaxed"}
                      placeholder="Describe your dish – ingredients, taste, what makes it special..."
                      maxLength={300}
                    />
                    <p className="text-right text-[11px] text-gray-400 mt-1">{form.description.length}/300</p>
                  </Field>
                </div>
              </SectionCard>

              {/* SECTION: Pricing & Stock */}
              <SectionCard icon="💰" title="Pricing & Stock">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Price (₹)" required error={errors.price} touched={touched.price}>
                    <input type="number" min="0" {...fld("price")} className={inputCls("price")} placeholder="0" />
                  </Field>
                  <Field label="Quantity Available" required error={errors.quantity} touched={touched.quantity}>
                    <input type="number" min="0" {...fld("quantity")} className={inputCls("quantity")} placeholder="10" />
                  </Field>
                </div>

                <Field label="Preparation Time (minutes)" required error={errors.prepTime} touched={touched.prepTime}>
                  <input type="number" min="1" {...fld("prepTime")} className={inputCls("prepTime") + " max-w-[180px]"} placeholder="30" />
                </Field>

                {/* Availability Status */}
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Availability Status <span className="text-red-400">*</span></p>
                  <div className="flex gap-3">
                    {[["available","✓ Available","bg-green-50 border-brand-green text-brand-green"],["out","✕ Out of Stock","bg-red-50 border-red-400 text-red-600"]].map(([val, label, on]) => (
                      <button key={val} type="button" onClick={() => set("status", val)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-all ${form.status === val ? on : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* SECTION: Food Details */}
              <SectionCard icon="🍽️" title="Food Details">

                {/* Veg / Non-Veg */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-700 mb-2">Food Type <span className="text-red-400">*</span></p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => set("isVeg", true)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${form.isVeg ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-gray-200 text-gray-500"}`}>
                      <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-800 flex-shrink-0" />
                      Vegetarian
                    </button>
                    <button type="button" onClick={() => set("isVeg", false)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${!form.isVeg ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-200 text-gray-500"}`}>
                      <span className="w-3 h-3 rounded-sm bg-red-500 border-2 border-red-800 flex-shrink-0" />
                      Non-Vegetarian
                    </button>
                  </div>
                </div>

                {/* Spicy Level */}
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">Spicy Level</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SPICY_OPTS.map((opt, i) => (
                      <button key={i} type="button" onClick={() => set("spicyLevel", i)}
                        className={`py-2.5 text-xs font-bold rounded-xl border-2 flex items-center justify-center gap-1.5 transition-all ${form.spicyLevel === i ? `${opt.bg} ${opt.border} ${opt.color}` : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* SECTION: Images */}
              <SectionCard icon="📷" title="Food Images">
                <p className="text-xs text-gray-500 mb-3">Upload up to 5 photos. First image will be the main display photo.</p>

                {/* Drop Zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); touch("images"); }}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragOver ? "border-brand-green bg-green-50" :
                    errors.images && touched.images ? "border-red-300 bg-red-50" :
                    "border-gray-200 hover:border-brand-green hover:bg-green-50/50"
                  }`}
                >
                  <p className="text-3xl mb-2">📸</p>
                  <p className="font-bold text-gray-700 text-sm">{dragOver ? "Drop images here!" : "Click or drag images here"}</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Max 5 images</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => { processFiles(e.target.files); touch("images"); e.target.value = ""; }} />
                </div>
                {errors.images && touched.images && <ErrMsg msg={errors.images} />}

                {/* Thumbnails */}
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {images.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-brand-green/90 text-white text-[9px] font-bold text-center py-0.5">MAIN</div>}
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ✕
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-green flex items-center justify-center text-gray-400 hover:text-brand-green text-xl transition-colors">
                        +
                      </button>
                    )}
                  </div>
                )}
              </SectionCard>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pb-8">
                <button type="button" onClick={() => { setForm(INITIAL); setImages([]); setErrors({}); setTouched({}); }}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  Reset Form
                </button>
                <button type="submit" disabled={loading}
                  className="px-8 py-3 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-green-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 min-w-[170px] justify-center shadow-sm hover:shadow-md">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding Item...</>
                  ) : "＋ Add Food Item"}
                </button>
              </div>
            </div>

            {/* ══ RIGHT — LIVE PREVIEW ══ */}
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-green mb-0.5">👁️ Live Preview</p>
                  <p className="text-xs text-gray-500">How customers will see your dish</p>
                </div>
                <div className="flex justify-center">
                  <FoodPreviewCard food={{ ...form, images }} />
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-brand-green border-b border-gray-100 pb-3 mb-5">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, required, error, touched, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && touched && <ErrMsg msg={error} />}
    </div>
  );
}

function ErrMsg({ msg }) {
  return <p className="text-xs text-red-500 mt-1 font-medium">⚠ {msg}</p>;
}