# Firebase Admin SDK Key Setup Guide

## Step 1: Get Your New Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **portfolio-13181**
3. Navigate to: **IAM & Admin** → **Service Accounts**
4. Find: `firebase-adminsdk-fbsvc@portfolio-13181.iam.gserviceaccount.com`
5. Click on the service account
6. Go to the **Keys** tab
7. Click **Add Key** → **Create new key**
8. Choose **JSON** format
9. Click **Create** - the JSON file will download

## Step 2: Convert JSON to Environment Variable Format

You have two options:

### Option A: Store as Single-Line JSON String (Recommended)

1. Open the downloaded JSON file in a text editor
2. Copy the entire JSON content
3. Convert it to a single line (remove all line breaks and extra spaces)
4. You can use an online JSON minifier or do it manually

Example format:
```json
{"type":"service_account","project_id":"portfolio-13181","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@portfolio-13181.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### Option B: Store Individual Fields (More Secure)

Extract key fields from the JSON and store them separately.

## Step 3: Add to Your .env File

1. Navigate to your project root directory:
   ```
   C:\Program Files\Misc\APCS\gitrepos\kiroween\kiroween
   ```

2. Check if `.env` file exists:
   ```powershell
   Test-Path .env
   ```

3. If `.env` doesn't exist, create it:
   ```powershell
   New-Item -Path .env -ItemType File
   ```

4. Open `.env` in a text editor (VS Code, Notepad++, etc.)

5. Add the Firebase Admin SDK credentials:

### For Option A (Single JSON String):
```env
# Firebase Admin SDK Credentials
# Store the entire JSON as a single-line string
VITE_FIREBASE_ADMIN_SDK_JSON={"type":"service_account","project_id":"portfolio-13181","private_key_id":"YOUR_NEW_KEY_ID","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@portfolio-13181.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### For Option B (Individual Fields - Recommended):
```env
# Firebase Admin SDK Credentials
FIREBASE_ADMIN_PROJECT_ID=portfolio-13181
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@portfolio-13181.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_PRIVATE_KEY_ID=YOUR_NEW_KEY_ID
```

**Important Notes:**
- Keep the `\n` characters in the private key (they represent line breaks)
- Wrap the private key in quotes if it contains special characters
- Replace `YOUR_NEW_KEY_ID` and `YOUR_PRIVATE_KEY_HERE` with actual values from your JSON

## Step 4: Verify .env is in .gitignore

Your `.gitignore` already includes `.env`, but verify:
```powershell
Select-String -Path .gitignore -Pattern "^\.env$"
```

Should output: `.env`

## Step 5: Use in Your Code (If Needed)

If you need to use Firebase Admin SDK in your backend code:

### Example: Initialize Admin SDK from Environment Variable

```typescript
// src/services/firebaseAdminService.ts
import admin from 'firebase-admin';

// Option A: From JSON string
const serviceAccountJson = process.env.VITE_FIREBASE_ADMIN_SDK_JSON;
if (serviceAccountJson) {
  const serviceAccount = JSON.parse(serviceAccountJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Option B: From individual fields
if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

export default admin;
```

## Step 6: For Production/Deployment

### Vercel:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add: `VITE_FIREBASE_ADMIN_SDK_JSON` (or individual fields)
4. Paste the value
5. Select environments: Production, Preview, Development
6. Save

### Firebase Hosting:
1. Use Firebase Functions environment config:
```bash
firebase functions:config:set firebase.admin.project_id="portfolio-13181"
firebase functions:config:set firebase.admin.client_email="firebase-adminsdk-fbsvc@portfolio-13181.iam.gserviceaccount.com"
firebase functions:config:set firebase.admin.private_key="YOUR_PRIVATE_KEY"
```

### GitHub Actions:
1. Go to repository → Settings → Secrets and variables → Actions
2. Add secret: `FIREBASE_ADMIN_SDK_JSON`
3. Paste the JSON string
4. Use in workflow:
```yaml
env:
  VITE_FIREBASE_ADMIN_SDK_JSON: ${{ secrets.FIREBASE_ADMIN_SDK_JSON }}
```

## Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ Never commit `.env` to git
- ✅ Old key has been deleted from Google Cloud Console
- ✅ Old key file removed from any repositories
- ✅ New key stored only in `.env` or secure secrets manager
- ✅ Team members use their own `.env` files (don't share)

## Quick PowerShell Commands

```powershell
# Check if .env exists
Test-Path .env

# Create .env if it doesn't exist
if (!(Test-Path .env)) { New-Item -Path .env -ItemType File }

# Open .env in VS Code
code .env

# Verify .env is ignored by git
git check-ignore .env
# Should output: .env
```

## Troubleshooting

### Issue: Environment variable not loading
- Make sure variable name starts with `VITE_` for Vite projects
- Restart your dev server after adding variables
- Check for typos in variable names

### Issue: Private key format errors
- Ensure `\n` characters are preserved in the private key
- Wrap the entire key value in quotes
- Check that BEGIN/END markers are included

### Issue: "Service account key not found"
- Verify the JSON is valid (use JSON validator)
- Check that all required fields are present
- Ensure no extra spaces or line breaks in single-line format

