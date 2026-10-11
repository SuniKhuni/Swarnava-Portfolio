"use client";

import { useId, useState } from "react";
import { Icon } from "./Icon";

type FieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "chips";
  options?: string[];
  required?: boolean;
  error?: string;
  maxLength?: number;
  minLength?: number;
  defaultValue?: string;
  autoComplete?: string;
  readOnly?: boolean;
  inputRef?: React.Ref<HTMLInputElement & HTMLTextAreaElement>;
};

/** Letter-style form control: label above, a ruled line below, no box (§7.3). */
export function Field({
  name,
  label,
  type = "text",
  options = [],
  required,
  error,
  maxLength,
  minLength,
  defaultValue = "",
  autoComplete,
  readOnly,
  inputRef,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const counterId = `${id}-count`;
  const [length, setLength] = useState(defaultValue.length);
  const showCounter = maxLength !== undefined && length >= maxLength * 0.9;
  const describedBy = [error ? errorId : null, showCounter ? counterId : null].filter(Boolean).join(" ") || undefined;

  if (type === "chips") {
    return (
      <fieldset className="field field--chips" data-invalid={error ? true : undefined}>
        <legend className="field__label">{label}</legend>
        <div className="field__chips" role="radiogroup" aria-label={label}>
          {options.map((opt) => (
            <label key={opt} className="field__chip">
              <input type="radio" name={name} value={opt} defaultChecked={opt === (defaultValue || options.at(-1))} disabled={readOnly} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  const common = {
    id,
    name,
    required,
    maxLength,
    minLength,
    defaultValue,
    autoComplete,
    readOnly,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": required || undefined,
    onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => setLength(e.currentTarget.value.length),
    className: "field__control",
    ref: inputRef,
  };

  return (
    <div className={`field field--${type}`} data-invalid={error ? true : undefined}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {type === "textarea" ? <textarea rows={5} {...common} /> : <input type={type} inputMode={type === "email" ? "email" : undefined} {...common} />}
      <div className="field__meta">
        {error ? (
          <p className="field__error" id={errorId}>
            <Icon name="close" size={16} />
            {error}
          </p>
        ) : null}
        {showCounter ? (
          <p className="field__count" id={counterId} aria-live="polite">
            {length} / {maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
}
