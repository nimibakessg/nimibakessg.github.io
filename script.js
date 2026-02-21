// ─── TELEGRAM CONFIG (replaced at build time by GitHub Actions) ──
const TELEGRAM_BOT_TOKEN = '8513299564:AAEI5z23sfUTjEZFJ4Y_z09Rz8xO03V-EsA';
const TELEGRAM_CHAT_ID   = '901628799';

// ─── PRICING LOGIC ───────────────────────────────────────────────
let cookieQty = 0;
let customerData = {};

function pricePerCookie(qty) {
  if (qty <= 0) return 0;
  if (qty === 1) return 6.00;
  if (qty <= 3) return 5.50;
  return 5.00;
}

function updateQty(delta) {
  cookieQty = Math.max(0, cookieQty + delta);
  document.getElementById('cookie-qty').value = cookieQty;
  renderCart();
}

function updateQtyFromInput(val) {
  cookieQty = Math.max(0, parseInt(val) || 0);
  renderCart();
}

function handleFairyLights(checkbox) {
  const bouquetChecked = document.querySelector('input[value="Rose Bouquet"]').checked;
  if (checkbox.checked && !bouquetChecked) {
    checkbox.checked = false;
    const card = document.getElementById('fairy-card');
    card.style.borderColor = 'var(--gold)';
    card.querySelector('.addon-price').textContent = '⚠️ Add bouquet first';
    setTimeout(() => {
      card.style.borderColor = '';
      card.querySelector('.addon-price').textContent = '+$5 (with bouquet)';
    }, 2000);
    return;
  }
  renderCart();
}

function getAddons() {
  return Array.from(document.querySelectorAll('input[name="addon"]:checked')).map(el => ({
    name: el.value,
    price: parseInt(el.dataset.price),
  }));
}

function renderCart() {
  const ppu = pricePerCookie(cookieQty);
  const cookieTotal = Math.round(ppu * cookieQty * 100) / 100;
  const addons = getAddons();
  const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
  const grand = cookieTotal + addonTotal;

  const hint = document.getElementById('price-hint');
  if (cookieQty === 0) hint.textContent = 'Price adjusts automatically';
  else if (cookieQty === 1) hint.textContent = '$6.00 each';
  else if (cookieQty <= 3) hint.textContent = `$5.50 each · $${cookieTotal.toFixed(2)} total`;
  else hint.textContent = `$5.00 each · $${cookieTotal.toFixed(2)} total`;

  const summary = document.getElementById('cart-summary');
  const btn = document.getElementById('checkout-btn');

  if (grand === 0) {
    summary.innerHTML = '<span class="cart-empty">Add cookies above to get started</span>';
    btn.disabled = true;
    return;
  }

  let lines = '';
  if (cookieQty > 0) {
    lines += `<span>${cookieQty} cookie${cookieQty > 1 ? 's' : ''} × $${ppu.toFixed(2)} <strong>$${cookieTotal.toFixed(2)}</strong></span>`;
  }
  addons.forEach(a => {
    lines += `<span>${a.name} <strong>+$${a.price}</strong></span>`;
  });

  summary.innerHTML = `
    ${lines}
    <div class="cart-divider"></div>
    <span class="cart-total">${cookieQty} cookie${cookieQty !== 1 ? 's' : ''} · <strong>$${grand.toFixed(2)} total</strong></span>
  `;
  btn.disabled = false;
}

// ─── NAVIGATION ──────────────────────────────────────────────────
function goToStep(step) {
  document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + step).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── FORM ────────────────────────────────────────────────────────
function toggleDelivery() {
  const method = document.querySelector('input[name="method"]:checked').value;
  document.getElementById('address-wrap').style.display = method === 'delivery' ? 'block' : 'none';
}

