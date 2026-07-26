"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface NameStepProps {
  value: string;
  onChange: (name: string) => void;
  onNext: () => void;
}

export default function NameStep({ value, onChange, onNext }: NameStepProps) {
  const [name, setName] = useState(value);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    onChange(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onNext();
    }
  }

  const isValid = name.trim().length >= 2;

  return (
    <section className="mx-6 mt-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-zinc-900 text-center">Cum te cheamă?</h2>
      <p className="text-sm text-zinc-400 mt-1 text-center">Vom folosi numele tău pentru a personaliza experiența</p>

      <form onSubmit={handleSubmit} className="mt-10 w-full flex flex-col items-center">
        <div className="w-full max-w-xs flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <User className="h-10 w-10 text-emerald-600" />
          </div>

          <input
            type="text"
            value={name}
            onChange={handleInputChange}
            placeholder="Numele tău"
            maxLength={40}
            autoFocus
            className="w-full rounded-2xl border border-white/70 bg-white/20 backdrop-blur-xl px-5 py-4 text-center text-xl font-semibold text-zinc-900 outline-none transition-all focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/10 placeholder:text-zinc-300"
          />
        </div>

        <div className="flex-1 min-h-8" />

        <button
          type="submit"
          disabled={!isValid}
          className="mb-8 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:shadow-none"
        >
          Continuă
        </button>
      </form>
    </section>
  );
}