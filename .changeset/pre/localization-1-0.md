---
"gavia-ui": major
---

Prepare the 1.0 localization migration: use English as the fallback for built-in
control text and calendar names, including missing or invalid fields in partial
locales. Applications that relied on implicit Russian must configure WlConfig
with wlLocaleRu; spread that preset before adding Russian overrides.

Remove literal Russian defaults from the 13 localized components and the internal
useWlLocaleText helper. Text overrides stay optional strings: omitted/undefined
values follow the reactive app locale, explicit strings including empty strings
win. Locale reset returns only that application to English; SSR configuration
remains scoped to each application/request.

Update source manifests, consumer type cases, examples, EN/RU guides and the
1.0 migration notes. This breaking migration is included in the prepared
1.0.0-rc.1 source. Follow docs/migration-1.0.0-rc.1.md for the opt-in candidate
and docs/migration.md#migration-1-0-localization for the upgrade steps.
Candidate verification and generated package copies remain pending.
