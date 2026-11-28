# Daily public travel refresh

Repository: 0213817-coder/walkietokki-homepage. Edit `public/ridebook/discoveries.json` for verified public recommendations. The PWA checks it when opened, brought to the foreground, or reconnected, at most once per 12 hours unless the user taps refresh. It caches validated suggestions for offline use. This does not run in the background on a closed iPhone app and does not back up private user data.

Feed schema is enforced by `travel-app/daily-feed.mjs`. Keep stable item IDs, per-item checkedAt dates, source URLs and explicit uncertainty in caution. Do not advance an item's checkedAt without reading its source. New dated events need startsOn/endsOn. Retain items referenced by existing plans. No recommendations should say a user has never visited without their visit evidence.

Daily research: recent local blogs and YouTube descriptions/transcripts, then official venue/organizer sources for dates, hours and route metrics. Distinguish publication date from event date; omit expired events from suggestions for future travel dates. Cite a local club or actual Strava evidence before claiming popularity. Subscriber counts and search ranking are not local route usage statistics. Never make GPX geometry up.

Validate with `node scripts/build-travel.mjs && node --test tests/*.test.mjs && npm run build`, then use a reviewed PR and check deployment. Read current main first to avoid concurrent edits. Public recommendations can be deployed under the user's daily-update authorization; do not publish personal travel data.

Private Gmail reservation updates, user's GPX tracks, photo GPS, bookings, email and visited history must never be committed here. Save versioned private backups in the user's private files. Use an authorized private sync path if available. Otherwise provide `travel-enrichment` JSON for More → 코스·숙박 확인 자료 반영, and say explicitly that phone import is still pending. This import matches existing route ID + name + year and preserves user notes, favorites, schedules and manually assigned categories. Mismatches are skipped. It retains a recoverable pre-import backup. A full backup is only for initial setup/recovery, never an automatic replacement of current phone data.

New routes may be carried in the private enrichment file as `addRoutes` only when an official organizer page supplies both an individual public Strava route and its GPX. Additions use a stable `public_` ID, are skipped when the ID or Strava URL already exists, and never overwrite a user's route. Keep the GPX original in the private backup; do not commit GPX geometry or the enrichment file to this public repository.

Confirmed recurring-club details may be appended to already scheduled private days with `dayNotes`. Each patch must match the existing day ID, date and route ID, cite an HTTPS source and checked date, and append rather than replace the user's note. A recurring schedule never proves that a specific future date will run; keep that uncertainty explicit. Never publish the dated private plan in the public feed.

Report research, backup, app deployment and private-device synchronization separately. Gmail can be read through its connected account; browser Strava sessions and Mac Photos are not guaranteed to be available in a scheduled run. Report missing access instead of pretending those are permanently connected.
