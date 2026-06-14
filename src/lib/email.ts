import { Resend } from "resend";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY env var.");
  return new Resend(key);
}

function from() {
  return process.env.EMAIL_FROM || "Happiness Activation <onboarding@resend.dev>";
}

const SHELL = (inner: string) => `
  <div style="background:#0B0F1A;padding:32px 0;font-family:Inter,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:32px;color:#EAF0F7">
      <div style="font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#8A92A6;margin-bottom:24px">
        Happiness <span style="color:#C6FF3D">Activation</span>
      </div>
      ${inner}
      <div style="margin-top:32px;color:#3c465c;font-size:11px;letter-spacing:0.08em;text-transform:uppercase">
        The AEA Institute · Happiness Activation Bootcamp
      </div>
    </div>
  </div>`;

const limeButton = (href: string, label: string) => `
  <a href="${href}" style="display:inline-block;background:#C6FF3D;color:#0B0F1A;font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:15px;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;padding:15px 28px;border-radius:13px">
    ${label}
  </a>`;

export async function sendMagicLink(email: string, link: string) {
  const html = SHELL(`
    <h1 style="font-family:'Archivo Black',Arial,sans-serif;font-size:26px;line-height:1.1;margin:0 0 14px;text-transform:uppercase">Your way in</h1>
    <p style="color:#8A92A6;font-size:15px;line-height:1.6;margin:0 0 24px">
      Tap below to start (or pick up) your training. This link works for 15 minutes and signs you in — no password.
    </p>
    ${limeButton(link, "Open my bootcamp →")}
    <p style="color:#54607a;font-size:12px;margin-top:24px">If you didn't request this, you can ignore it.</p>
  `);

  return client().emails.send({
    from: from(),
    to: email,
    subject: "Your Happiness Activation link",
    html,
  });
}

export async function sendReportEmail(
  email: string,
  reportHtml: string,
  appUrl: string
) {
  const html = SHELL(`
    <div style="font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#C6FF3D;margin-bottom:8px">Your week, reviewed</div>
    <h1 style="font-family:'Archivo Black',Arial,sans-serif;font-size:26px;line-height:1.1;margin:0 0 18px;text-transform:uppercase">7 Days, Trained</h1>
    <div style="color:#EAF0F7;font-size:15px;line-height:1.7">${reportHtml}</div>
    <div style="margin-top:28px">${limeButton(`${appUrl}/report`, "View it in the app →")}</div>
  `);

  return client().emails.send({
    from: from(),
    to: email,
    subject: "Your Happiness Activation week-in-review",
    html,
  });
}
