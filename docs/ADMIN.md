# Admin Guide — Lovely Queen Market

Staff dashboard for order fulfillment, catalog management, and reporting.

**URL:** `/admin/login`  
**Access:** Password set in `ADMIN_PASSWORD` (Vercel env). Session lasts 8 hours.

---

## Navigation

| Tab | Purpose |
|-----|---------|
| **Dashboard** | Sales KPIs, charts, quick links, recent orders |
| **Products** | Add/edit products, stock, categories, images |
| **Orders** | All orders, filters (today, status), export |
| **Customers** | Registered shoppers and their order history |
| **Shipping** | Setup checklist for USPS label integration |

---

## Order workflow

### 1. New order arrives

- Email alert to merchant inbox
- Optional browser notification if admin is open
- Order status: **Ordered**

### 2. Prepare the order

- Open **Orders → [order]**
- Pick and pack items
- Set status to **Processing** when packing starts

### 3. Fulfill — pickup vs ship

**Store pickup / Uber driver**

- Customer selected pickup at checkout
- When bags are ready: status → **Ready for pickup**
- Customer collects; mark **Delivered** when complete

**Ship to customer**

Choose one:

| Method | Steps |
|--------|--------|
| **Print address slip** | Click **Print address slip** → tape on box → take to USPS → pay at counter → paste tracking in admin |
| **USPS label (if enabled)** | Enter weight → **Get rate** → **Print label** → tracking saved automatically |

Then set status to **Shipped** (or it may auto-update when a label is purchased).

### 4. Tracking

- Enter tracking number in **Update status** if not auto-filled
- Customer receives email on status change
- Customer can view timeline at `/track-order`

---

## Refunds

Available on **Stripe-paid** orders only.

1. Open order in admin
2. **Refund** section → enter amount (partial or full)
3. Confirm — Stripe processes refund; order log updated

---

## Products

### Add product

**Products → Add product**

- Name, price, category, description, image URL or upload
- **In stock** toggle controls visibility

### Bulk management

- Filter by category or stock status
- Quick stock toggle on list view
- Grouped by category on products page

---

## Reports & export

**Dashboard**

- Date pills: Today, Yesterday, 7d, 30d, WTD, MTD, custom range
- Gross revenue, units sold, refunds, top products

**Export CSV**

- Dashboard or Orders page → **Export**
- Includes order details, customer info, totals, tracking

Timezone for date buckets: `America/New_York` (Columbus) unless overridden.

---

## Security notes

- Do not share admin password
- Log out on shared devices (**Logout** in admin header)
- Failed login lockouts apply when `ADMIN_ENFORCE_LOGIN_RATE_LIMIT=1`
- Admin is not indexed by search engines (`X-Robots-Tag: noindex`)

---

## Troubleshooting

| Problem | Check |
|---------|--------|
| Can't log in | `ADMIN_PASSWORD` in Vercel matches what you type; redeploy after env change |
| Order missing after payment | Stripe webhook secret correct; Stripe Dashboard → Webhooks → event logs |
| Label won't print | USPS API credentials; `USPS_LABELS_ENABLED=1` after USPS approval |
| Customer didn't get email | `GMAIL_USER` / `GMAIL_APP_PASSWORD`; check spam |

For full technical reference see [PROJECT.md](PROJECT.md).
