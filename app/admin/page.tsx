import type { Metadata } from "next";
import { getContentFresh } from "@/content/store";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { AdminApp } from "@/components/admin/AdminApp";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

// Always per request: it depends on the session cookie and must show the latest content.
export const dynamic = "force-dynamic";

/** /admin — hidden (not linked, not indexed), desktop-only content dashboard. */
export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="admin admin--center">
        <div className="admin-card">
          <p className="admin-osd">ADMIN — LOCKED</p>
          <p>
            Set <code>ADMIN_PASSWORD</code> and <code>ADMIN_SECRET</code> (32+ characters) in <code>.env.local</code>, then restart the server.
          </p>
        </div>
      </div>
    );
  }
  if (!(await isAdmin())) return <AdminLogin />;
  return <AdminApp initial={await getContentFresh()} />;
}
