# Investment Theses Feature Guide

## Overview

The Investment Theses feature allows you to showcase investment analysis documents on your website. It includes a complete admin panel for managing theses with:

- ✅ PDF-only file attachments (HTTPS security enforced)
- ✅ Customizable section label
- ✅ Admin-only access control
- ✅ Beautiful, responsive UI
- ✅ Security-focused validation

## Features

### 1. **Customizable Label**
The section name can be changed by admin users. Default: "Investment Theses"
- Can be customized in Admin Dashboard
- Displays dynamically in all public pages

### 2. **PDF-Only Attachments**
Strict security validation ensures only PDF files are allowed:
- **HTTPS Required**: All URLs must use HTTPS protocol
- **PDF Verification**: URLs must end with `.pdf` or be from trusted CDN (ImageKit)
- **XSS Prevention**: Blocks `javascript:`, `data:`, and `blob:` protocols
- **Server-side Validation**: Validates on both client and server

### 3. **Admin Management**
Complete CRUD operations for investment theses:
- Create new theses with title and PDF URL
- Edit existing theses
- Delete theses
- View all theses in organized table
- Edit section label

### 4. **Public Display**
Beautiful, responsive page showcasing all investment theses:
- Grid layout with PDF cards
- Author and date information
- Direct PDF links (open in new tab)
- Smooth hover animations

## Setup & Configuration

### Database

Run migration (already applied):
```bash
npx prisma migrate dev --name add_investment_thesis
```

This creates:
- `InvestmentThesis` table for storing theses
- `SiteConfig` table for storing the section label

### Directory Structure

```
pages/
├── investment-theses.jsx                    # Public theses page
├── admin/
│   ├── investment-theses/
│   │   ├── index.jsx                       # Admin list & config
│   │   ├── new.jsx                         # Create new thesis
│   │   └── edit/
│   │       └── [id].jsx                    # Edit thesis
│   └── index.jsx                           # Updated dashboard
├── projects.jsx                             # Updated with tab navigation
└── api/
    └── admin/
        ├── investment-theses.js             # API endpoints
        └── config.js                        # Config endpoints
```

## API Endpoints

### Get All Investment Theses
```
GET /api/admin/investment-theses
```
**Response**: Array of theses (public endpoint)

### Create Investment Thesis
```
POST /api/admin/investment-theses
```
**Headers**: `Authorization: Bearer {token}`
**Body**:
```json
{
  "title": "Q1 2025 Market Analysis",
  "pdfUrl": "https://example.com/thesis.pdf"
}
```
**Validation**:
- Title required, max 200 characters
- PDF URL must be HTTPS and end with `.pdf`

### Update Investment Thesis
```
PUT /api/admin/investment-theses
```
**Headers**: `Authorization: Bearer {token}`
**Body**:
```json
{
  "id": "thesis-id",
  "title": "Updated Title",
  "pdfUrl": "https://example.com/updated-thesis.pdf"
}
```

### Delete Investment Thesis
```
DELETE /api/admin/investment-theses
```
**Headers**: `Authorization: Bearer {token}`
**Body**:
```json
{
  "id": "thesis-id"
}
```

