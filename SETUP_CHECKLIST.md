# MindMate Setup Checklist

## ✅ Quick Setup Guide

Follow these steps to get the Meditation Zone running:

---

## 1️⃣ Database Migration (REQUIRED)

### Step 1: Open Supabase
1. Go to [https://supabase.com](https://supabase.com)
2. Open your MindMate project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Migration
Copy and paste this SQL:

```sql
ALTER TABLE meditation_sessions 
ADD COLUMN IF NOT EXISTS before_calmness INTEGER CHECK (before_calmness >= 1 AND before_calmness <= 10),
ADD COLUMN IF NOT EXISTS after_calmness INTEGER CHECK (after_calmness >= 1 AND after_calmness <= 10);
```

### Step 3: Execute
Click **Run** button

✅ **Done!** Database is ready.

---

## 2️⃣ Start the Application (REQUIRED)

### Backend
```bash
cd backend
uvicorn main:app --reload
```

✅ Backend running at: `http://localhost:8000`

### Frontend
```bash
cd frontend
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

---

## 3️⃣ Test the Feature (REQUIRED)

### Navigate to Meditation Zone
1. Open browser: `http://localhost:3000`
2. Login to your account
3. Click **"Mates"** in sidebar
4. Click **"Meditation Zone"** card

### Test Basic Functionality
- [ ] See customization options (theme, voice, duration)
- [ ] Click "Enter Meditation Zone"
- [ ] Rate mood (1-10)
- [ ] See player interface
- [ ] Click play/pause buttons
- [ ] Adjust volume slider
- [ ] Click stop button
- [ ] Rate post-meditation mood
- [ ] Session saves successfully
- [ ] Click "History" button
- [ ] See session in history

✅ **Feature is working!**

---

## 4️⃣ Add Media Assets (OPTIONAL)

### Why Optional?
The feature works perfectly without media. Audio/video enhance the experience but aren't required for functionality.

### Quick Option: Skip This Step
You can use the feature in **Silent Mode** without any media files.

### Full Option: Add Media

#### A. Download Free Videos
Visit [Pexels Videos](https://www.pexels.com/videos/) and search:
- "forest loop" → Save as `frontend/public/meditation-scenes/nature/nature.mp4`
- "ocean waves" → Save as `frontend/public/meditation-scenes/ocean/ocean.mp4`
- "night sky" → Save as `frontend/public/meditation-scenes/night/night.mp4`

Also save a screenshot from each video as `bg.jpg` in the same folder.

#### B. Add Audio Files (Optional)
Options:
1. **Use AI Voice**: [ElevenLabs](https://elevenlabs.io) (free tier available)
2. **Record Yourself**: Use Audacity (free)
3. **Download Free**: [Freesound.org](https://freesound.org)
4. **Hire Voice Actor**: Fiverr ($5-20 per file)

Save as:
```
frontend/public/meditation-audios/
  male/
    morning.mp3
    afternoon.mp3
    evening.mp3
    night.mp3
  female/
    morning.mp3
    afternoon.mp3
    evening.mp3
    night.mp3
```

See detailed guidelines in:
- `frontend/public/meditation-audios/README.md`
- `frontend/public/meditation-scenes/README.md`

---

## 5️⃣ Verify Everything Works

### Checklist
- [ ] Database migration successful
- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Can navigate to /mates/meditation
- [ ] Can customize session
- [ ] Can track mood
- [ ] Can use player controls
- [ ] Can view session history
- [ ] Sessions save to database
- [ ] No console errors

### Optional (with media)
- [ ] Background video plays
- [ ] Audio plays (if not silent)
- [ ] Volume control works
- [ ] Fullscreen works

---

## 🎯 What You Should See

### 1. Mates Page
- Grid of 5 feature cards
- Therapy, FeelHear, FeelFlow, Symphony, Meditation Zone
- Smooth animations

### 2. Meditation Zone
- Customization screen with:
  - 3 theme options (Nature, Ocean, Night)
  - 3 voice options (Male, Female, Silent)
  - 4 duration options (5, 10, 20, 30 min)
- "Enter Meditation Zone" button

### 3. Mood Tracker
- 10 emoji buttons (1-10 scale)
- Labels for each mood level
- "Continue" button

### 4. Player Interface
- Breathing circle animation
- Time countdown
- Progress bar
- Play/Pause/Stop buttons
- Volume slider
- Fullscreen button

### 5. Session History
- List of past sessions
- Statistics (total sessions, minutes, avg improvement)
- Per-session details with mood changes

---

## 🐛 Troubleshooting

### Database Error
**Problem**: "Column does not exist"
**Solution**: Run the migration SQL in Supabase

### Backend Not Starting
**Problem**: Port 8000 already in use
**Solution**: 
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### Frontend Not Starting
**Problem**: Port 3000 already in use
**Solution**: Kill the process or use different port:
```bash
npm run dev -- -p 3001
```

### "Cannot find module" Error
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Media Not Loading
**Problem**: 404 errors for audio/video
**Solution**: 
- Use Silent mode (no audio needed)
- Check file paths match exactly
- Verify files are in `public/` directory

### Session Not Saving
**Problem**: Session doesn't appear in history
**Solution**:
- Check backend console for errors
- Verify database migration was run
- Check network tab in browser DevTools

---

## 📱 Mobile Testing

### Test on Mobile Device
1. Find your computer's local IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update backend `.env`:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,http://YOUR_IP:3000
   ```

3. Restart backend

4. On mobile, visit: `http://YOUR_IP:3000`

---

## 🎨 Customization (Optional)

### Change Time Periods
Edit `frontend/app/mates/meditation/page.tsx`:
```typescript
const getTimePeriod = (): TimePeriod => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  // Modify these ranges
}
```

### Add New Themes
1. Create folder: `meditation-scenes/newtheme/`
2. Add `bg.jpg` and `newtheme.mp4`
3. Update theme array in meditation page

### Change Durations
Edit `frontend/app/mates/meditation/page.tsx`:
```typescript
const durations = [5, 10, 20, 30] // Add more
```

---

## 📚 Documentation

### Quick Reference
- **Quick Start**: `QUICK_START_MEDITATION.md`
- **Full Guide**: `MEDITATION_ZONE_IMPLEMENTATION.md`
- **Restructure Info**: `RESTRUCTURE_SUMMARY.md`
- **Completion Report**: `PROJECT_COMPLETION_REPORT.md`

### Asset Guidelines
- **Audio**: `frontend/public/meditation-audios/README.md`
- **Visuals**: `frontend/public/meditation-scenes/README.md`

---

## ✅ Final Checklist

### Must Do
- [x] Run database migration
- [x] Start backend
- [x] Start frontend
- [x] Test basic functionality

### Should Do
- [ ] Test on mobile
- [ ] Test in different browsers
- [ ] Test light/dark mode
- [ ] Review documentation

### Nice to Have
- [ ] Add meditation audio files
- [ ] Add scene videos
- [ ] Customize time periods
- [ ] Add custom themes

---

## 🎉 You're Done!

The Meditation Zone is now fully functional and ready to use!

### What Works Now
✅ Complete UI and functionality
✅ Time-aware system
✅ Mood tracking
✅ Session history
✅ Statistics
✅ Responsive design
✅ Accessibility features

### What's Optional
⏳ Meditation audio files
⏳ Scene videos
⏳ Custom themes

**Start meditating and enjoy your calm! 🧘‍♀️✨**

---

## 📞 Need Help?

1. Check troubleshooting section above
2. Review documentation files
3. Check browser console for errors
4. Verify all steps were completed
5. Test with Silent mode first

**Everything should work perfectly!** 🚀
