# AI Workshop Pass: referral engine

A working referral system for the free workshop "Build Your First AI Project in 60 Minutes". It is the growth engine for the plan to reach 500 registrations in 7 days with a ₹2,000 budget.

## What it does

| Page | What happens there |
|---|---|
| **Register** | Student claims a free seat. The page shows a live "seats claimed" counter and a countdown. If they arrived from a friend's link, it says who invited them and fills in their college. |
| **My pass** | Every registrant gets a workshop pass with a unique invite code (e.g. `PRIYA482`), a share link, one-tap WhatsApp/LinkedIn sharing, their rank, link opens, and the rewards they've unlocked. |
| **Leaderboard** | Top referrers (top 5 win ₹200 vouchers) and a college-vs-college ranking. |
| **Organizer** (PIN `growth500`) | Campaign dashboard: progress to 500, % via referral, invites per person, registrations per day against the 72/day pace, channel split, referral funnel, budget, top colleges, latest signups, CSV export. |

**Tracking:** invite links look like `…/?ref=PRIYA482&src=wa`. Opening a link counts as a click, and registering through it credits the referrer. A link without a `ref` can still tag the channel, for example `?src=club`, `?src=li` or `?src=amb`.

**Safeguards:**
- Each field is checked as soon as the student leaves it, and the error clears while they type the fix. On submit, a message appears above the button and the cursor jumps to the first bad field.
- Name: letters only (Indian scripts are fine). Phone: 10 digits starting with 6–9, with +91 or 0 allowed in front; fake numbers like 9999999999 are rejected. Email: a proper format, with a "Did you mean gmail.com?" hint for typos. College: must be a name, not just a number.
- If the phone or email is already registered, no new seat is created and the student gets their existing pass. If the phone belongs to one registration and the email to another, the form refuses and explains why.
- Fake or own invite codes earn no credit. An already-registered student opening a friend's link gives that friend nothing. Double-clicking Register creates one seat.
- Phone numbers and emails are never shown on public pages.

## Run it

Open `index.html` in a browser. Nothing to install.

By default it runs in **demo mode**. It loads a simulated 7-day campaign (488 registrations, about 40% from referrals) so every screen has realistic data. Data stays in that browser. In Organizer you can **Erase all data** to start from zero or **Load simulated campaign** to bring the demo back.

## Put it online (1 minute)

1. Go to https://app.netlify.com/drop
2. Drag the `referral-engine` folder onto the page.
3. You get a public link like `https://something.netlify.app`. Submit that.

(GitHub Pages or Vercel work too, since it's a single static file.)

## Go live with Google Sheets (optional, about 10 minutes)

This makes registrations save to a real Google Sheet that everyone shares. A friend on another phone then really moves your referral count.

1. Create a new Google Sheet, then open **Extensions → Apps Script**.
2. Replace the code with the contents of `apps-script.gs` and save.
3. **Deploy → New deployment → Web app**. Set *Execute as: Me* and *Who has access: Anyone*. Authorize it.
4. Copy the web-app URL into `index.html`:
   ```js
   sheetsUrl: "https://script.google.com/macros/s/XXXX/exec",
   ```
5. Re-upload to Netlify. The footer now says "Live mode", and registrations appear in the sheet's *Registrations* tab.

## Demo script for the 3-minute video

1. **Register page.** Point out the seat counter and the countdown.
2. **Organizer** (PIN `growth500`). Walk through the simulated week: referrals compound from day 2, and the pace line shows you're on track.
3. **Leaderboard.** Show the prize zone and the college competition.
4. Open a top referrer's invite link (`?ref=CODE`). Show the "X saved you a seat" banner, register a new student, then show the new pass, share buttons and milestones.
5. Back to **Organizer**. The count went up, and the referrer's count and clicks went up too.
