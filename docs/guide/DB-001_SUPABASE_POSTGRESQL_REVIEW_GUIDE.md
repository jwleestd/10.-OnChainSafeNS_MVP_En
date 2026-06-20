# DB-001 Supabase PostgreSQL Review And Setup Guide

## Purpose

This guide is for reviewing and validating DB-001:

> Prisma datasource setup for a single Supabase PostgreSQL environment.

DB-001 cannot be fully closed by code review alone. Code review can confirm that the Prisma/PostgreSQL wiring is shaped correctly, but actual completion requires a real Supabase PostgreSQL connection test with project-specific credentials.

## Current Merge Order Check

As of the current GitHub state:

| PR | Scope | Status | Mergeability |
|---|---|---|---|
| #177 | Phase-0 docs and Agent Harness alignment | Ready for review | Clean into current `main` |
| #176 | Phase-0 implementation and Playwright gate | Ready for review | Clean into current `main` |

Recommended merge order:

1. Merge PR #177 first.
2. Update PR #176 from the new `main`.
3. Resolve any drift in PR #176 before merging it.
4. Run DB-001 Supabase validation on the updated PR #176 branch.
5. Merge PR #176 only after the DB validation result is recorded.

Why #177 first:

- PR #177 defines the product and agent-harness decisions that implementation should follow.
- PR #176 is the implementation PR and should be reviewed against that settled baseline.
- Both PRs currently touch some overlapping repository hygiene areas, especially `.gitignore` and prompt files. Merging #177 first makes the intended documentation/harness baseline explicit.

Expected PR #176 cleanup after #177 lands:

- Keep the `.gitignore` rules from #177 and add any code-specific ignore rules needed by #176, such as `/src/generated/prisma`.
- Keep prompt cleanup from #177. Do not reintroduce split workflow prompts from #176.
- Remove committed `.env` from PR #176. Real secrets or environment files must remain local only.
- Keep `.env.example` as the committed template.
- Re-run `npm run build` and `npm run test:e2e` after updating the branch.

## DB-001 Review Checklist

Code review can pass when these are true:

- `prisma/schema.prisma` uses `datasource db { provider = "postgresql" }`.
- Runtime Prisma client uses PostgreSQL through `@prisma/adapter-pg` and `pg`.
- `DATABASE_URL` is used by runtime DB access.
- `.env.example` documents the required variables without real credentials.
- `.env`, `.env.local`, and other real environment files are ignored and not committed.
- Prisma scripts exist for migration, generation, seeding, and Studio.

Review caveat for the current PR #176 implementation:

- `DIRECT_URL` is documented in `.env.example`, but the current `prisma.config.ts` only wires `DATABASE_URL`.
- If DB-001 acceptance explicitly requires both `url` and `directUrl` behavior, request a PR #176 change before closing DB-001.
- If Phase-0 accepts a single Supabase PostgreSQL URL for both migration and runtime, record that as an intentional Phase-0 simplification.

DB-001 is fully complete only after these pass against a real Supabase project:

- Prisma can connect to Supabase.
- Prisma migration creates the Phase-0 tables.
- Prisma client generation succeeds.
- Seed execution succeeds.
- Basic row counts match the Phase-0 seed target.

## Important Environment File Note

Next.js automatically reads `.env.local` during app runtime.

The current `prisma.config.ts` imports `dotenv/config`, which normally reads `.env` for Prisma CLI commands. Therefore, for local Prisma CLI validation, use one of these approaches:

| Approach | When to use |
|---|---|
| Create local `.env` with DB variables | Simplest for `npm run db:migrate`, `npm run db:seed`, and `npm run db:studio` |
| Set `DATABASE_URL` in the current shell | Good for one-off validation without creating `.env` |
| Also keep `.env.local` | Needed for local Next.js runtime |

Do not commit `.env` or `.env.local`.

## Supabase Setup Steps

1. Create or open the Supabase project.

2. In Supabase SQL Editor, create a dedicated Prisma database role.

```sql
create user "prisma" with password 'replace_with_strong_password' bypassrls createdb;
grant "prisma" to "postgres";

grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;

alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

3. In Supabase Dashboard, open the project connection panel.

4. Prepare connection strings.

Use the Supabase-provided connection string, not a hand-written guess.

For local Prisma migration and local app testing, use a connection string that supports the Prisma CLI reliably. Supabase's Prisma guide currently recommends the Supavisor session pooler string for `DATABASE_URL`; direct connection can also be used when the network environment supports it.

For serverless or auto-scaling deployment, Supabase documents the transaction pooler string as the runtime-oriented option. If the project later separates migration and runtime URLs, keep both variables available:

```env
DATABASE_URL="postgresql://prisma.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://prisma.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
```

For the current DB-001 local validation, prefer the connection string that Prisma migration can use successfully, then record which one was used. If migrations must use `DIRECT_URL`, update `prisma.config.ts` before marking DB-001 done.

5. Create local environment files.

Create `.env` for Prisma CLI:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Create `.env.local` for Next.js runtime:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
RESEND_API_KEY="re_xxxxxxxxxx"
FROM_EMAIL="noreply@yourdomain.com"
ADMIN_ID="admin"
ADMIN_PASSWORD="change-me-in-production"
ADMIN_SESSION_MINUTES="30"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

6. Validate Prisma connection and migration.

Run these from the branch that contains PR #176 after it has been updated from the latest `main`:

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

7. Validate seed counts.

Use Prisma Studio or Supabase SQL Editor.

Expected Phase-0 seed baseline:

| Table | Expected count |
|---|---:|
| `fraud_addresses` | 30 |
| `safe_names` | 10 |
| `users` | 5 |
| `operators` | 1 |

Scalability acceptance target:

| Table | Expected count |
|---|---:|
| `fraud_reports` | 100 |

8. Run application-level checks.

```powershell
npm run build
npm run test:e2e
```

If E2E is intentionally using `E2E_MEMORY_DB=1`, treat that as app-flow validation, not as Supabase DB validation.

## Review Decision Template

Use this when approving DB-001 before real Supabase validation:

```md
DB-001 code review: approved with external validation pending.

The Prisma datasource is configured for PostgreSQL and the implementation is shaped for Supabase/Postgres usage.
Actual Supabase connection validation has not yet been completed because project-specific DATABASE_URL/DIRECT_URL values are required.

Before closing DB-001 as Done:
- remove any committed .env file from the PR,
- run Prisma migration against the real Supabase project,
- run seed,
- verify Phase-0 seed counts,
- record the validation output in the PR or issue.
```

Use this when validation passes:

```md
DB-001 validated against Supabase PostgreSQL.

Validated:
- Prisma client generation succeeded
- Migration succeeded
- Seed succeeded
- Phase-0 seed counts matched expected baseline
- Build completed after DB setup

DB-001 can be moved to Done after PR merge.
```

## External References

- Supabase Prisma guide: https://supabase.com/docs/guides/database/prisma
- Supabase database connection guide: https://supabase.com/docs/guides/database/connecting-to-postgres