function submitOrder(e) {
  e.preventDefault();
  const form       = e.target;
  const name       = form.name.value.trim();
  const contact    = form.contact.value.trim();
  const date       = form.date.value;
  const method     = form.method.value;
  const address    = method === 'delivery' ? form.address.value.trim() : null;
  const specialReq = document.getElementById('special-req').value.trim();

  const ppu         = pricePerCookie(cookieQty);
  const cookieTotal = Math.round(ppu * cookieQty * 100) / 100;
  const addons      = getAddons();
  const addonTotal  = addons.reduce((sum, a) => sum + a.price, 0);
  const subtotal    = cookieTotal + addonTotal;
  const deliveryFee = method === 'delivery' ? 15 : 0;
  const grandTotal  = subtotal + deliveryFee;

  customerData = { name, contact };

  const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('en-SG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let addonLines = addons.length > 0
    ? addons.map(a => `  + ${a.name} = $${a.price}`).join('\n') + '\n'
    : '';

  // ── Instagram message ─────────────────────────────────────────
  const igMsg =
`Hi nimi! I have placed an order!

Order Details:
-------------------------------------------
Name: ${name}
Contact: ${contact}
📦 Order:
  ${cookieQty} cookie${cookieQty !== 1 ? 's' : ''} x $${ppu.toFixed(2)} = $${cookieTotal.toFixed(2)}
${addonLines}Subtotal: $${subtotal.toFixed(2)}${method === 'delivery' ? '\nDelivery fee: $15' : ''}
Total Payment: $${grandTotal.toFixed(2)}${specialReq ? `\n\nSpecial requests: ${specialReq}` : ''}
📅 ${method === 'delivery' ? 'Delivery' : 'Collection'} date: ${dateStr}
🚚 Method: ${method === 'delivery' ? `Delivery\nAddress: ${address}` : 'Self-pickup'}

Please have the payment proof attached!
Thank you for your purchase!`;

  document.getElementById('ig-msg-preview').textContent = igMsg;
  document.getElementById('ig-link-btn').onclick = () => {
    navigator.clipboard.writeText(igMsg).catch(() => {});
    window.open('https://ig.me/m/nimi.sg_', '_blank');
  };

  // ── Telegram notification ─────────────────────────────────────
  const timestamp  = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });
  const addonNames = addons.length > 0 ? addons.map(a => a.name).join(', ') : 'None';

  const tgLines = [
    `🍪 *New nimi Order!*`,
    ``,
    `🕐 *Time:* ${timestamp}`,
    `👤 *Name:* ${name}`,
    `📞 *Contact:* ${contact}`,
    `📅 *Date:* ${dateStr}`,
    `📦 *Method:* ${method === 'delivery' ? 'Delivery' : 'Self-pickup'}`,
    address ? `📍 *Address:* ${address}` : null,
    ``,
    `🛒 *Cookies:* ${cookieQty} × $${ppu.toFixed(2)} = $${cookieTotal.toFixed(2)}`,
    addonNames !== 'None' ? `🎁 *Add-ons:* ${addonNames} = $${addonTotal}` : null,
    ``,
    `💰 *Subtotal:* $${subtotal.toFixed(2)}`,
    method === 'delivery' ? `🚚 *Delivery:* $15` : null,
    `✅ *Total: $${grandTotal.toFixed(2)}*`,
    specialReq ? `\n📝 *Special requests:* ${specialReq}` : null,
  ].filter(l => l !== null).join('\n');

  sendTelegramMessage(tgLines);

  goToStep('payment');
}

// ─── TELEGRAM SEND ───────────────────────────────────────────────
async function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === '8513299564:AAEI5z23sfUTjEZFJ4Y_z09Rz8xO03V-EsA') {
    console.warn('Telegram token not injected yet.');
    return;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      }
    );
    const data = await res.json();
    if (!data.ok) console.warn('Telegram error:', data.description);
  } catch (err) {
    console.warn('Telegram send failed:', err);
  }
}

// ─── COPY MESSAGE ────────────────────────────────────────────────
function copyMsg() {
  const msg = document.getElementById('ig-msg-preview').textContent;
  navigator.clipboard.writeText(msg).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy Message'; btn.classList.remove('copied'); }, 2000);
  });
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

renderCart();
toggleDelivery();

async function sendScreenshot() {
  const fileInput = document.getElementById('screenshotUpload');
  const statusEl = document.getElementById('uploadStatus');
  const btn = document.getElementById('sendScreenshotBtn');

  if (!fileInput.files[0]) {
    statusEl.textContent = '⚠️ Please select a screenshot first.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending...';
  statusEl.textContent = '';

  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('document', fileInput.files[0]);
  formData.append('caption', `📸 Payment screenshot from ${customerData.name} (${customerData.contact})`);

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      statusEl.innerHTML = '✅ Order and screenshot sent successfully!';
      btn.textContent = 'Sent ✓';
    } else {
      throw new Error('Failed');
    }
  } catch (e) {
    statusEl.textContent = '❌ Failed to send. Please DM us on Instagram instead.';
    btn.disabled = false;
    btn.textContent = 'Send Screenshot to Us 📤';
  }
}

function previewFile(input) {
  const preview = document.getElementById('filePreview');
  if (input.files[0]) {
    preview.textContent = `✅ Selected: ${input.files[0].name}`;
  }
}
