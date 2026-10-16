import { useEffect, useMemo, useState } from "react";

const GRADES = ["1.00", "1.25", "1.50", "1.75", "2.00", "2.25", "2.50", "2.75", "3.00"];
const STORAGE_KEY = "clsu-gwa-subjects-v1";

const emptyForm = { code: "", name: "", grade: "", units: "" };

/** Honor tiers, based on the GWA rounded to 2 decimals. */
function getHonor(gwa) {
  if (gwa === null) return null;
  const g = Math.round(gwa * 100) / 100;
  if (g >= 1.0 && g <= 1.5) return { label: "University Scholar", tone: "purple" };
  if (g >= 1.51 && g <= 1.75) return { label: "College Scholar", tone: "orange" };
  if (g >= 1.76 && g <= 2.0) return { label: "Dean's Lister", tone: "blue" };
  return null;
}

const toneClasses = {
  purple: "bg-purple-500/15 text-purple-300 ring-purple-400/50 shadow-[0_0_40px_-8px_rgba(168,85,247,0.55)]",
  orange: "bg-orange-500/15 text-orange-300 ring-orange-400/50 shadow-[0_0_40px_-8px_rgba(249,115,22,0.55)]",
  blue: "bg-blue-500/15 text-blue-300 ring-blue-400/50 shadow-[0_0_40px_-8px_rgba(59,130,246,0.6)]",
};

function loadSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [subjects, setSubjects] = useState(loadSubjects);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      /* storage unavailable — app still works in memory */
    }
  }, [subjects]);

  const { gwa, totalUnits } = useMemo(() => {
    const units = subjects.reduce((sum, s) => sum + s.units, 0);
    if (units === 0) return { gwa: null, totalUnits: 0 };
    const weighted = subjects.reduce((sum, s) => sum + s.grade * s.units, 0);
    return { gwa: weighted / units, totalUnits: units };
  }, [subjects]);

  const honor = getHonor(gwa);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const units = parseFloat(form.units);
    if (!form.grade) return setError("Choose the grade you obtained.");
    if (!Number.isFinite(units) || units <= 0) return setError("Enter the units, greater than 0.");

    setSubjects((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        code: form.code.trim(),
        name: form.name.trim(),
        grade: parseFloat(form.grade),
        units,
      },
    ]);
    setForm(emptyForm);
    setError("");
  };

  const handleDelete = (id) => setSubjects((list) => list.filter((s) => s.id !== id));

  const handleClear = () => {
    if (subjects.length && window.confirm("Remove all subjects?")) setSubjects([]);
  };

  const inputCls =
    "w-full rounded-lg border border-blue-950 bg-ink-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <header className="mb-8 sm:mb-10">
        <p className="text-sm font-medium text-blue-400">Central Luzon State University</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          GWA Calculator
        </h1>
        <p className="mt-3 max-w-xl text-slate-400">
          Add your subjects, grades, and units to get your General Weighted Average and see which
          academic honor it reaches.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* Result — first on mobile, sticky on the right on desktop */}
        <aside className="order-first lg:order-last lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-2xl border border-blue-900/70 bg-gradient-to-b from-ink-700 to-ink-900 p-6">
            <p className="text-sm text-slate-400">Your GWA</p>
            <p
              className={`tnum mt-1 font-display text-7xl font-extrabold leading-none tracking-tight ${
                gwa === null ? "text-ink-600" : "text-white"
              }`}
              aria-live="polite"
            >
              {gwa === null ? "—.——" : gwa.toFixed(2)}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-blue-950 pt-4 text-sm">
              <div>
                <dt className="text-slate-500">Subjects</dt>
                <dd className="tnum mt-0.5 text-lg font-semibold text-white">{subjects.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total units</dt>
                <dd className="tnum mt-0.5 text-lg font-semibold text-white">{totalUnits}</dd>
              </div>
            </dl>

            <div className="mt-6 min-h-[3.5rem]">
              {gwa === null ? (
                <p className="text-sm text-slate-500">Add a subject to see your result.</p>
              ) : honor ? (
                <div
                  key={honor.label}
                  className={`pop flex items-center justify-center rounded-xl px-4 py-3.5 text-center font-display text-xl font-bold ring-1 ${toneClasses[honor.tone]}`}
                >
                  {honor.label}
                </div>
              ) : (
                <p className="rounded-xl border border-blue-950 px-4 py-3 text-sm text-slate-400">
                  No honor yet. A GWA of 2.00 or lower qualifies for Dean's Lister.
                </p>
              )}
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li className="flex items-center justify-between rounded-lg border border-blue-950 px-4 py-2.5">
              <span className="text-purple-300">University Scholar</span>
              <span className="tnum">1.00 – 1.50</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-blue-950 px-4 py-2.5">
              <span className="text-orange-300">College Scholar</span>
              <span className="tnum">1.51 – 1.75</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-blue-950 px-4 py-2.5">
              <span className="text-blue-300">Dean's Lister</span>
              <span className="tnum">1.76 – 2.00</span>
            </li>
          </ul>
        </aside>

        {/* Form + list */}
        <main className="space-y-6">
          <form
            onSubmit={handleAdd}
            className="rounded-2xl border border-blue-900/70 bg-ink-800/80 p-5 sm:p-6"
            noValidate
          >
            <h2 className="font-display text-xl font-bold text-white">Add a subject</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Subject code</span>
                  <span className="text-slate-600">optional</span>
                </div>
                <input
                  className={inputCls}
                  placeholder="e.g. MATH 101"
                  value={form.code}
                  onChange={update("code")}
                  maxLength={20}
                />
              </label>
              <label className="block">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Subject name</span>
                  <span className="text-slate-600">optional</span>
                </div>
                <input
                  className={inputCls}
                  placeholder="e.g. Calculus I"
                  value={form.name}
                  onChange={update("name")}
                  maxLength={80}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-400">Grade obtained</span>
                <select className={inputCls} value={form.grade} onChange={update("grade")}>
                  <option value="" disabled>
                    Select grade
                  </option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-400">Units</span>
                <input
                  className={inputCls}
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  step="0.5"
                  placeholder="e.g. 3"
                  value={form.units}
                  onChange={update("units")}
                />
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:bg-blue-700 sm:w-auto sm:px-8"
            >
              Add subject
            </button>
          </form>

          <section className="rounded-2xl border border-blue-900/70 bg-ink-800/80 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">Your subjects</h2>
              {subjects.length > 0 && (
                <button
                  onClick={handleClear}
                  className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Clear all
                </button>
              )}
            </div>

            {subjects.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-blue-950 px-4 py-8 text-center text-sm text-slate-500">
                No subjects yet. Fill in the form above to add your first one.
              </p>
            ) : (
              <>
                <div className="mt-4 hidden grid-cols-[1fr_4.5rem_4.5rem_2.5rem] gap-3 px-3 text-sm text-slate-500 sm:grid">
                  <span>Subject</span>
                  <span className="text-right">Grade</span>
                  <span className="text-right">Units</span>
                  <span />
                </div>
                <ul className="mt-2 space-y-2">
                  {subjects.map((s, i) => (
                    <li
                      key={s.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-blue-950 bg-ink-900 px-3 py-3 sm:grid-cols-[1fr_4.5rem_4.5rem_2.5rem]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {s.code || s.name ? s.code || s.name : `Subject ${i + 1}`}
                        </p>
                        {s.code && s.name && (
                          <p className="truncate text-sm text-slate-500">{s.name}</p>
                        )}
                        <p className="tnum mt-1 text-sm text-slate-400 sm:hidden">
                          Grade {s.grade.toFixed(2)} · {s.units} {s.units === 1 ? "unit" : "units"}
                        </p>
                      </div>
                      <span className="tnum hidden text-right font-semibold text-blue-300 sm:block">
                        {s.grade.toFixed(2)}
                      </span>
                      <span className="tnum hidden text-right text-slate-300 sm:block">{s.units}</span>
                      <button
                        onClick={() => handleDelete(s.id)}
                        aria-label={`Delete ${s.code || s.name || `subject ${i + 1}`}`}
                        className="flex h-9 w-9 items-center justify-center justify-self-end rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </main>
      </div>

      <footer className="mt-12 border-t border-blue-950 pt-6 text-sm text-slate-500">
        GWA = sum of (grade × units) ÷ total units. This is an unofficial estimate. Final honors
        depend on CLSU's complete academic requirements, so confirm with your college registrar.
      </footer>
    </div>
  );
}
