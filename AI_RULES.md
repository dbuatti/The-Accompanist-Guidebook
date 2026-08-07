# Tech Stack

- Next.js 14 (App Router) + TypeScript. NOT React Router / Vite.
- Routes live in `src/app/` (e.g. `src/app/modules/page.tsx`, `src/app/admin/page.tsx`).
- Server actions live in `src/app/actions.ts` and `src/app/actions/lessonContent.ts`.
- Client components go in `src/components/`, hooks in `src/hooks/`, shared utils in `src/lib/` and `src/utils/`.
- Database layer: Drizzle ORM against Neon Postgres (`src/lib/schema.ts`, `src/lib/db.ts`).
- Auth: Neon Auth (`@neondatabase/auth`), admin emails centralized in `src/lib/admin.ts`.
- Styling: Tailwind CSS for all components. Reuse the existing utility classes and design language.
- ALWAYS try to use the shadcn/ui library. Components live in `src/components/ui/` — don't edit them; build new components in `src/components/` if you need changes.
- Available packages include lucide-react (icons), sonner (toasts), and all Radix primitives.
- Videos use `src/components/VideoPlayer.tsx`. YouTube URLs can contain `&v=` or `v=` params — keep them intact.
- Run checks with: `pnpm lint` (ESLint) and `pnpm build` (Next typecheck + build).
