"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import "./admin.css";

export function AdminLogin() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <div className="admin admin--center">
      <form className="admin-card admin-login" action={action}>
        <p className="admin-osd">
          <span className="admin-rec" aria-hidden="true" /> TAPE 01 — ADMIN
        </p>
        <label className="admin-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required autoFocus disabled={pending} />
        </label>
        {state.error ? (
          <p className="admin-error" role="alert">
            {state.error}
          </p>
        ) : null}
        <button className="admin-btn admin-btn--primary" type="submit" disabled={pending}>
          {pending ? "CHECKING…" : "SIGN IN ▶"}
        </button>
      </form>
    </div>
  );
}
