# 💾 Backup & Restore Procedures

Complete guide for backing up and restoring the ClearSight LASIK CMS.

---

## 🎯 Backup Strategy Overview

### What We Backup
1. **Database** - All Supabase tables and data
2. **Storage** - Uploaded media files
3. **Configuration** - Environment variables and settings
4. **Code** - Git repository and deployment history
5. **DNS** - Domain configuration records

### Backup Schedule
- **Automated Daily**: Database (via Supabase)
- **Weekly**: Full system backup
- **Before Deployments**: Pre-deployment snapshot
- **Monthly**: Long-term archive

### Retention Policy
- **Daily backups**: Keep for 7 days
- **Weekly backups**: Keep for 4 weeks
- **Monthly backups**: Keep for 12 months
- **Critical snapshots**: Keep indefinitely

---

## 🗄️ Database Backup

### Automatic Backups (Supabase)

**Supabase Pro Plan Includes:**
- Daily automated backups (kept for 7 days)
- Point-in-time recovery (last 7 days)
- Download backups anytime

**Enable in Dashboard:**
1. Go to **Database** → **Backups**
2. Verify automatic backups are enabled
3. Set backup retention (7 days free, longer with Pro)

### Manual Database Backup

#### Method 1: Supabase Dashboard

**Steps:**
1. Log in to Supabase Dashboard
2. Go to **Settings** → **Database**
3. Under **Connection string**, copy the connection pooler string
4. Click **Create backup** (Pro plan)

#### Method 2: pg_dump via CLI

**Setup:**
```bash
# Install PostgreSQL client tools
brew install postgresql  # macOS
apt-get install postgresql-client  # Ubuntu
```

**Create Backup:**
```bash
# Get connection string from Supabase Dashboard
# Database Settings → Connection string → Connection pooler

# Create backup
pg_dump "postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres" \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump \
  --verbose

# Or as SQL file
pg_dump "postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres" \
  --file=backup_$(date +%Y%m%d_%H%M%S).sql
```

**Backup Script:**
```bash
#!/bin/bash
# File: scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.dump"

# Create backup directory
mkdir -p $BACKUP_DIR

# Get connection string from environment
source .env.production

# Create backup
echo "Creating database backup..."
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file=$BACKUP_FILE \
  --verbose

# Compress backup
gzip $BACKUP_FILE

echo "Backup created: ${BACKUP_FILE}.gz"

# Upload to cloud storage (optional)
# aws s3 cp ${BACKUP_FILE}.gz s3://your-bucket/backups/
# Or: gsutil cp ${BACKUP_FILE}.gz gs://your-bucket/backups/

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "db_backup_*.dump.gz" -mtime +30 -delete

echo "Backup complete!"
```

**Run Backup:**
```bash
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh
```

#### Method 3: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Create backup
supabase db dump -f backup_$(date +%Y%m%d).sql

# With data
supabase db dump --data-only -f backup_data_$(date +%Y%m%d).sql
```

---

## 📦 Storage Backup

### Backup Media Files

**Script to Download All Files:**
```javascript
// File: scripts/backup-storage.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backupStorage() {
  const backupDir = `./backups/storage_${Date.now()}`;
  fs.mkdirSync(backupDir, { recursive: true });

  // List all files in media bucket
  const { data: files, error } = await supabase
    .storage
    .from('media')
    .list();

  if (error) {
    console.error('Error listing files:', error);
    return;
  }

  // Download each file
  for (const file of files) {
    const { data, error } = await supabase
      .storage
      .from('media')
      .download(file.name);

    if (error) {
      console.error(`Error downloading ${file.name}:`, error);
      continue;
    }

    const filePath = path.join(backupDir, file.name);
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    console.log(`Downloaded: ${file.name}`);
  }

  console.log(`Backup complete: ${backupDir}`);
}

backupStorage();
```

**Run:**
```bash
node scripts/backup-storage.js
```

### Sync to Cloud Storage

**AWS S3:**
```bash
aws s3 sync ./backups/storage_latest s3://your-bucket/clearsight-backups/storage/
```

**Google Cloud Storage:**
```bash
gsutil -m rsync -r ./backups/storage_latest gs://your-bucket/clearsight-backups/storage/
```

---

## ⚙️ Configuration Backup

### Environment Variables

**Export from Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link site
netlify link

# Export environment variables
netlify env:list > backups/netlify-env_$(date +%Y%m%d).txt
```

**Export from Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull backups/vercel-env_$(date +%Y%m%d).env
```

**Manual Backup:**
Create a file `backups/production-env-backup.txt`:
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
NODE_ENV=production
```

