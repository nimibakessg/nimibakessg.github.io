// ─── TELEGRAM CONFIG (replaced at build time by GitHub Actions) ──
const 8513299564:AAEI5z23sfUTjEZFJ4Y_z09Rz8xO03V-EsA = '8513299564:AAEI5z23sfUTjEZFJ4Y_z09Rz8xO03V-EsA';
const 901628799   = '901628799';

const SOLD_OUT = false;

// ─── STATE ────────────────────────────────────────────────────────
let cookieQty = 0;
let flanQty = 0;
let bouquetQty = 0;
let customerData = {};

// ── PROMO CODES ──────────────────────────────────────
// Add as many as you want: "CODE": discountPercent
const PROMO_CODES = {
  "MUMMY10": 10,
};

let appliedDiscount = 0; // tracks current active discount %

function applyPromo() {
  const input = document.getElementById("f-promo");
  const msg   = document.getElementById("promo-msg");
  const code  = input.value.trim().toUpperCase();

  if (!code) {
    msg.className = "error";
    msg.textContent = "Please enter a promo code.";
    return;
  }

  if (PROMO_CODES[code] !== undefined) {
    appliedDiscount = PROMO_CODES[code];
    msg.className = "success";
    msg.textContent = `✓ "${code}" applied — ${appliedDiscount}% off!`;
    input.disabled = true;
  } else {
    appliedDiscount = 0;
    msg.className = "error";
    msg.textContent = "Invalid promo code. Please try again.";
  }
}

// ─── PRICING ──────────────────────────────────────────────────────
function pricePerCookie(qty) {
  if (qty <= 0) return 0;
  if (qty === 1) return 6.00;
  if (qty <= 3) return 5.50;
  return 5.00;
}

const FLAN_PRICE = 3.00;

function bouquetPrice() {
  // $15 if any food item is in cart, otherwise $30
  return (cookieQty > 0 || flanQty > 0) ? 15 : 30;
}

// ─── QUANTITY UPDATES ─────────────────────────────────────────────
function updateQty(delta) {
  cookieQty = Math.max(0, cookieQty + delta);
  document.getElementById('cookie-qty').value = cookieQty;
  renderCart();
}

function updateQtyFromInput(val) {
  cookieQty = Math.max(0, parseInt(val) || 0);
  renderCart();
}

function updateFlanQty(delta) {
  flanQty = Math.max(0, flanQty + delta);
  document.getElementById('flan-qty').value = flanQty;
  renderCart();
}

function updateFlanQtyFromInput(val) {
  flanQty = Math.max(0, parseInt(val) || 0);
  renderCart();
}

function updateBouquetQty(delta) {
  bouquetQty = Math.max(0, bouquetQty + delta);
  document.getElementById('bouquet-qty').value = bouquetQty;
  const addons = document.getElementById('bouquet-addons');
  addons.style.display = bouquetQty > 0 ? 'block' : 'none';
  if (bouquetQty === 0) {
    document.querySelectorAll('input[name="bouquet-addon"]').forEach(el => el.checked = false);
    const wrap = document.getElementById('postcard-note-wrap');
    if (wrap) wrap.style.display = 'none';
  }
  renderCart();
}

function updateBouquetQtyFromInput(val) {
  bouquetQty = Math.max(0, parseInt(val) || 0);
  const addons = document.getElementById('bouquet-addons');
  addons.style.display = bouquetQty > 0 ? 'block' : 'none';
  if (bouquetQty === 0) {
    document.querySelectorAll('input[name="bouquet-addon"]').forEach(el => el.checked = false);
    const wrap = document.getElementById('postcard-note-wrap');
    if (wrap) wrap.style.display = 'none';
  }
  renderCart();
}

function togglePostcard(checkbox) {
  const wrap = document.getElementById('postcard-note-wrap');
  if (wrap) wrap.style.display = checkbox.checked ? 'block' : 'none';
}

function toggleRemarks(checkbox, product) {
  const wrap = document.getElementById(product + '-remarks-wrap');
  if (wrap) wrap.style.display = checkbox.checked ? 'block' : 'none';
}

// ─── ADD-ONS ──────────────────────────────────────────────────────
function getCookieAddons() {
  return Array.from(document.querySelectorAll('input[name="cookie-addon"]:checked')).map(el => ({
    name: el.value,
    price: parseInt(el.dataset.price),
  }));
}

function getFlanAddons() {
  return Array.from(document.querySelectorAll('input[name="flan-addon"]:checked')).map(el => ({
    name: el.value,
    price: parseInt(el.dataset.price),
  }));
}

function getBouquetAddons() {
  return Array.from(document.querySelectorAll('input[name="bouquet-addon"]:checked')).map(el => ({
    name: el.value,
    price: parseInt(el.dataset.price),
  }));
}

