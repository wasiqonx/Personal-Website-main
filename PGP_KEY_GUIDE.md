# PGP Key Download Feature

## 🔐 Overview

Added a PGP key download button to the contact page that allows visitors to:
- Download your public PGP key
- Send you encrypted emails
- Verify communications with you

## 📁 Files

### Public Key File
- **Location**: `public/pgp-key.asc`
- **Filename**: Sample PGP public key (you should replace with your actual key)
- **Access**: `/pgp-key.asc`

### Contact Page Update
- **File**: `pages/contact.jsx`
- **Changes**: Added PGP Key download button with:
  - Lock icon that turns green on hover
  - Download indicator
  - Tooltip explaining functionality
  - Professional styling matching other contact buttons

## 🎯 How It Works

1. **Button Displays On Contact Page**: 
   - Shows "PGP Key" with lock icon
   - Subtitle: "Encrypted mail"
   - Download arrow icon

2. **Click Download**:
   - Downloads file as `wasiq-pgp-key.asc`
   - Saved to user's Downloads folder
   - Can be imported into PGP/GPG clients

3. **User Can**:
   - Import key into Thunderbird, Outlook, GPG, etc.
   - Encrypt messages to you
   - Verify your digital signatures

## 🔑 How to Add Your Real PGP Key

### Option 1: Replace the Sample Key

1. Generate your PGP key (if you don't have one):
```bash
gpg --gen-key
# Follow the prompts
```

2. Export your public key:
```bash
gpg --export --armor your-email@example.com > public/pgp-key.asc
```

3. Verify it looks correct:
```bash
cat public/pgp-key.asc
```

### Option 2: Import from KeyBase or other services

```bash
# Export from KeyBase
curl https://keybase.io/yourname/pgp_keys.asc > public/pgp-key.asc

# Or export from other key servers
gpg --keyserver keyserver.ubuntu.com --recv-keys YOUR_KEY_ID
gpg --export --armor YOUR_KEY_ID > public/pgp-key.asc
```

## 📝 File Format

The PGP key file should look like:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v2.4.0

mI0EVFWlOAEEALQczpI8o6JUWwKWG0dR7d6HyN6Y9JF9QvK3n4q8J0g5K2vQvXvZ
... (encoded key data) ...
=XXXX
-----END PGP PUBLIC KEY BLOCK-----
```

## 🎨 UI Features

### Button Styling
- Matches existing contact buttons
- Hover effect: background lightens
- Lock icon turns green on hover
- Download arrow animates on hover
- Responsive on mobile and desktop

### Accessibility
- Tooltip: "Download PGP public key for secure encrypted communication"
- Clear labels and icons
- Keyboard accessible (can tab and enter)
- Descriptive subtitle

## 🚀 Deployment

### Local Testing
```bash
npm run dev
# Navigate to http://localhost:3000/contact
# Click the PGP Key button to download
```

### VPS Deployment
```bash
git add public/pgp-key.asc pages/contact.jsx
git commit -m "Add: PGP key download button to contact page"
git push origin main

# On VPS:
git pull origin main
npm run build
pm2 restart Wasiq
```

## 🔍 Usage Instructions for Visitors

After downloading your PGP key, users can:

### In Thunderbird (with Enigmail)
1. Go to OpenPGP → Key Manager
2. File → Import Public Keys
3. Select the `wasiq-pgp-key.asc` file
4. Compose encrypted email to you

### In GPG (Command Line)
```bash
# Import key
gpg --import wasiq-pgp-key.asc

# Encrypt a message
echo "Secret message" | gpg --encrypt --armor --recipient wasiq@wasiq.in
```

### In Outlook (with GPG4Win)
1. Install GPG4Win
2. Open key management
3. Import the ASC file
4. Outlook will detect and offer encryption option

## 📊 Key Information

Your current PGP key file contains:
- **Format**: ASCII Armored (.asc)
- **Type**: Public Key only (safe to share)
- **Download Name**: `wasiq-pgp-key.asc`
- **Delivery**: HTTP via public/ folder

## ⚠️ Important Notes

1. **Private Key**: Never share your private key
2. **Public Key**: Safe to share freely
3. **Verification**: Users should verify your key fingerprint independently
4. **Key Updates**: If you update your key, replace `public/pgp-key.asc`

## 🔄 Key Rotation

When you need to update your key:

```bash
# Export new public key
gpg --export --armor your-email@example.com > public/pgp-key.asc

# Commit and deploy
git add public/pgp-key.asc
git commit -m "Update: PGP public key"
git push origin main
```

## 🎯 Security Best Practices

- ✅ Share public key freely
- ✅ Keep private key secure
- ✅ Use strong passphrase for key
- ✅ Regularly sign communications
- ✅ Publish key fingerprint on multiple channels
- ❌ Don't upload private key to the site
- ❌ Don't commit private key to git

## 📞 Support

If users have issues:
1. Verify they downloaded the correct key
2. Check their email client supports PGP
3. Provide your key fingerprint for verification
4. Consider using ProtonMail for easier encrypted email

---

**Next Steps**: Replace the sample key in `public/pgp-key.asc` with your actual PGP public key! 🔐
