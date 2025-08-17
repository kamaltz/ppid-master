# Test Scripts for Keberatan 17-Day Validation

## 🧪 Test Working Days Calculation
```bash
npm run test:working-days
```
This tests the working days calculation logic.

## 📊 Add Test Requests (SQL Method)

Since the Node.js scripts have database connection issues, use the SQL file directly:

1. **Open your database management tool** (phpMyAdmin, pgAdmin, etc.)
2. **Run the SQL file**: `scripts/add-test-requests.sql`
3. **This will create 5 test requests**:
   - 3 requests eligible for keberatan (25+ days old)
   - 2 requests not eligible yet (5-10 days old)

## 🔍 Test the Feature

After running the SQL:

1. **Login as pemohon** (use any existing pemohon account)
2. **Go to Keberatan page**
3. **Select permohonan dropdown**
4. **Verify**:
   - Old requests show working days count
   - Eligible requests are selectable
   - Recent requests show "Belum 17 hari"
   - Form validation prevents submission of ineligible requests

## ✅ Expected Results

- **Eligible requests**: Green status, can be selected
- **Ineligible requests**: Yellow status, disabled in dropdown
- **Working days counter**: Shows accurate business days excluding weekends/holidays
- **Form validation**: Prevents keberatan submission before 17 working days