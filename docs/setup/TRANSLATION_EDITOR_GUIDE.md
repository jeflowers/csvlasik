# Translation Editor Guide

**Date**: November 17, 2025
**Feature**: Add/Update Translations via Admin Interface
**Location**: `/admin/translations/editor`

---

## Overview

The Translation Editor provides a comprehensive interface for managing translations across all 12 supported languages. Admins can add new translation keys, update existing translations, and manage translations by namespace.

## Features

### ✅ Complete Translation Management

1. **View All Translations**
   - Browse translations by namespace
   - Search across keys and content
   - Visual completion percentage per key
   - Grid display of all language translations

2. **Add New Translations**
   - Create new translation keys
   - Support for nested keys (dot notation)
   - Add translations for all 12 languages at once
   - Real-time validation

3. **Edit Existing Translations**
   - Inline editing for all languages
   - Copy key to clipboard
   - Visual language indicators with flags
   - Save changes to database

4. **Delete Translations**
   - Remove translation keys
   - Confirmation dialog for safety
   - Removes from database cache

5. **Export Translations**
   - Export to JSON format
   - Organized by language
   - Nested structure preserved
   - Download as file

6. **Namespace Management**
   - 17 namespaces supported
   - Filter translations by namespace
   - Namespace-specific exports

---

## Supported Languages

All 12 ClearSight languages are fully supported:

| Code | Language | Flag | RTL |
|------|----------|------|-----|
| en | English | 🇺🇸 | No |
| es-MX | Spanish (Mexico) | 🇲🇽 | No |
| zh | Chinese (Simplified) | 🇨🇳 | No |
| tl | Tagalog | 🇵🇭 | No |
| vi | Vietnamese | 🇻�� | No |
| ko | Korean | 🇰🇷 | No |
| ar | Arabic | 🇸🇦 | Yes |
| pt-BR | Portuguese (Brazil) | 🇧🇷 | No |
| ja | Japanese | 🇯🇵 | No |
| hy | Armenian | 🇦🇲 | No |
| he | Hebrew | 🇮🇱 | Yes |

---

## Namespaces

The editor supports 17 content namespaces:

1. **common** - Common UI elements, buttons, labels
2. **navigation** - Menu items, breadcrumbs
3. **home** - Homepage content
4. **about** - About page content
5. **procedures** - Procedure descriptions
6. **technology** - Technology page content
7. **financing** - Financing information
8. **contact** - Contact page content
9. **media** - Media/blog section
10. **testimonials** - Patient testimonials
11. **forms** - Form labels and validation
12. **medical** - Medical terminology
13. **footer** - Footer content
14. **privacy** - Privacy policy
15. **terms** - Terms of service
16. **cookies** - Cookie consent
17. **pacific** - Pacific Story content

---

## How to Use

### Access the Editor

1. Log in to admin panel: `/admin/login`
2. Navigate to **Translations** in sidebar
3. Click **Edit Translations** button
4. Or go directly to `/admin/translations/editor`

### Add a New Translation

1. Click **Add Translation** button
2. Enter translation key (e.g., `welcome.title`)
3. Enter translations for each language
4. Click **Add Translation**

**Example**:
```
Key: hero.tagline
English: Revolutionary Vision Care
Spanish: Cuidado de Visión Revolucionario
Chinese: 革命性视力护理
...
```

### Edit an Existing Translation

1. Find the translation using search or browse
2. Click the **Edit** (pencil) icon
3. Modify translations in any language
4. Click **Save** to persist changes
5. Click **Cancel** to discard changes

### Delete a Translation

1. Find the translation you want to remove
2. Click the **Delete** (trash) icon
3. Confirm deletion in the dialog
4. Translation is removed from cache

### Search Translations

1. Use the search box at the top
2. Searches both keys and content
3. Results update in real-time
4. Works across all languages

### Export Translations

1. Select a namespace
2. Click **Export** button
3. Downloads JSON file with all languages
4. Format: `translations-{namespace}.json`

**Export Format**:
```json
{
  "en": {
    "welcome": {
      "title": "Welcome to ClearSight"
    }
  },
  "es-MX": {
    "welcome": {
      "title": "Bienvenido a ClearSight"
    }
  }
}
```

---

## Translation Key Naming

Use dot notation for nested keys:

### Good Examples ✅
```
common.buttons.submit
home.hero.title
procedures.lasik.description
forms.contact.labels.name
```

### Bad Examples ❌
```
submit_button (use camelCase or dots)
home-hero-title (use dots, not dashes)
LASIK_DESC (avoid all caps)
```

### Best Practices

