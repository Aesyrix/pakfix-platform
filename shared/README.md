# shared/

Reference material every client is kept honest against.

| Path | Purpose |
|---|---|
| `constants/domain.json` | The domain vocabulary: roles, statuses, safety levels, limits, formats |

Nothing here is read at runtime. Laravel's enums (`backend/app/Enums`) and the frontend's types
(`frontend/src/lib/api/types.ts`) are the working implementations; this directory is the single
written statement of what they must agree on, and the first place to look when adding a value.

When a value changes:

1. Update `constants/domain.json`.
2. Update the matching PHP enum.
3. Update the matching TypeScript union.
4. Note it in `docs/api.md` if a client can see it.
