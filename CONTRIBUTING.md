# How we work

## The one rule

**Nobody pushes to `main` directly.** Every change goes through a branch and a pull request (PR).

## Everyday flow

```bash
git checkout main
git pull                          # get everyone else's changes first
git checkout -b feat/short-name   # e.g. feat/bahasa-ui, fix/map-zoom, data/kutek-warungs
# …make changes…
pnpm check                        # must pass
git add -A
git commit -m "Add Kutek warungs to data"
git push -u origin feat/short-name
```

Then open the PR on GitHub. Someone else on the team:

1. opens the **Vercel preview link** on the PR and tries it on their phone,
2. checks the green ✓ from CI,
3. approves → **Squash and merge**.

## Branch names

`feat/…` new feature · `fix/…` bug fix · `data/…` food data only · `docs/…` documentation

## Tasks

One task = one GitHub Issue. Assign yourself before starting so two people don't do the same thing.
Link the PR to the issue ("Closes #12") so it closes automatically.

## Repo settings (owner does this once)

GitHub → Settings → Branches → **Add branch protection rule** for `main`:
- Require a pull request before merging (1 approval)
- Require status checks to pass → select **check**

## Using AI (Claude etc.) on this repo

Point it at `README.md` and `DECISIONS.md` first. If the AI suggests something that contradicts DECISIONS.md,
that's a discussion for the team, not a silent change.
