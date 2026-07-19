/**
 * Branded transactional email via Brevo's HTTP API.
 *
 * Degrades gracefully: if BREVO_API_KEY isn't set, it logs and returns false rather
 * than throwing — a missing key must never break payment fulfilment. Supabase already
 * sends the confirmation email and Invoice4U the tax invoice; this is our own layer.
 */

const FROM = { name: "Wisply", email: process.env.WISPLY_FROM_EMAIL || "hello@wisply.io" };

type SendArgs = { to: string; toName?: string; subject: string; html: string };

export async function sendEmail({ to, toName, subject, html }: SendArgs): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.warn("[email] BREVO_API_KEY not set — skipping:", subject);
    return false;
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: FROM,
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Brevo error", res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed:", e);
    return false;
  }
}

const PLAN_LABEL: Record<string, string> = { spark: "Spark", lite: "Lite", business: "Business", pro: "Pro", enterprise: "Enterprise" };

/** The "thank you for your purchase" email, RTL Hebrew, brand colours. */
export function purchaseThankYouEmail(opts: { name: string; plan: string; loginUrl: string }): {
  subject: string;
  html: string;
} {
  // Escape the fallback too — the label map covers today's plans, but an unmapped
  // value would otherwise be injected raw into the HTML.
  const plan = escapeHtml(PLAN_LABEL[opts.plan] ?? opts.plan);
  const subject = `תודה על הרכישה — Wisply ${plan}`;
  const html = `
  <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;background:#f0f2f5;padding:32px 0;margin:0">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(11,31,36,.08)">
      <div style="background:linear-gradient(135deg,#00c2bf,#007a7c);padding:28px 32px;color:#fff">
        <div style="font-size:22px;font-weight:800">Wisply</div>
      </div>
      <div style="padding:32px">
        <h1 style="margin:0 0 12px;font-size:22px;color:#0b1f24">תודה על הרכישה, ${escapeHtml(opts.name)}!</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f5a60">
          הצטרפתם למסלול <b>${plan}</b>. חשבונית המס כבר בדרך למייל שלכם, והחשבון מוכן.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3f5a60">
          כדי להיכנס בפעם הראשונה, אשרו את מייל האימות ששלחנו לכם, ואז התחברו לדשבורד —
          שם יחכה לכם מפתח הרישיון להפעלת התוסף בוורדפרס.
        </p>
        <a href="${opts.loginUrl}" style="display:inline-block;background:#007a7c;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 28px;border-radius:999px">
          כניסה לדשבורד
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#6b8b90">
          שאלה? השיבו למייל הזה או כתבו לנו ל-hello@wisply.io
        </p>
      </div>
    </div>
  </div>`;
  return { subject, html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
