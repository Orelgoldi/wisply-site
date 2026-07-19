/**
 * Invoice4U clearing client.
 *
 * SAFETY: defaults to the QA sandbox. Real money moves only when
 * INVOICE4U_ENV is explicitly "prod" — an unset or misspelled value stays on QA.
 * The two environments are SEPARATE accounts with SEPARATE keys (verified: a prod
 * key returns null on QA), so INVOICE4U_API_KEY must match INVOICE4U_ENV.
 *
 * Docs: ProcessApiRequestV2 (create hosted page), GetClearingLogByParams (verify).
 */

const HOSTS = {
  qa: "https://apiqa.invoice4u.co.il",
  prod: "https://api.invoice4u.co.il",
} as const;

export function invoice4uEnv(): "qa" | "prod" {
  return process.env.INVOICE4U_ENV === "prod" ? "prod" : "qa";
}

function base(): string {
  return `${HOSTS[invoice4uEnv()]}/Services/ApiService.svc`;
}

function apiKey(): string {
  const k = process.env.INVOICE4U_API_KEY;
  if (!k) throw new Error("INVOICE4U_API_KEY is not set.");
  return k;
}

async function call<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${base()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // These are server-to-server calls; never cache a payment response.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Invoice4U ${method} → HTTP ${res.status}`);
  const json = await res.json();
  // WCF wraps the payload in { d: ... }.
  return (json?.d ?? json) as T;
}

/** Clearing company behind the hosted page. Meshulam by default; overridable. */
const CREDIT_CARD_COMPANY_TYPE = Number(process.env.INVOICE4U_CC_COMPANY ?? 7); // 7 = Meshulam

export type CreateClearingInput = {
  sum: number;
  description: string;
  orderId: string; // our payment_orders.id — echoed back in the callback
  returnUrl: string; // where the customer lands after paying
  callbackUrl: string; // server-to-server notification
  fullName?: string;
  email?: string;
  phone?: string;
};

export type CreateClearingResult = {
  ok: boolean;
  redirectUrl?: string;
  paymentId?: string;
  errors?: unknown[];
  message?: string;
};

/** Create a hosted payment page and return the URL to redirect the customer to. */
export async function createClearingPage(input: CreateClearingInput): Promise<CreateClearingResult> {
  type Resp = {
    ClearingRedirectUrl?: string;
    PaymentId?: string;
    Errors?: unknown[];
  };

  const data = await call<Resp>("ProcessApiRequestV2", {
    request: {
      Invoice4UUserApiKey: apiKey(),
      Sum: input.sum,
      CreditCardCompanyType: CREDIT_CARD_COMPANY_TYPE,
      Currency: "NIS",
      Description: input.description,
      OrderIdClientUsage: input.orderId,
      Type: 1, // regular charge
      FullName: input.fullName ?? "",
      Email: input.email ?? "",
      Phone: input.phone ?? "",
      ReturnUrl: input.returnUrl,
      CallBackUrl: input.callbackUrl,
      IsDocCreate: true, // auto-create the tax invoice (חשבונית מס) on success
    },
  });

  if (!data?.ClearingRedirectUrl || (data.Errors && data.Errors.length)) {
    return { ok: false, errors: data?.Errors, message: "יצירת דף התשלום נכשלה" };
  }
  return { ok: true, redirectUrl: data.ClearingRedirectUrl, paymentId: data.PaymentId };
}

export type ClearingLog = {
  IsSuccess?: boolean;
  Amount?: number | string;
  PaymentId?: string;
  ClearingTraceId?: string;
  OrderIdClientUsage?: string;
};

/** What the callback needs to safely fulfil: the amount as a real number, and the
 *  order the charge was actually made against — both taken from OUR re-query, not
 *  from the untrusted callback body. `amount` is null when it can't be parsed,
 *  which the caller MUST treat as a verification failure (never a skip). */
export type VerifiedPayment = {
  isSuccess: boolean;
  amount: number | null;
  orderId: string;
  paymentId: string;
};

/** Amounts may come back as "249.00" (string) or 249 (number); normalise, reject junk. */
function parseAmount(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Independently verify a payment. The public callback body is NOT trusted on its
 * own — anyone can POST a fake "Success" to our callback URL. We re-query the
 * clearing log by date range and match on PaymentId, then hand back the amount and
 * the order id FROM THE LOG so the caller can confirm the charge belongs to the
 * order it is about to fulfil (a real charge must not be replayable onto a
 * different order of the same price).
 *
 * Throws on network/API failure so the caller can retry rather than fail silently.
 */
export async function verifyPayment(paymentId: string): Promise<VerifiedPayment | null> {
  if (!paymentId) return null;
  const to = new Date();
  const from = new Date(to.getTime() - 3 * 24 * 60 * 60 * 1000); // 3-day window

  const logs = await call<ClearingLog[]>("GetClearingLogByParams", {
    searchParams: {
      FromDate: from.toISOString().slice(0, 19),
      ToDate: to.toISOString().slice(0, 19),
      IsSuccess: true,
    },
    token: apiKey(),
  });

  if (!Array.isArray(logs)) return null;
  const log = logs.find((l) => String(l.PaymentId) === String(paymentId));
  if (!log) return null;

  return {
    isSuccess: log.IsSuccess === true,
    amount: parseAmount(log.Amount),
    orderId: String(log.OrderIdClientUsage ?? ""),
    paymentId: String(log.PaymentId ?? paymentId),
  };
}
