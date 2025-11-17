# Quick Start: Meditation Zone

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migration

Open Supabase SQL Editor and run:

```sql
ALTER TABLE meditation_sessions 
ADD COLUMN IF NOT EXISTS before_calmness INTEGER CHECK (before_calmness >= 1 AND before_calmness <= 10),
ADD COLUMN IF NOT EXISTS after_calmness INTEGER CHECK (after_calmness >= 1 AND after_calmness <= 10);
```

### Step 2: Start the Application

```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Step 3: Navigate to Meditation Zone

1. Open browser: `http://localhost:3000`
2. Login to your account
3. Click **"Mates"** in the sidebar
4. Click **"Meditation Zone"** card

### Step 4: Test the Feature

The feature is fully functional! You can:
- ✅ Select theme, voice, and duration
- ✅ Track your mood before/after
- ✅ Use player controls
- ✅ View session history
- ✅ See statistics

**Note**: Audio and video will not play until you add media files (see below).

---

## 📦 Adding Media Assets (Optional)

### Quick Option: Use Placeholders

For testing, you can use solid color images and silent audio:

#### Create Placeholder Images
```bash
cd frontend/public/meditation-scenes

# Nature theme
mkdir -p nature
# Add any 1920x1080 image as nature/bg.jpg

# Ocean theme
mkdir -p ocean
# Add any 1920x1080 image as ocean/bg.jpg

# Night theme
mkdir -p night
# Add any 1920x1080 image as night/bg.jpg
```

#### Create Silent Audio (Optional)
```bash
cd frontend/public/meditation-audios

# Create silent MP3 files (1 minute each)
# You can use any audio editing tool or online generator
# Or just skip this - the app works without audio
```

### Full Option: Add Real Media

#### 1. Download Free Stock Videos
Visit these sites:
- [Pexels Videos](https://www.pexels.com/videos/)
- [Pixabay Videos](https://pixabay.com/videos/)
- [Coverr](https://coverr.co/)

Search for:
- "forest loop" → Save as `nature/nature.mp4`
- "ocean waves loop" → Save as `ocean/ocean.mp4`
- "night sky stars" → Save as `night/night.mp4`

#### 2. Create Meditation Audio
Options:
- **Record yourself**: Use Audacity or GarageBand
- **AI Voice**: Use ElevenLabs or Google Text-to-Speech
- **Hire**: Fiverr voice actors ($5-20 per file)
- **Free**: Download from Freesound.org

Save as:
```
meditation-audios/
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

---

## 🎯 Testing Checklist

### Basic Functionality (No Media Required)
- [ ] Navigate to /mates/meditation
- [ ] See customization options
- [ ] Select theme, voice, duration
- [ ] Click "Enter Meditation Zone"
- [ ] Rate mood (1-10)
- [ ] See player interface
- [ ] Click play/pause buttons
- [ ] Adjust volume slider
- [ ] Click stop button
- [ ] Rate post-meditation mood
- [ ] Session saves successfully
- [ ] View session history
- [ ] See statistics

### With Media Assets
- [ ] Background video plays and loops
- [ ] Audio plays when not silent
- [ ] Volume control works
- [ ] Mute toggle works
- [ ] Fullscreen mode works
- [ ] Video/audio sync properly

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd frontend
npm install
```

### Database errors
- Verify migration was run in Supabase
- Check Supabase credentials in `.env`
- Ensure you're logged in

### Media not loading
- Check file paths match exactly
- Verify files are in `public/` directory
- Check browser console for 404 errors
- Try with placeholder images first

### Player not working
- Check browser console for errors
- Verify backend API is running
- Test with silent mode first

---

## 📱 Mobile Testing

The meditation zone is fully responsive:

```bash
# Test on mobile device
# 1. Find your local IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# 2. Update ALLOWED_ORIGINS in backend/.env
# 3. Visit: http://YOUR_IP:3000 on mobile
```

---

## 🎨 Customization

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
3. Update theme selector in meditation page

### Change Durations
Edit `frontend/app/mates/meditation/page.tsx`:

```typescript
const durations = [5, 10, 20, 30] // Add more options
```

---

## 📊 View Analytics

### In Session History
- Total sessions count
- Total minutes meditated
- Average mood improvement
- Per-session details

### Via API
```bash
curl http://localhost:8000/api/meditation/stats?user_id=current
```

---

## 🎉 You're Ready!

The Meditation Zone is now fully set up and functional. 

**Without media**: All UI and functionality works perfectly
**With media**: Full immersive experience with audio and visuals

Start meditating and track your progress! 🧘‍♀️✨

---

## 📚 Additional Resources

- **Full Implementation Guide**: See `MEDITATION_ZONE_IMPLEMENTATION.md`
- **Audio Guidelines**: See `frontend/public/meditation-audios/README.md`
- **Visual Guidelines**: See `frontend/public/meditation-scenes/README.md`
- **Project Restructure**: See `RESTRUCTURE_SUMMARY.md`

---

## 💡 Tips

1. **Start Simple**: Test without media first
2. **Use Silent Mode**: Works great without audio files
3. **Placeholder Images**: Any calming image works for testing
4. **Time Testing**: Change your system time to test different periods
5. **Mobile First**: Test on mobile for best meditation experience

**Happy Meditating!** 🌟
