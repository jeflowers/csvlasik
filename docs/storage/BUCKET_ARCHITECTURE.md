# Storage Bucket Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Storage                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Public    │  │    Public    │  │   Private    │         │
│  │   Buckets    │  │   Buckets    │  │   Buckets    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                   │                 │
│  ┌──────▼──────┐   ┌──────▼──────┐    ┌──────▼──────┐         │
│  │   media     │   │testimonials │    │ documents   │         │
│  │ procedures  │   │    team     │    │             │         │
│  └─────────────┘   └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │      CDN Distribution    │
              │    (Automatic Caching)   │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │      End Users          │
              │  (Fast Global Access)   │
              └─────────────────────────┘
```

## Bucket Details

### 1. MEDIA Bucket (Public)

```
media/
├── articles/                    # Article featured images
│   ├── 1234567890-abc123-featured.jpg
│   └── 1234567891-def456-hero.png
│
├── blog/                        # Blog post images
│   └── 1234567892-ghi789-post.jpg
│
├── general/                     # General website images
│   ├── banners/
│   └── backgrounds/
│
├── educational/                 # Educational content
│   └── diagrams/
│
├── innovation/                  # Innovation articles
├── procedures/                  # Procedure-related
├── technology/                  # Technology articles
└── mission/                     # Mission content

Access: 🌍 Public Read | 🔒 Admin/Editor Write
Max Size: 10 MB
Types: JPEG, PNG, WebP, GIF, SVG
```

### 2. TESTIMONIALS Bucket (Public)

```
testimonials/
├── images/
│   ├── 123/                     # Testimonial ID 123
│   │   ├── patient-photo.jpg
│   │   └── before-after.jpg
│   └── 124/                     # Testimonial ID 124
│       └── success-story.jpg
│
└── videos/
    ├── 123/
    │   └── patient-story.mp4
    └── 125/
        └── testimonial-video.mp4

Access: 🌍 Public Read | 🔒 Admin/Editor Write
Max Size: 10 MB (images), 100 MB (videos)
Types: JPEG, PNG, WebP, MP4, MOV
```

### 3. PROCEDURES Bucket (Public)

```
procedures/
├── lasik/                       # LASIK procedure images
│   ├── process/
│   │   ├── step-01-examination.png
│   │   ├── step-02-flap-creation.png
│   │   ├── step-03-laser-reshaping.png
│   │   └── step-04-recovery.png
│   ├── technology/
│   │   └── advanced-technology-overview.png
│   └── results/
│
├── prk/                         # PRK procedure images
│   ├── process/
│   └── comparison/
│
├── icl/                         # ICL procedure images
│   └── implant-diagram.svg
│
└── educational/                 # General educational content
    ├── eye-anatomy.svg
    └── vision-correction.png

Access: 🌍 Public Read | 🔒 Admin/Editor Write
Max Size: 10 MB
Types: JPEG, PNG, WebP, SVG
```

### 4. TEAM Bucket (Public)

```
team/
├── doctors/                     # Doctor headshots
│   ├── dr-flowers-headshot.jpg
│   ├── dr-smith-profile.jpg
│   └── dr-johnson-photo.jpg
│
└── staff/                       # Staff photos
    ├── receptionist-team.jpg
    └── nurses-group.jpg

Access: 🌍 Public Read | 🔒 Admin Only Write
Max Size: 10 MB
Types: JPEG, PNG, WebP
```

### 5. DOCUMENTS Bucket (Private)

```
documents/
├── {user-uuid-1}/
│   ├── gdpr/                    # GDPR data exports
│   │   ├── data-export-2024-01.json
│   │   └── consent-record.pdf
│   │
│   ├── compliance/              # Compliance documents
│   │   └── signed-consent.pdf
│   │
│   └── general/                 # User documents
│       └── medical-history.pdf
│
└── {user-uuid-2}/
    └── gdpr/
        └── deletion-request.json

Access: 🔒 Private (Owner + Admins Only)
Max Size: 20 MB
Types: PDF, DOC, DOCX, TXT, JSON
```

## Data Flow

### Upload Flow

```
┌──────────────┐
│   User in    │
│ Admin Panel  │
└──────┬───────┘
       │
       │ 1. Select File
       ▼
┌──────────────────────┐
│ storageService       │
│ .uploadMediaFile()   │
└──────┬───────────────┘
       │
       │ 2. Validate (size, type)
       │ 3. Generate unique filename
       │ 4. Upload to bucket
       ▼
┌──────────────────────┐
│  Supabase Storage    │
│  (with RLS check)    │
└──────┬───────────────┘
       │
       │ 5. Return public URL
       ▼
┌──────────────────────┐
│   Save to Database   │
│  (media/articles/    │
│   testimonials)      │
└──────────────────────┘
```

### Access Flow

```
┌──────────────┐
│  End User    │
│  (Website)   │
└──────┬───────┘
       │
       │ 1. Request image URL
       ▼
┌──────────────────────┐
│  Supabase CDN        │
│  (Edge Caching)      │
└──────┬───────────────┘
       │
       │ 2. Check cache
       │ ├─ Hit: Return cached
       │ └─ Miss: Fetch from storage
       ▼
