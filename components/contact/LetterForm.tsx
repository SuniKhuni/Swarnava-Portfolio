"use client";

import { Field } from "../ui/Field";
import { Button } from "../ui/Button";
import { CONTACT_LIMITS, NEEDS, type FieldErrors } from "./contact-shared";

type LetterFormProps = {
  ref?: React.Ref<HTMLFormElement>;
  action: (fd: FormData) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: FieldErrors;
  values?: { name: string; email: string; need: string; message: string };
  pending: boolean;
  formError?: string;
  email: string;
};

/** The letter: the contact form on white paper (§9.7). */
export function LetterForm({ ref, action, onSubmit, errors, values, pending, formError, email }: LetterFormProps) {
  return (
    <form ref={ref} className="letter" action={action} onSubmit={onSubmit} noValidate>
      {formError ? (
        <p className="letter__banner" role="alert">
          {formError.split(email).map((part, i, all) => (
            <span key={i}>
              {part}
              {i < all.length - 1 ? <a href={`mailto:${email}`}>{email}</a> : null}
            </span>
          ))}
        </p>
      ) : null}
      <Field name="name" label="Name" required autoComplete="name" error={errors.name} defaultValue={values?.name} readOnly={pending} maxLength={CONTACT_LIMITS.name.max} />
      <Field name="email" label="Email" type="email" required autoComplete="email" error={errors.email} defaultValue={values?.email} readOnly={pending} />
      <Field name="need" label="What do you need?" type="chips" options={[...NEEDS]} defaultValue={values?.need} readOnly={pending} />
      <Field
        name="message"
        label="Message"
        type="textarea"
        required
        error={errors.message}
        defaultValue={values?.message}
        readOnly={pending}
        maxLength={CONTACT_LIMITS.message.max}
      />
      {/* Honeypot — people never see or reach it. */}
      <div className="letter__trap" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <Button type="submit" variant="signal" size="lg" icon="play" loading={pending} className="letter__send">
        SEND
      </Button>
    </form>
  );
}
