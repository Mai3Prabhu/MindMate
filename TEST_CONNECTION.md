# Backend-Frontend Connection Test

## Current Configuration ✅

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Quick Connection Tests

### 1. Test Backend is Running
Open your browser and go to:
```
http://localhost:8000/docs
```
You should see the FastAPI Swagger documentation.

### 2. Test Health Endpoint
```
http://localhost:8000/health
```
Should return:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

### 3. Test CORS from Browser Console
Open your frontend (http://localhost:3000) and run this in the browser console:
```javascript
fetch('http://localhost:8000/health', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptom:** Cannot connect to http://localhost:8000
**Solution:**
```bash
cd backend
python -m uvicorn main:app --reload
```

### Issue 2: CORS Error
**Symptom:** "Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy"
**Solution:** Backend .env should have:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Issue 3: Wrong Port
**Symptom:** Frontend trying to connect to wrong port
**Solution:** Check frontend .env.local:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Issue 4: Frontend Not Using Env Variable
**Symptom:** API calls going to undefined or wrong URL
**Solution:** Restart the Next.js dev server:
```bash
cd frontend
npm run dev
```

## Verify Current Setup

### Check Backend Logs
Look for these lines when backend starts:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     [OK] Configuration validated successfully
INFO:     [OK] Allowed Origins: http://localhost:3000,http://localhost:3001
```

### Check Frontend Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to use a feature (like Library)
4. Look for requests to `http://localhost:8000/api/...`
5. Check the response status:
   - **200 OK** = Working! ✅
   - **404 Not Found** = Endpoint doesn't exist
   - **500 Internal Server Error** = Backend error
   - **CORS error** = CORS misconfiguration

## Current Status

Based on your error log:
```
INFO: 127.0.0.1:57236 - "POST /api/therapy/session/%5Bobject%20Object%5D/message HTTP/1.1" 404 Not Found
```

This shows:
- ✅ Backend IS running (received the request)
- ✅ CORS is working (request went through)
- ❌ URL was malformed (`%5Bobject%20Object%5D` = `[object Object]`)

**This was a frontend code issue, which has now been fixed!**

## Next Steps

1. **Restart Frontend** (to pick up the API changes):
   ```bash
   cd frontend
   # Stop the dev server (Ctrl+C)
   npm run dev
   ```

2. **Test the therapy chat again** - it should work now!

3. **If still having issues**, check the browser console for errors and the backend logs for incoming requests.