### Get Site Config
```
GET /api/admin/config
```
**Response**:
```json
{
  "id": "config-id",
  "investmentThesesLabel": "Investment Theses",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Update Site Config
```
PUT /api/admin/config
```
**Headers**: `Authorization: Bearer {token}`
**Body**:
```json
{
  "investmentThesesLabel": "My Research"
}
```
**Validation**:
- Label required, 1-100 characters

## Security Features

### 1. **PDF URL Validation**

**Client-side validation** in forms:
```javascript
function isValidPdfUrl(url) {
  const urlObj = new URL(url)
  
  // Must be HTTPS
  if (urlObj.protocol !== 'https:') return false
  
  // Must end with .pdf
  if (urlObj.pathname.toLowerCase().endsWith('.pdf')) return true
  
  // Allow ImageKit CDN
  if (urlObj.hostname.includes('imagekit.io')) return true
  
  return false
}
```

**Server-side validation** in API:
- Duplicate URL validation
- XSS prevention (blocks dangerous protocols)
- Type checking
- String sanitization

### 2. **Admin-Only Access**

All modification endpoints require:
- Valid JWT token
- Admin user status verified via database

```javascript
async function verifyAdminToken(token) {
  const decoded = jwt.decode(token)
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })
  return user?.isAdmin ? user : null
}
```

### 3. **XSS Prevention**

Blocks dangerous URL patterns:
- `javascript:`
- `data:`
- `blob:`

## Usage Guide

### For Admins

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Click "Theses" button

2. **Create New Thesis**
   - Click "New Thesis" button
   - Enter title (max 200 characters)
   - Enter PDF URL (must be HTTPS and end with `.pdf`)
   - Submit

3. **Edit Existing Thesis**
   - Click edit icon next to thesis
   - Update title or PDF URL
   - Save changes

4. **Delete Thesis**
   - Click trash icon next to thesis
   - Confirm deletion

5. **Change Section Label**
   - In Theses admin page
   - Click "Edit Label" button
   - Enter new label (1-100 characters)
   - Save

### For Users

1. **View Investment Theses**
   - Go to `/projects`
   - Click "Investment Theses" tab or button
   - Browse thesis cards
   - Click any thesis to open PDF

2. **Filter by Tab**
   - "Projects" tab: Shows regular projects
   - "Investment Theses" tab: Shows investment documents

## Supported PDF Hosts

✅ **Verified hosts**:
- ImageKit CDN (`imagekit.io`)
- Any HTTPS URL ending with `.pdf`

✅ **Examples**:
- `https://ik.imagekit.io/user/thesis.pdf?params=value`
- `https://example.com/research/analysis.pdf`
- `https://cdn.example.com/documents/thesis.pdf`

❌ **Blocked**:
- HTTP URLs (must be HTTPS)
- URLs without `.pdf` extension
- Data URIs (`data:...`)
- JavaScript URIs (`javascript:...`)

## Database Schema

### InvestmentThesis Model
```prisma
model InvestmentThesis {
  id        String   @id @default(cuid())
  title     String
  pdfUrl    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

### SiteConfig Model
```prisma
model SiteConfig {
  id                    String   @id @default(cuid())
  investmentThesesLabel String   @default("Investment Theses")
  updatedAt             DateTime @updatedAt
}
```

## Troubleshooting

### "Invalid PDF URL" Error
- Ensure URL uses HTTPS (not HTTP)
- Confirm URL ends with `.pdf`
- Check URL is accessible

### Missing Theses on Public Page
- Verify API endpoint `/api/admin/investment-theses` returns data
- Check database has entries
- Clear browser cache

### Label Not Updating
- Verify token has admin privileges
- Ensure label is 1-100 characters
- Check network request completes successfully

## Testing

### Manual Testing

1. **Create a Thesis**
   ```bash
   curl -X POST http://localhost:3000/api/admin/investment-theses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "title": "Test Thesis",
       "pdfUrl": "https://example.com/test.pdf"
     }'
   ```

2. **Fetch All Theses**
   ```bash
   curl http://localhost:3000/api/admin/investment-theses
   ```

3. **Update Label**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/config \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "investmentThesesLabel": "Research Papers"
     }'
   ```

## Future Enhancements

- Add file upload with server-side PDF validation
- Implement thesis categories/tags
- Add search functionality
- Create thesis preview with PDF rendering
- Add analytics tracking
- Implement versioning for theses

## Support

For issues or questions about the Investment Theses feature, refer to:
- Database: `prisma/schema.prisma`
- API: `pages/api/admin/investment-theses.js` and `pages/api/admin/config.js`
- Admin UI: `pages/admin/investment-theses/`
- Public UI: `pages/investment-theses.jsx`
