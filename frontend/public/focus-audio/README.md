# Focus Mode Audio Files

Ambient audio files for the Focus Mode feature.

## 📁 Required Files

```
frontend/public/focus-audio/
├── forest-breeze.mp3   # Main ambient loop (birds, wind, nature)
├── chime.mp3           # Completion sound (Tibetan bowl/bell)
└── README.md
```

## 🎵 Audio Specifications

### forest-breeze.mp3
- **Format**: MP3
- **Bitrate**: 128-192 kbps
- **Duration**: 2-5 minutes (seamless loop)
- **Content**: Gentle forest ambiance
  - Bird songs
  - Wind through trees
  - Distant water stream
  - Rustling leaves
- **Volume**: Normalized, not too loud
- **Loop**: Must loop seamlessly

### chime.mp3
- **Format**: MP3
- **Bitrate**: 128 kbps
- **Duration**: 3-5 seconds
- **Content**: Single chime/bell sound
  - Tibetan singing bowl
  - Meditation bell
  - Soft gong
- **Volume**: Clear but gentle

## 🆓 Where to Find Audio

### Free Sound Libraries
1. **Freesound.org**: https://freesound.org/
   - Search: "forest ambience loop", "meditation bell"
   
2. **YouTube Audio Library**: https://www.youtube.com/audiolibrary
   - Filter by "Ambient" category
   
3. **Incompetech**: https://incompetech.com/
   - Royalty-free music and sounds

4. **Zapsplat**: https://www.zapsplat.com/
   - Free sound effects

### Recommended Searches
- "forest ambience loop"
- "nature sounds peaceful"
- "meditation bell chime"
- "tibetan bowl sound"
- "forest birds wind"

## 🎨 Creating Seamless Loops

### Using Audacity (Free)
1. Open your audio file
2. Select the end portion (last 2 seconds)
3. Effect → Fade Out
4. Select the beginning (first 2 seconds)
5. Effect → Fade In
6. Export as MP3

### Testing the Loop
Play the audio 3-4 times in a row to ensure no audible "click" or gap at the loop point.

## ✅ Quick Setup

1. Download forest ambience audio (2-5 min loop)
2. Download meditation chime sound (3-5 sec)
3. Rename to: `forest-breeze.mp3` and `chime.mp3`
4. Place in `frontend/public/focus-audio/`
5. Test in Focus Mode!

## 💡 Tips

- **Volume**: Keep ambient sounds at 50-70% volume
- **Quality**: Higher bitrate = better quality but larger file
- **Loop**: Test the loop point carefully
- **Variety**: Consider adding more ambient tracks in the future

The Focus Mode will play `forest-breeze.mp3` during sessions and `chime.mp3` when completing.