┌──────────────────────┐
│  Apply RLS Policies  │
│  (Public buckets:    │
│   Allow all reads)   │
└──────┬───────────────┘
       │
       │ 3. Return file
       ▼
┌──────────────────────┐
│   Deliver to User    │
│  (Fast, Optimized)   │
└──────────────────────┘
```

## Security Layer

```
┌─────────────────────────────────────────────┐
│          Row Level Security (RLS)           │
├─────────────────────────────────────────────┤
│                                             │
│  Public Buckets                             │
│  ┌─────────────────────────────────────┐   │
│  │ SELECT: Allow ALL                   │   │
│  │ INSERT: Require authenticated +     │   │
│  │         role IN (admin, editor)     │   │
│  │ DELETE: Require owner OR admin      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Private Buckets (documents)                │
│  ┌─────────────────────────────────────┐   │
│  │ SELECT: auth.uid() = owner OR       │   │
│  │         role = admin                │   │
│  │ INSERT: auth.uid() = owner          │   │
│  │ DELETE: auth.uid() = owner          │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Integration Map

```
Admin Components                Storage Buckets
─────────────────              ───────────────

MediaLibrary.tsx       ────────▶  media/
  └─ Category-based uploads       └─ articles/
                                  └─ blog/
                                  └─ general/

TestimonialsManager    ────────▶  testimonials/
  ├─ Image uploads                ├─ images/{id}/
  └─ Video uploads                └─ videos/{id}/

ArticlesManager        ────────▶  media/
  └─ Featured images              └─ {category}/

ProceduresPage         ────────▶  procedures/
  └─ Educational content          ├─ lasik/
                                  ├─ prk/
                                  └─ icl/

AboutPage              ────────▶  team/
  └─ Team photos                  ├─ doctors/
                                  └─ staff/

GDPRManager            ────────▶  documents/
  └─ User data exports            └─ {userId}/gdpr/
```

## File Naming Convention

All uploaded files use this naming pattern:

```
{timestamp}-{random}-{sanitized-original-name}.{ext}

Example:
1698765432-a3b5c7-dr-flowers-headshot.jpg
├─────────┤ ├────┤ ├─────────────────────┤ ├┤
timestamp  random   sanitized name       ext

Benefits:
✅ Unique filenames (no collisions)
✅ Sortable by upload time
✅ Traceable to original name
✅ URL-safe characters only
```

## Performance Optimization

### Image Transformations

```
Original Request:
media/articles/large-image.jpg (5 MB, 4000x3000)

Transformed URL:
/render/image/width=800/quality=80/format=webp/
  media/articles/large-image.jpg

Result:
✅ 800px width
✅ WebP format (smaller size)
✅ 80% quality (optimized)
✅ ~200 KB (vs 5 MB)
✅ Cached at CDN edge
```

### Benefits

| Feature | Benefit |
|---------|---------|
| CDN Caching | 🚀 Fast global delivery |
| Image Transforms | 📉 Reduced bandwidth |
| RLS Policies | 🔒 Secure access control |
| Organized Paths | 📁 Easy file management |
| Unique Names | ✅ No file conflicts |
| Type Validation | 🛡️ Upload security |

## Maintenance Tasks

### Weekly
- [ ] Review storage usage in Supabase Dashboard
- [ ] Check for failed uploads in logs

### Monthly
- [ ] Run cleanup function for orphaned files
- [ ] Audit file organization
- [ ] Review access patterns

### Quarterly
- [ ] Analyze storage costs
- [ ] Optimize bucket structure if needed
- [ ] Review RLS policies

## Cost Optimization

```
Free Tier Limits (Supabase):
├─ Storage: 1 GB
├─ Bandwidth: 2 GB/month
└─ Transformations: 100 origin images

Tips to Stay Within Limits:
1. Use image transformations (caches smaller versions)
2. Run cleanup function regularly
3. Compress images before upload
4. Use WebP format (50% smaller than JPEG)
5. Set appropriate quality levels (80% is usually fine)
```

## Disaster Recovery

### Backup Strategy

1. **Database References**: All file paths stored in database
2. **Supabase Backups**: Automatic daily backups
3. **Critical Files**: Keep local copies of essential media
4. **Export Function**: Use Supabase API to bulk export if needed

### Recovery Process

```bash
# Export all files from a bucket
supabase storage export media ./backup/media

# Restore files
supabase storage import media ./backup/media
```

## Troubleshooting Guide

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Upload fails | File too large | Check size limits per bucket |
| 403 Forbidden | RLS policy block | Verify user authentication/role |
| 404 Not Found | Wrong path | Verify bucket and path are correct |
| Slow uploads | Large file | Compress before upload |
| Missing files | Not in database | Check database references |

## Future Enhancements

- [ ] Add thumbnail generation
- [ ] Implement automatic image optimization
- [ ] Add virus scanning for uploads
- [ ] Create file preview system
- [ ] Add bulk migration tool
- [ ] Implement versioning for critical files
- [ ] Add watermarking for sensitive images

---

**Architecture Status**: ✅ Fully Implemented and Documented