**Encrypt sensitive files:**
```bash
# Encrypt
gpg --symmetric --cipher-algo AES256 backups/production-env-backup.txt

# Decrypt (when needed)
gpg --decrypt backups/production-env-backup.txt.gpg > restored-env.txt
```

---

## 🔄 Complete Backup Procedure

### Weekly Full Backup

**Script: `scripts/full-backup.sh`**
```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="./backups/full_$DATE"

echo "Starting full system backup..."
mkdir -p $BACKUP_ROOT

# 1. Database backup
echo "Backing up database..."
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file=$BACKUP_ROOT/database.dump
gzip $BACKUP_ROOT/database.dump

# 2. Storage backup
echo "Backing up storage..."
node scripts/backup-storage.js
mv ./backups/storage_* $BACKUP_ROOT/storage

# 3. Configuration backup
echo "Backing up configuration..."
netlify env:list > $BACKUP_ROOT/netlify-env.txt
cp .env.production $BACKUP_ROOT/env-production.txt

# 4. Code repository
echo "Backing up repository..."
git bundle create $BACKUP_ROOT/repository.bundle --all

# 5. Create manifest
echo "Creating manifest..."
cat > $BACKUP_ROOT/MANIFEST.txt << EOF
Backup Date: $DATE
Database: database.dump.gz
Storage: storage/
Configuration: netlify-env.txt, env-production.txt
Repository: repository.bundle
EOF

# 6. Compress entire backup
echo "Compressing backup..."
tar -czf "backup_full_$DATE.tar.gz" -C ./backups "full_$DATE"

# 7. Upload to cloud (optional)
# aws s3 cp "backup_full_$DATE.tar.gz" s3://your-bucket/backups/

echo "Full backup complete: backup_full_$DATE.tar.gz"
```

---

## 🔙 Restore Procedures

### Database Restore

#### Restore from Supabase Dashboard

1. Go to **Database** → **Backups**
2. Find the backup to restore
3. Click **Restore**
4. Confirm restoration (will overwrite current data)
5. Wait for completion

#### Restore from pg_restore

**From custom format (.dump):**
```bash
# Extract if compressed
gunzip backup_20251011_120000.dump.gz

# Restore
pg_restore \
  --dbname="postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres" \
  --clean \
  --if-exists \
  --verbose \
  backup_20251011_120000.dump
```

**From SQL file:**
```bash
psql "postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres" \
  < backup_20251011_120000.sql
```

**Restore specific table:**
```bash
pg_restore \
  --dbname="$DATABASE_URL" \
  --table=articles \
  --verbose \
  backup.dump
```

### Storage Restore

**Upload files back to Supabase Storage:**
```javascript
// File: scripts/restore-storage.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreStorage(backupDir) {
  const files = fs.readdirSync(backupDir);

  for (const filename of files) {
    const filePath = path.join(backupDir, filename);
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase
      .storage
      .from('media')
      .upload(filename, fileBuffer, {
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${filename}:`, error);
      continue;
    }

    console.log(`Restored: ${filename}`);
  }

  console.log('Storage restore complete!');
}

// Usage
const backupDir = process.argv[2] || './backups/storage_latest';
restoreStorage(backupDir);
```

**Run:**
```bash
node scripts/restore-storage.js ./backups/storage_20251011
```

---

## 🚨 Disaster Recovery

### Complete System Restore

**Scenario:** Complete data loss, need to restore everything

**Steps:**

1. **Prepare New Environment**
   ```bash
   # Create new Supabase project if needed
   # Set up new hosting deployment
   ```

2. **Restore Database**
   ```bash
   # Extract backup
   tar -xzf backup_full_20251011.tar.gz
   cd backups/full_20251011

   # Restore database
   gunzip database.dump.gz
   pg_restore --dbname="$NEW_DATABASE_URL" database.dump
   ```

3. **Restore Storage**
   ```bash
   node scripts/restore-storage.js ./storage
   ```

4. **Restore Configuration**
   ```bash
   # Update environment variables in hosting platform
   # Use netlify-env.txt as reference
   ```

5. **Restore Code**
   ```bash
   # If Git repo is lost
   git clone repository.bundle clearsight-restored
   cd clearsight-restored
   git remote add origin https://github.com/your-repo.git
   git push -u origin --all
   ```

6. **Verify System**
   - Test database queries
   - Verify storage files accessible
   - Test admin login
   - Check all pages load
   - Run smoke tests

### Recovery Time Objective (RTO)

**Target:** System restored within 4 hours

**Breakdown:**
- Environment setup: 1 hour
- Database restore: 1 hour
- Storage restore: 1 hour
- Configuration & testing: 1 hour

### Recovery Point Objective (RPO)

**Target:** Data loss limited to last 24 hours

**Strategy:**
- Daily automated backups
- Point-in-time recovery (7 days)
- Transaction logs

---

## 📋 Backup Verification

### Monthly Backup Test

**Checklist:**
```bash
#!/bin/bash
# File: scripts/verify-backups.sh