1. **Use descriptive names**: `contact.form.email.label` vs `cf_e`
2. **Group related keys**: Keep all form fields under `forms.*`
3. **Be consistent**: Follow existing patterns in the namespace
4. **Avoid abbreviations**: Write out full words for clarity
5. **Use sections**: `section.subsection.element.property`

---

## Database Storage

### Translation Cache Table

Translations are stored in the `translation_cache` table:

```sql
CREATE TABLE translation_cache (
  id bigint PRIMARY KEY,
  source_text text NOT NULL,          -- Translation key
  target_language text NOT NULL,      -- Language code
  translated_text text NOT NULL,      -- Translated content
  source_language text DEFAULT 'en',  -- Source language
  namespace text DEFAULT 'common',    -- Content namespace
  last_used timestamptz,              -- Last accessed
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE (source_text, target_language, namespace)
);
```

### Upsert Logic

The editor uses **upsert** operations (INSERT or UPDATE):

```typescript
await supabase
  .from('translation_cache')
  .upsert({
    source_text: key,
    target_language: lang,
    translated_text: text,
    namespace: selectedNamespace
  }, {
    onConflict: 'source_text,target_language,namespace'
  });
```

This means:
- New translations are **inserted**
- Existing translations are **updated**
- No duplicates possible

---

## Permissions

### Required Roles

Only users with these roles can access the editor:

- **super_admin** - Full access
- **admin** - Full access
- **editor** - Full access
- **content_creator** - Read-only (cannot save)

### RLS Policies

Two policies control access:

1. **"Admins manage translations"**
   - Allows INSERT, UPDATE, DELETE
   - Checks user role via `user_roles` table
   - Must be authenticated

2. **"Public can read translations"**
   - Allows SELECT for everyone
   - Used by public website for i18n
   - No authentication required

---

## Integration with i18next

### Static Files

The editor complements static translation files in `/public/locales/{lang}/{namespace}.json`

**Priority Order**:
1. Static JSON files (fastest)
2. Database cache (fallback)
3. Translation API (DeepL/Google)
4. Original text (last resort)

### Loading Translations

The editor **reads** from static files but **writes** to database:

```typescript
// Reading (from static files)
const response = await fetch(`/locales/${lang}/${namespace}.json`);
const translations = await response.json();

// Writing (to database)
await supabase.from('translation_cache').upsert({...});
```

### Syncing to Files

To sync database translations to static files:

1. Export translations from editor
2. Save JSON to `/public/locales/{lang}/{namespace}.json`
3. Commit to version control
4. Deploy with application

---

## Performance Considerations

### Caching Strategy

- Database queries are cached by Supabase
- Browser caches translation files
- Service Worker can cache for offline use

### Indexing

Four indexes optimize performance:

1. `UNIQUE (source_text, target_language, namespace)` - Upsert operations
2. `idx_translation_cache_namespace` - Namespace filtering
3. `idx_translation_cache_target_language` - Language filtering
4. Primary key on `id` - Row lookups

### Batch Operations

When adding multiple translations:

- Add all languages for one key at once
- Reduces round trips to database
- Uses transaction for consistency

---

## Workflow Examples

### Example 1: Adding Homepage Hero Text

**Goal**: Add new hero section text

1. Go to `/admin/translations/editor`
2. Select namespace: **home**
3. Click **Add Translation**
4. Enter key: `hero.newTagline`
5. Fill in translations:
   - English: "Experience Perfect Vision"
   - Spanish: "Experimenta la Visión Perfecta"
   - Chinese: "体验完美视力"
   - (continue for all languages)
6. Click **Add Translation**
7. ✅ Translation saved to database

