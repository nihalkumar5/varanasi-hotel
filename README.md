# Vnexora Future-Ready Hotel Audit

A zero-dependency web app for collecting hotel assessment responses, scoring them instantly, generating a report, and preparing a WhatsApp-ready summary for manual sending by an admin.

## What it includes

- Basic hotel details: name, WhatsApp-enabled phone, email
- 10 A/B/C assessment questions scored as 2, 5, or 8 points
- Automatic point total and result band calculation
- Category-by-category performance breakdown
- Auto-generated strengths and suggestions
- Manual WhatsApp workflow with:
  - copyable message draft
  - one-click `wa.me` draft link
  - print-friendly report for PDF export
- Confirmation screen at `/thank-you`
- Protected admin portal at `/admin` for reviewing lead rows from Google Sheets
- Protected report view at `/results` for admin review only

## Run locally

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Rating bands

- `70+` -> `Future Ready`
- `30-69` -> `Growing Hotel`
- `<30` -> `Traditional Hotel`

## Admin workflow

1. Fill in the hotel details and answer all audit questions.
2. Click `Generate audit report`.
3. Review the report and suggestions.
4. Use `Copy WhatsApp summary` or `Open WhatsApp draft`.
5. The admin reviews and sends the message manually from WhatsApp.
6. Open `/admin` to search leads, inspect scores, and copy the follow-up summary.

## Admin login

Set these environment variables before deploying:

- `ADMIN_PASSWORD` for the portal password
- `ADMIN_USERNAME` if you want to override the default `admin` username
- `ADMIN_AUTH_SECRET` for signing the session cookie

When you open `/admin`, the app shows a sign-in page until the correct credentials are entered. The portal stores an HttpOnly session cookie and automatically logs out when the session expires.

For this workspace, the local admin credentials are loaded from [`.env.local`](/Users/nihalkumar/Library/CloudStorage/GoogleDrive-kumarnihal829@gmail.com/My%20Drive/Projects/hotelforms/.env.local). Use those exact values when you sign in locally, then copy the same values into your Vercel environment variables before deploying.

## Google Sheets saving

The form submission now posts to `/api/lead`. To forward that data into Google Sheets, set `GOOGLE_SHEETS_WEBHOOK_URL` to a Google Apps Script web app URL that appends each submission to your sheet.

Important:

- Use the deployed web app URL that ends in `/exec`, not a Google Drive link or Apps Script editor URL.
- Deploy the Apps Script as a web app with access set to `Anyone`.
- A quick test is to open `GOOGLE_SHEETS_WEBHOOK_URL?action=list`; the response should be JSON, not an HTML page.

Use the helper script in [google-apps-script.gs](/Users/nihalkumar/Library/CloudStorage/GoogleDrive-kumarnihal829@gmail.com/My%20Drive/Projects/hotelforms/google-apps-script.gs) as the backend for your Google Sheet:

1. Create a Google Sheet.
2. Open `Extensions > Apps Script`.
3. Paste the contents of `google-apps-script.gs`.
4. Deploy it as a Web app with access set to `Anyone`.
5. Copy the deployed Web app URL into `GOOGLE_SHEETS_WEBHOOK_URL` in Vercel.

Saved fields include:

- Hotel name
- WhatsApp number
- Email
- Score and rating
- Demo link and VNEXORA contact details

## Customization

- Update questions and recommendations in [public/app.js](/Users/nihalkumar/Library/CloudStorage/GoogleDrive-kumarnihal829@gmail.com/My%20Drive/Projects/hotelforms/public/app.js).
- Update colors and layout in [public/styles.css](/Users/nihalkumar/Library/CloudStorage/GoogleDrive-kumarnihal829@gmail.com/My%20Drive/Projects/hotelforms/public/styles.css).
- If you want database storage or PDF automation later, this static version is a clean base to extend.