// ─── CART RENDER ──────────────────────────────────────────────────
function renderCart() {
  // Cookie pricing hint
  const hint = document.getElementById('price-hint');
  if (hint) {
    const ppu = pricePerCookie(cookieQty);
    if (cookieQty === 0) hint.textContent = 'Price adjusts automatically';
    else if (cookieQty === 1) hint.textContent = '$6.00 each';
    else if (cookieQty <= 3) hint.textContent = `$5.50 each · $${(5.50 * cookieQty).toFixed(2)} total`;
    else hint.textContent = `$5.00 each · $${(5.00 * cookieQty).toFixed(2)} total`;
  }

  // Update bouquet price display
  const bouquetPriceEl = document.getElementById('bouquet-price-display');
  if (bouquetPriceEl) {
    if (cookieQty > 0 || flanQty > 0) {
      bouquetPriceEl.innerHTML = '<span class="price-sale">$15</span> <span class="price-discount-note">food item discount applied ✓</span>';
    } else {
      bouquetPriceEl.innerHTML = '<span class="price-current">$30</span> <span class="price-discount-note">(or $15 when bought with food)</span>';
    }
  }

  const summary = document.getElementById('cart-summary');
  const btn = document.getElementById('checkout-btn');

  const ppu = pricePerCookie(cookieQty);
  const cookieTotal = Math.round(ppu * cookieQty * 100) / 100;
  const cookieAddons = getCookieAddons();
  const cookieAddonTotal = cookieAddons.reduce((sum, a) => sum + a.price, 0);

  const flanTotal = flanQty * FLAN_PRICE;
  const flanAddons = getFlanAddons();
  const flanAddonTotal = flanAddons.reduce((sum, a) => sum + a.price, 0);

  const bPrice = bouquetQty > 0 ? bouquetPrice() : 0;
  const bouquetAddons = bouquetQty > 0 ? getBouquetAddons() : [];
  const bouquetAddonTotal = bouquetAddons.reduce((sum, a) => sum + a.price, 0);

  const grand = cookieTotal + cookieAddonTotal + flanTotal + flanAddonTotal + bPrice * bouquetQty + bouquetAddonTotal;
  const discountAmt     = (grand * appliedDiscount) / 100;
  const discountedGrand = grand - discountAmt;

  if (grand === 0) {
    summary.innerHTML = '<span class="cart-empty">Add items above to get started</span>';
    btn.disabled = true;
    return;
  }

  let lines = '';
  if (cookieQty > 0) {
    lines += `<span>${cookieQty} cookie${cookieQty > 1 ? 's' : ''} × $${ppu.toFixed(2)} <strong>$${cookieTotal.toFixed(2)}</strong></span>`;
    cookieAddons.forEach(a => {
      lines += `<span>${a.name} (cookies) <strong>+$${a.price}</strong></span>`;
    });
  }
  if (flanQty > 0) {
    lines += `<span>${flanQty} leche flan${flanQty > 1 ? 's' : ''} × $${FLAN_PRICE.toFixed(2)} <strong>$${flanTotal.toFixed(2)}</strong></span>`;
    flanAddons.forEach(a => {
      lines += `<span>${a.name} (flan) <strong>+$${a.price}</strong></span>`;
    });
  }
  if (bouquetQty > 0) {
    const fullPrice = 30 * bouquetQty;
    lines += `<span>${bouquetQty} Rose Bouquet${bouquetQty > 1 ? 's' : ''} <strong>$${fullPrice.toFixed(2)}</strong></span>`;
    if (bPrice === 15) {
      const saving = (30 - 15) * bouquetQty;
      lines += `<span class="cart-combo-discount">Combo Discount <strong>-$${saving.toFixed(2)}</strong></span>`;
    }
    bouquetAddons.forEach(a => {
      const priceStr = a.price === 0 ? 'Free' : `+$${a.price}`;
      lines += `<span>${a.name} (bouquet) <strong>${priceStr}</strong></span>`;
    });
  }

  const itemCount = cookieQty + flanQty + bouquetQty;
  summary.innerHTML = `
    ${lines}
    <div class="cart-divider"></div>
    <span class="cart-total">
      ${itemCount} item${itemCount !== 1 ? 's' : ''} · 
      <strong>$${discountedGrand.toFixed(2)} total</strong>
      ${appliedDiscount > 0 ? `<span class="cart-combo-discount">${appliedDiscount}% off applied ✓</span>` : ''}
    </span>
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

  const ppu          = pricePerCookie(cookieQty);
  const cookieTotal  = Math.round(ppu * cookieQty * 100) / 100;
  const cookieAddons = getCookieAddons();
  const cookieAddonTotal = cookieAddons.reduce((sum, a) => sum + a.price, 0);

  const flanTotal  = flanQty * FLAN_PRICE;
  const flanAddons = getFlanAddons();
  const flanAddonTotal = flanAddons.reduce((sum, a) => sum + a.price, 0);

  const bPrice        = bouquetQty > 0 ? bouquetPrice() : 0;
  const bouquetAddons = bouquetQty > 0 ? getBouquetAddons() : [];
  const bouquetAddonTotal = bouquetAddons.reduce((sum, a) => sum + a.price, 0);
  const postcardNote  = bouquetQty > 0 ? (document.getElementById('postcard-note') ? document.getElementById('postcard-note').value.trim() : '') : '';
  const cookieRemarks = document.getElementById('cookie-remarks') ? document.getElementById('cookie-remarks').value.trim() : '';
  const flanRemarks   = document.getElementById('flan-remarks') ? document.getElementById('flan-remarks').value.trim() : '';

  const subtotal   = cookieTotal + cookieAddonTotal + flanTotal + flanAddonTotal + bPrice * bouquetQty + bouquetAddonTotal;
  const deliveryFee = method === 'delivery' ? 15 : 0;
  const discount = (subtotal * appliedDiscount) / 100;
  const grandTotal  = subtotal + deliveryFee - discount;

  customerData = { name, contact };

  const dateEl = document.getElementById('f-date');
  const dateStr = dateEl.options[dateEl.selectedIndex].text;

  let orderLines = '';
  if (cookieQty > 0) {
    orderLines += `  ${cookieQty} Dubai Chewy Cookie${cookieQty > 1 ? 's' : ''} x $${ppu.toFixed(2)} = $${cookieTotal.toFixed(2)}\n`;
    cookieAddons.forEach(a => { orderLines += `    + ${a.name}${a.price > 0 ? ` = $${a.price}` : ''}\n`; });
    if (cookieRemarks) orderLines += `    Remarks: "${cookieRemarks}"\n`;
  }
  if (flanQty > 0) {
    orderLines += `  ${flanQty} Leche Flan${flanQty > 1 ? 's' : ''} x $${FLAN_PRICE.toFixed(2)} = $${flanTotal.toFixed(2)}\n`;
    flanAddons.forEach(a => { orderLines += `    + ${a.name}${a.price > 0 ? ` = $${a.price}` : ''}\n`; });
    if (flanRemarks) orderLines += `    Remarks: "${flanRemarks}"\n`;
  }
  if (bouquetQty > 0) {
    orderLines += `  ${bouquetQty} Rose Bouquet${bouquetQty > 1 ? 's' : ''} x $30 = $${(30 * bouquetQty).toFixed(2)}\n`;
    if (bPrice === 15) {
      const saving = (30 - 15) * bouquetQty;
      orderLines += `  Combo Discount = -$${saving.toFixed(2)}\n`;
    }
    bouquetAddons.forEach(a => {
      const priceStr = a.price === 0 ? 'free' : `$${a.price}`;
      orderLines += `    + ${a.name} = ${priceStr}\n`;
    });
    if (postcardNote) orderLines += `    Postcard message: "${postcardNote}"\n`;
  }

  const igMsg =
`Hi nimi! I have placed an order!

Order Details:
-------------------------------------------
Name: ${name}
Contact: ${contact}
📦 Order:
${orderLines}Subtotal: $${subtotal.toFixed(2)}${method === 'delivery' ? '\nDelivery fee: $15' : ''}
Total Payment (after all discounts): $${grandTotal.toFixed(2)}${specialReq ? `\n\nSpecial requests: ${specialReq}` : ''}
📅 ${method === 'delivery' ? 'Delivery' : 'Collection'} date: ${dateStr}
🚚 Method: ${method === 'delivery' ? `Delivery\nAddress: ${address}` : 'Self-pickup'}

Please have the payment proof attached!
Thank you for your purchase!`;

  document.getElementById('ig-msg-preview').textContent = igMsg;
  document.getElementById('ig-link-btn').onclick = () => {
    navigator.clipboard.writeText(igMsg).catch(() => {});
    window.open('https://ig.me/m/nimi.sg_', '_blank');
  };

  goToStep('payment');
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
  formData.append('chat_id', 901628799);
  formData.append('document', fileInput.files[0]);
  formData.append('caption', `📸 Payment screenshot from ${customerData.name} (${customerData.contact})`);

  try {
    const res = await fetch(`https://api.telegram.org/bot${8513299564:AAEI5z23sfUTjEZFJ4Y_z09Rz8xO03V-EsA}/sendDocument`, {
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

if (SOLD_OUT) {
  const btn = document.getElementById('checkout-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sold Out';
    btn.style.pointerEvents = 'none';

    const notice = document.createElement('p');
    notice.textContent = 'Sorry, we are currently sold out on ALL dates. Follow our tiktok @nimi.sg to stay updated on preorder releases! 🍪';
    notice.style.cssText = 'text-align:center; color:var(--cocoa); font-size:0.85rem; margin-top:0.5rem; opacity:0.8;';
    btn.insertAdjacentElement('afterend', notice);
  }
}
