# AlifBit deployment

- Live site: https://alifbit.org
- www redirects to the canonical root: https://www.alifbit.org
- Admin: https://alifbit.org/admin
- GitHub source: https://github.com/Abdurroxman/alifbit.org
- Production Worker: `alifbit-org`
- D1: `alifbit-db`
- R2: `alifbit-media`, separate public images and private order attachments.
- Applied migrations: 0001, 0002, 0003.
- Runtime secrets: administrator password hash, session secret, IP hash secret.
- Private administrator password: local, ignored `production-admin.txt`. Never commit or share it publicly. The password itself is not deployed.
- Telegram contact: https://t.me/id799
- Telegram bot notifications: not configured. Orders still persist and appear in admin; optional delivery secrets are documented in README.

The site was deployed successfully with Wrangler. Its source was pushed to the connected GitHub repository. The existing Cloudflare GitHub build integration remains in place, and the repository's Wrangler custom build prepares the frontend even when the dashboard Build command is empty. Automatic build status could not be inspected with the available OAuth scope (Workers CI API returned 403). The successful production deployment and its HTTPS response were verified independently.

Browser layout QA remains pending because Windows browser control stopped after failing to determine the current URL. No Lighthouse score, real mobile-device result or visual QA completion is claimed. See TEST-RESULTS.md.