echo "Verifying backup integrity..."

# 1. Check latest database backup exists
LATEST_DB=$(ls -t backups/db_backup_*.dump.gz | head -1)
if [ -z "$LATEST_DB" ]; then
  echo "❌ No database backup found!"
  exit 1
fi
echo "✅ Database backup found: $LATEST_DB"

# 2. Check backup is not corrupted
gunzip -t $LATEST_DB
if [ $? -eq 0 ]; then
  echo "✅ Database backup is valid"
else
  echo "❌ Database backup is corrupted!"
  exit 1
fi

# 3. Check storage backup
LATEST_STORAGE=$(ls -td backups/storage_* | head -1)
if [ -z "$LATEST_STORAGE" ]; then
  echo "❌ No storage backup found!"
  exit 1
fi
FILE_COUNT=$(ls -1 $LATEST_STORAGE | wc -l)
echo "✅ Storage backup found: $FILE_COUNT files"

# 4. Test restore to staging
echo "Testing restore to staging..."
# Add staging restore test here

echo "Backup verification complete!"
```

---

## 🔐 Backup Security

### Encryption

**Encrypt sensitive backups:**
```bash
# Encrypt with password
openssl enc -aes-256-cbc -salt \
  -in backup.dump \
  -out backup.dump.enc

# Decrypt
openssl enc -aes-256-cbc -d \
  -in backup.dump.enc \
  -out backup.dump
```

### Access Control

**Backup Storage Access:**
- Only authorized personnel
- MFA required
- Audit logs enabled
- Regular access reviews

### Offsite Storage

**3-2-1 Backup Rule:**
- **3** copies of data
- **2** different storage types
- **1** offsite location

**Recommended Setup:**
1. Production database (live)
2. Supabase automated backups (cloud)
3. Manual backups to AWS S3/Google Cloud (offsite)

---

## 📊 Backup Monitoring

### Track Backup Health

**Create monitoring script:**
```bash
#!/bin/bash
# File: scripts/monitor-backups.sh

# Check last backup age
LAST_BACKUP=$(ls -t backups/db_backup_*.dump.gz | head -1)
BACKUP_AGE=$(( ($(date +%s) - $(stat -f %m "$LAST_BACKUP")) / 86400 ))

if [ $BACKUP_AGE -gt 2 ]; then
  echo "⚠️  WARNING: Last backup is $BACKUP_AGE days old!"
  # Send alert
else
  echo "✅ Backups are current"
fi

# Check backup size
BACKUP_SIZE=$(du -sh backups/ | cut -f1)
echo "Total backup size: $BACKUP_SIZE"

# Check backup count
BACKUP_COUNT=$(ls -1 backups/db_backup_*.dump.gz | wc -l)
echo "Total backups: $BACKUP_COUNT"
```

### Backup Alerts

**Set up alerts for:**
- Backup failed
- Backup older than 48 hours
- Backup size anomaly (too small/large)
- Storage quota exceeded

---

## 📅 Backup Schedule Summary

| Frequency | What | Retention | Automated |
|-----------|------|-----------|-----------|
| Hourly | Transaction logs | 7 days | Yes (Supabase) |
| Daily | Database snapshot | 7 days | Yes (Supabase) |
| Weekly | Full system | 30 days | Script |
| Monthly | Archive | 12 months | Manual |
| Pre-deploy | Snapshot | Until verified | Manual |

---

## ✅ Backup Checklist

### Daily (Automated)
- [ ] Supabase automated backup runs
- [ ] Backup verification
- [ ] Alert check

### Weekly (Manual)
- [ ] Run full-backup.sh
- [ ] Verify backup integrity
- [ ] Upload to offsite storage
- [ ] Clean old backups

### Monthly (Manual)
- [ ] Create archive backup
- [ ] Test restore procedure
- [ ] Update documentation
- [ ] Review retention policy
- [ ] Audit backup access

---

**Last Updated**: October 11, 2025
**Version**: 1.0.0
**Next Review**: November 11, 2025
