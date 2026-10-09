# Bookla 2.0 application — Figma Make verification screenshots

Evidence for the Bookla 2.0 application redesign pull request (Figma Make project
"Bookla 2.0 — Application", file `GNyr0Pv280nkNyrsQYBoDj`). This folder can be deleted after review.

## How these were made

- **Left (Figma Make):** the Make project's own React source, downloaded through the Figma MCP
  server and run locally, captured full page with Playwright/Chromium at DPR 1. It shows Make's sample data.
- **Right (this PR):** the real frontend (`vite` dev server) signed in with a test token. Every
  `/api/*` request is answered by a mock that returns the backend's response shapes
  (`ApiResponse<T>`, `PagedResult<T>`, the DTO field names). The ASP.NET backend and database
  were not run. Names, books and numbers on the right are mock records loaded through the real
  API code paths, not Make's sample data.
- Covers without an uploaded image fall back to Open Library, as before. Open Library is not
  reachable from the test environment, so those books show the typographic cover from the design.
- Widths 1440, 768 and 390. Images are scaled down (1440 at 45 %, 768 at 60 %, 390 at 80 %).

## Images

| Route | Desktop | Tablet | Mobile |
|---|---|---|---|
| `/dashboard` | [1440](dashboard-1440.jpg) | [768](dashboard-768.jpg) | [390](dashboard-390.jpg) |
| `/books` | [1440](books-1440.jpg) | [768](books-768.jpg) | [390](books-390.jpg) |
| `/books/:id` | [1440](books_b1-1440.jpg) | [768](books_b1-768.jpg) | [390](books_b1-390.jpg) |
| `/my-shelves` | [1440](my-shelves-1440.jpg) | [768](my-shelves-768.jpg) | [390](my-shelves-390.jpg) |
| `/shelves/:id` | [1440](shelves_id-1440.jpg) | [768](shelves_id-768.jpg) | [390](shelves_id-390.jpg) |
| `/profile` | [1440](profile-1440.jpg) | [768](profile-768.jpg) | [390](profile-390.jpg) |
| `/profile/:identifier` | [1440](profile_muradkitab-1440.jpg) | [768](profile_muradkitab-768.jpg) | [390](profile_muradkitab-390.jpg) |
| `/community` | [1440](community-1440.jpg) | [768](community-768.jpg) | [390](community-390.jpg) |
| `/feed` | [1440](feed-1440.jpg) | [768](feed-768.jpg) | [390](feed-390.jpg) |
| `/messages` | [1440](messages-1440.jpg) | [768](messages-768.jpg) | [390](messages-390.jpg) |

Make has no separate shelf page: `/shelves/:id` is compared with Make's custom-shelf view at 1440;
the 768 and 390 images show the app only.

Empty and error states of all ten routes (1440):

![Empty states](states-empty-1440.jpg)

![Error states](states-error-1440.jpg)

![Dashboard, Make vs app, 1440](dashboard-1440.jpg)

## Where the app differs from Make, and why

Make's sample content is not reproduced. Anything Make shows that the API has no data for is left
out or replaced by the real equivalent, and features that exist in the app but not in Make are kept
and styled with the same design system.

| Screen | Difference | Reason |
|---|---|---|
| All | Typographic cover tones are darker (`ochre`, `blue`, `moss`) and the genre label is fully opaque | Make's labels fail WCAG AA contrast (3.35–4.12 : 1) |
| All | Focus ring: 2px dark terracotta outline; 24px gap between empty-state text and its button | Visible keyboard focus; Make's empty-state button touches its text |
| Dashboard | "N hekayə davam edir" instead of "Hekayənin 67%-indəsən"; no chapter or progress bar | No reading-progress data |
| Dashboard | Challenge panel has covers and two actions; no pace forecast | Real challenge data and the existing set/view actions |
| Dashboard | Three book rows (trending, top rated, new) and a conversations/shortcuts row | Existing dashboard features kept; rows are not personalised, so the eyebrow is not "SƏNİN ÜÇÜN SEÇİLDİ" |
| Dashboard | Quote card pages through community quotes and has like/edit/delete | Existing quote features |
| Books | No genre chips | The catalogue never filtered by genre |
| Book page | No "1,284 oxucu…" line, no related-books row, author not a link | No such data, no related-books API, no author page |
| Book page | Review form, rating distribution, likes and comments | Existing review features plus the existing like/comment API |
| My shelves | No "Hamısı" card; empty shelves show outlined slots | Only the user's real shelves exist |
| Profile | "oxunub" instead of "rəy"; reading-year card instead of month bars; full feed cards | Real numbers only; no monthly data |
| Profile | Edit dialog has no username field but has bio, location, birth date and social links | No API to change the username; existing fields kept |
| Community | Reader cards show joined date, no book/follower counts | The user list has no counts |
| Community | Large "Oxuduğunu paylaş…" heading | Make's own CSS shrinks it to 12px (`.community-note span` hits the heading lines) |
| Feed | "Yenilə" button and a "Populyar kitablar" side card | Existing feed features |
| Messages | Times, read receipts, unread counts, connection chip, delete-conversation button | Existing messaging features |
| All | No "prototip üçündür" demo notes | They describe Make, not the app |