**Use in code**:
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('home');
<h2>{t('hero.newTagline')}</h2>
```

### Example 2: Updating Contact Form Label

**Goal**: Change "Your Email" to "Email Address"

1. Go to `/admin/translations/editor`
2. Select namespace: **forms**
3. Search for: "email"
4. Find key: `contact.labels.email`
5. Click **Edit** icon
6. Update English: "Email Address"
7. Update translations in other languages
8. Click **Save**
9. ✅ Changes reflected immediately

### Example 3: Bulk Export for Professional Translation

**Goal**: Send all medical terminology to professional translator

1. Select namespace: **medical**
2. Review all entries
3. Click **Export** button
4. Download `translations-medical.json`
5. Send to translation service
6. Receive translated JSON
7. Import back to editor (add translations one by one)
8. ✅ Professional translations integrated

---

## Troubleshooting

### "Translation saved successfully" but not showing on website

**Cause**: Website uses static files, not database
**Solution**:
1. Export translations from editor
2. Update static JSON files in `/public/locales/`
3. Restart dev server or redeploy

### Cannot save translations - "Not authenticated"

**Cause**: Session expired or insufficient permissions
**Solution**:
1. Log out and log back in
2. Verify your role is admin/editor
3. Check browser console for errors

### Search not finding translations

**Cause**: Translation might be in different namespace
**Solution**:
1. Check all namespaces
2. Search is case-insensitive
3. Try searching partial text

### Completion percentage stuck at 0%

**Cause**: No translations entered yet
**Solution**:
1. Click Edit and add at least one translation
2. Percentage updates based on filled languages
3. Need all 12 languages for 100%

### Export file is empty

**Cause**: No translations in selected namespace
**Solution**:
1. Add translations first
2. Check correct namespace is selected
3. Try different namespace

---

## API Reference

### Load Translations (GET)

```typescript
// Load from static files
const response = await fetch('/locales/es-MX/home.json');
const translations = await response.json();
```

### Save Translation (Upsert)

```typescript
const { error } = await supabase
  .from('translation_cache')
  .upsert({
    source_text: 'welcome.title',
    target_language: 'es-MX',
    translated_text: 'Bienvenido',
    namespace: 'home',
    source_language: 'en',
    last_used: new Date().toISOString()
  }, {
    onConflict: 'source_text,target_language,namespace'
  });
```

### Delete Translation (DELETE)

```typescript
const { error } = await supabase
  .from('translation_cache')
  .delete()
  .eq('source_text', 'old.key')
  .eq('namespace', 'common');
```

### Query Translations (SELECT)

```typescript
const { data, error } = await supabase
  .from('translation_cache')
  .select('*')
  .eq('namespace', 'home')
  .eq('target_language', 'es-MX');
```

---

## Future Enhancements

### Planned Features

1. **Bulk Import**
   - Upload CSV/JSON files
   - Import multiple translations at once
   - Validation before import

2. **Translation Memory**
   - Suggest similar translations
   - Reuse common phrases
   - Consistency checking

3. **AI Translation Assistant**
   - Auto-translate missing languages
   - Quality scoring
   - Terminology suggestions

4. **Version Control**
   - Track translation changes
   - Revert to previous versions
   - Change history

5. **Collaboration**
   - Multiple editors simultaneously
   - Comments on translations
   - Review workflow

6. **Quality Assurance**
   - Spell checking
   - Grammar validation
   - Consistency rules

---

## Best Practices

### Content Strategy

1. **Write for translation**: Keep English clear and simple
2. **Avoid idioms**: They don't translate well
3. **Be concise**: Shorter text translates better
4. **Use placeholders**: `"Welcome {name}"` vs `"Welcome " + name`
5. **Context matters**: Include context in key names

### Translation Quality

1. **Native speakers**: Use professional translators
2. **Medical accuracy**: Critical for healthcare content
3. **Cultural sensitivity**: Consider cultural differences
4. **Consistency**: Use same terms throughout
5. **Review process**: Have translations reviewed

### Technical Tips

1. **Start with English**: Make it perfect first
2. **Test RTL languages**: Arabic and Hebrew need special attention
3. **Check length**: Some languages expand 30-40%
4. **Use variables**: `{count} patients` handles pluralization
5. **Regular updates**: Keep translations fresh

---

## Support

### Common Questions

**Q: Can I delete a namespace?**
A: No, namespaces are predefined. You can delete individual translations.

**Q: How do I add a new language?**
A: Contact system administrator. Requires code changes.

**Q: Can I edit multiple translations at once?**
A: Not currently. Use export/import for bulk changes.

**Q: What happens if I miss a language?**
A: Website falls back to English for that key.

**Q: Can I use HTML in translations?**
A: Yes, but be careful. Some contexts strip HTML.

### Getting Help

- **Technical Issues**: Check browser console
- **Translation Help**: Contact content team
- **Feature Requests**: Submit to admin
- **Bugs**: Report via admin panel

---

## Summary

The Translation Editor provides complete control over website translations:

✅ **Add** new translation keys
✅ **Update** existing translations
✅ **Delete** obsolete translations
✅ **Export** for external translation
✅ **Search** across all content
✅ **Monitor** completion percentage
✅ **Support** 12 languages
✅ **Manage** 17 namespaces

**Access**: `/admin/translations/editor`
**Permissions**: Admin, Editor roles
**Languages**: All 12 supported
**Status**: Production ready ✅

---

**Last Updated**: November 17, 2025
**Version**: 1.0
**Maintained By**: ClearSight Development Team
