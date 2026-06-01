# Branch Protection Rulesets Runbook

Repository: `jeflowers/atelierlasik`
Default branch: `main`
Owner of this runbook: Engineering
Last reviewed: 2026-05-08

## Purpose

Protect critical branches (`main`, `release/*`) from force pushes, deletion, and
unreviewed merges. Rulesets are the modern replacement for classic branch
protection rules and allow layered, named policies that can target multiple
branches with a single definition.

Reference: [GitHub docs — About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)

## When to use this runbook

- Onboarding a new long-lived branch that needs protection
- Hardening an existing branch after an incident
- Reviewing quarterly to verify rules match current CI jobs
- Adding required status checks after new CI workflows are introduced

---

## Tutorial: Create the "Protect main" ruleset

### Step 1 — Navigate to Rulesets

1. Open <https://github.com/jeflowers/atelierlasik>
2. Click **Settings** (top nav, requires admin access)
3. In the left sidebar under **Code and automation**, click **Rules → Rulesets**
4. Click **New ruleset → New branch ruleset**

### Step 2 — Name and enforcement

| Field | Value |
|---|---|
| Ruleset name | `Protect main` |
| Enforcement status | `Active` |
| Bypass list | (leave empty — no bypass for anyone initially) |

> **Do not** add yourself to the bypass list "just in case." If something needs
> to bypass, add it intentionally and document it in the Notion tracker.

### Step 3 — Target branches

1. Under **Target branches**, click **Add target → Include default branch**
2. (Optional) Click **Add target → Include by pattern** and add `refs/heads/release/*`

### Step 4 — Branch protections (rules)

Enable these toggles in order:

1. **Restrict deletions** — blocks `git push --delete` on protected branches
2. **Block force pushes** — blocks `git push --force` / `--force-with-lease`
3. **Require a pull request before merging**
   - Required approvals: `1` (raise to `2` once the team grows)
   - Dismiss stale pull request approvals when new commits are pushed: ON
   - Require review from Code Owners: ON (create `.github/CODEOWNERS` first)
   - Require approval of the most recent reviewable push: ON
4. **Require status checks to pass**
   - Require branches to be up to date before merging: ON
   - Add these checks (names must match GitHub Actions job names exactly):
     - `build` (Vite build succeeds)
     - `lint` (ESLint passes)
     - `test` (Vitest unit tests pass)
     - `test:e2e` (Playwright e2e tests pass) — add once CI is wired
5. **Require conversation resolution before merging** — ON
6. **Require signed commits** — ON (requires contributors to configure GPG/SSH signing)
7. **Require linear history** — ON (prevents merge commits; forces squash/rebase)
8. **Require deployments to succeed** — only if you add a staging deploy workflow

Click **Create** at the bottom of the page.

### Step 5 — Verify

Run each of these from a throwaway branch. Every one should be rejected:

```bash
# Attempt direct push to main
git checkout main
echo "test" >> README.md
git commit -am "bypass test"
git push origin main
# Expected: "protected branch hook declined"

# Attempt force push
git push --force origin main
# Expected: "refusing to allow ... to force-push"

# Attempt delete
git push origin --delete main
# Expected: "refusing to delete the current branch"
```

Document the output of each verification in the Notion tracker (link below).

---

## Related: Tag protection ruleset

Create a second ruleset to protect release tags:

- Name: `Protect release tags`
- Target: **Tags matching pattern** `v*`
- Rules: **Restrict deletions**, **Block force pushes**, **Restrict updates**

---

## Ongoing monitoring

### Weekly (automated, eventually)

- Review audit log for ruleset bypasses: `Settings → Logs → Audit log`, filter
  `action:repository_ruleset.bypass`
- Any bypass must be accompanied by a Notion entry justifying it

### Monthly

- Confirm status check names still match active CI workflows — rename in ruleset
  if a workflow renames its job
- Review the CODEOWNERS file; stale owners cause approval friction

### Quarterly

- Re-run the Step 5 verification commands
- Review the bypass list; remove stale entries
- Update required approvals count based on team size

### After an incident

- If a hotfix required bypass, add the justification to Notion the same day
- Schedule a retro: could the fix have gone through the normal PR path?

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Required status check `build` is expected" hangs forever | Workflow file renamed the job | Update ruleset check name OR revert workflow rename |
| Admin cannot merge their own PR | Self-approval blocked (correct!) | Ask a teammate to approve |
| Dependabot PRs blocked | Dependabot is not in CODEOWNERS | Add an auto-approve workflow (not a bypass) |
| Can't push commit with unsigned history | Signed commits rule | Configure signing locally; see GitHub docs on commit signature verification |

---

## Changelog

| Date | Change | By |
|---|---|---|
| 2026-05-08 | Initial runbook created | Engineering |
