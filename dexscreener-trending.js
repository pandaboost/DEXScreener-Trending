/**
 * Example: Buy DEX Screener Trending via PandaBoost API
 *
 * Packages:
 *   dex-trending-12h — $1,200 (Solana)
 *   dex-trending-24h — $1,600 (Solana) / from $1,000 (ETH, BSC, Base)
 *
 * Quantity is always 1.
 *
 * Docs: https://docs.pandaboost.app
 */

const BASE_URL = "https://web.pandaboost.app/api/v1";
const API_KEY = "pb_your_api_key_here"; // Get yours: t.me/pandaboosthelp

const headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json",
};

async function pandaboost(path, body = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success) throw new Error(`API error: ${data.error}`);
  return data.data;
}

(async () => {
  // ── 1. Check balance ──────────────────────────────────────────────────────
  const balance = await pandaboost("/balance");
  console.log(`Balance: $${balance.balance} ${balance.currency}`);

  // ── 2. Place a DEX Screener Trending order — Solana 12h ───────────────────
  const order = await pandaboost("/orders", {
    serviceName: "dex-trending",
    orderTypeId: "dex-trending-12h",  // dex-trending-12h | dex-trending-24h
    quantity: 1,                       // always 1
    fields: {
      pair_address: "ErKGCuxZeMQoS3VhFJZ77giESQphJhGpYDaUJmhApump",
      // For ETH/BSC/Base use the pair contract address:
      // pair_address: "0xe945683b3462d2603a18bdfbb19261c6a4f03ad1"
    },
  });

  const orderId = order.order.publicId;
  console.log(`Order placed: ${orderId} — status: ${order.order.status}`);
  console.log(`Amount charged: $${order.payment.amount}`);
  console.log(`New balance: $${order.newBalance}`);

  // ── 3. Check order status ─────────────────────────────────────────────────
  const status = await pandaboost(`/orders/${orderId}`);
  console.log(`\nOrder ${orderId}:`);
  console.log(`  Status:    ${status.status}`);
  console.log(`  Service:   ${status.serviceName}`);
  console.log(`  Package:   ${status.orderTypeName}`);
  console.log(`  Amount:    $${status.amount}`);

  // ── 4. List recent trending orders ───────────────────────────────────────
  const history = await pandaboost("/orders?page=1&limit=5&status=all");
  console.log(`\nRecent orders (${history.pagination.total} total):`);
  for (const o of history.orders) {
    console.log(`  [${o.publicId}] ${o.orderTypeName} — ${o.status} — $${o.amount}`);
  }
})();
