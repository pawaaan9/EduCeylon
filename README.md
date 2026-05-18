# EduCeylon Frontend

Modern web frontend for **EduCeylon** — Sri Lanka's online lecture marketplace.
Built with **Next.js 16**, **React 19**, **Tailwind v4** and a tiny custom i18n
layer that supports **English, Sinhala and Tamil**.

## Stack

- Next.js 16 (App Router, Turbopack, React 19)
- Tailwind CSS v4 (theme tokens via `@theme`)
- TypeScript strict mode
- Custom `I18nProvider` + dictionaries (no extra dependencies)
- Google Fonts: Inter (Latin), Noto Sans Sinhala, Noto Sans Tamil

## Getting started

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

### Environment

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Routes

### Public marketplace `(public)`
- `/` — landing page (hero, categories, featured courses, lecturers, live, CTA)
- `/courses` — searchable course listing with filters
- `/courses/[slug]` — course detail page
- `/lecturers` — lecturer discovery
- `/lecturers/[slug]` — lecturer public profile
- `/about` — about EduCeylon

### Authentication `(auth)`
- `/login` — sign in
- `/register` — sign up with student/lecturer role chooser

### Student portal `/student/*`
- Dashboard, My Courses, Live Classes, Progress, Wishlist, Notifications, Settings

### Lecturer portal `/lecturer/*`
- Dashboard with revenue chart, Courses, Create Course form,
  Live Classes, Students, Analytics, Earnings, Announcements, Settings

### Admin portal `/admin/*`
- Dashboard, Lecturers, Students, Courses moderation, Categories,
  Reports, Announcements, Settings

## Multi-language

- Three supported locales: `en`, `si`, `ta`
- Switcher in the header on every page (public, auth, dashboards)
- Selection persists in `localStorage` and updates `<html lang>` so Sinhala
  and Tamil fonts render correctly
- All strings live in `lib/i18n/dictionaries.ts`

## Folder structure

```
app/
  (public)/         # marketplace pages with site header/footer
  (auth)/           # login & register with split-screen layout
  student/          # student dashboard pages (sidebar shell)
  lecturer/         # lecturer dashboard pages (sidebar shell)
  admin/            # admin dashboard pages (sidebar shell)
components/         # reusable UI: cards, shell, icons, etc.
lib/
  data/             # typed mock data layer (courses, lecturers)
  i18n/             # I18nProvider, config, dictionaries, language switcher
```

## Production build

```bash
npm run build
```

The build pre-renders 47+ routes including all dynamic course and lecturer
profile pages.
