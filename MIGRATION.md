# Customer site: what changed

The admin panel now lives in a separate project (`hangover-admin`) that uses the same database.

Removed from this project:
- `src/app/admin/*` and `src/app/api/admin/*`
- admin block in `src/proxy.js` (only `/checkout` is protected now)
- hardcoded `admin` / `admin123` login in `api/auth/[...nextauth]/route.js`
- admin links/badge/role logic in `src/components/Navbar.js` and the admin redirect in `login/page.js`

Everything else (catalog, product pages, cart, checkout, Razorpay, orders, wishlist, trending rail, reviews,
stock alerts) is unchanged and keeps working with the same environment variables.
