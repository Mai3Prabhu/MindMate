# Meditation Audio Files

Guided meditation audio tracks for different voice types and time periods.

## Directory Structure

```
meditation-audios/
├── female/
│   ├── morning.mp3      # Morning meditation (female voice)
│   ├── afternoon.mp3    # Afternoon meditation (female voice)
│   └── evening.mp3      # Evening meditation (female voice)
├── male/
│   ├── morning.mp3      # Morning meditation (male voice)
│   ├── afternoon.mp3    # Afternoon meditation (male voice)
│   └── evening.mp3      # Evening meditation (male voice)
└── README.md
```

## Audio Specifications

### Technical Requirements
- **Format**: MP3
- **Bitrate**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo
- **Duration**: 5-15 minutes per track
- **Volume**: Normalized, consistent levels
- **Quality**: Clear speech, minimal background noise

### Content Guidelines

#### Morning Meditation (morning.mp3) 🌅
- **Duration**: 5-10 minutes
- **Focus**: Awakening, setting intentions, energizing
- **Tone**: Gentle but uplifting
- **Content**:
  - Welcome and grounding
  - Breathing exercises
  - Body awareness
  - Intention setting for the day
  - Gentle energizing visualization

#### Afternoon Meditation (afternoon.mp3) ☀️
- **Duration**: 8-12 minutes
- **Focus**: Reset, stress relief, clarity
- **Tone**: Balanced, centering
- **Content**:
  - Midday reset and grounding
  - Stress release techniques
  - Mental clarity practices
  - Brief body scan
  - Renewed focus for remainder of day

#### Evening Meditation (evening.mp3) 🌙
- **Duration**: 10-15 minutes
- **Focus**: Relaxation, reflection, preparation for sleep
- **Tone**: Calm, soothing, slower pace
- **Content**:
  - Day reflection and gratitude
  - Progressive relaxation
  - Letting go of tension
  - Peaceful visualization
  - Preparation for restful sleep

## Voice Characteristics

### Female Voice
- **Tone**: Warm, nurturing, gentle
- **Pace**: Measured, calming
- **Style**: Compassionate, supportive
- **Accent**: Neutral, clear pronunciation

### Male Voice
- **Tone**: Steady, grounding, reassuring
- **Pace**: Slow, deliberate
- **Style**: Wise, calming presence
- **Accent**: Neutral, clear pronunciation

## Creating Meditation Audio

### Script Structure
1. **Opening** (30 seconds)
   - Welcome and settling in
   - Initial breathing cues

2. **Body** (4-12 minutes)
   - Main meditation content
   - Guided visualizations
   - Breathing exercises

3. **Closing** (30-60 seconds)
   - Gentle return to awareness
   - Positive affirmation
   - Soft ending

### Recording Tips
1. **Environment**: Quiet room with minimal echo
2. **Microphone**: Good quality, close to mouth
3. **Pace**: Speak slower than normal conversation
4. **Pauses**: Include natural pauses for breathing
5. **Consistency**: Maintain same volume and tone throughout

## Free Resources

### Text-to-Speech Options
1. **ElevenLabs**: https://elevenlabs.io/
   - High-quality AI voices
   - Natural-sounding speech

2. **Murf**: https://murf.ai/
   - Professional voiceover AI
   - Multiple voice options

3. **Speechify**: https://speechify.com/
   - Natural voice synthesis

### Meditation Scripts
1. **Mindful.org**: Free meditation guides
2. **Headspace**: Inspiration for structure
3. **Calm**: Reference for pacing and content
4. **Insight Timer**: Community scripts

### Background Music (Optional)
1. **Freesound.org**: Ambient sounds
2. **YouTube Audio Library**: Meditation music
3. **Incompetech**: Royalty-free ambient tracks

## Audio Processing

### Using Audacity (Free)
1. **Normalize**: Effect → Normalize (set to -3dB)
2. **Noise Reduction**: Remove background noise
3. **Compressor**: Even out volume levels
4. **EQ**: Enhance voice clarity
5. **Export**: MP3, 128-192 kbps

### Command Line (FFmpeg)
```bash
# Normalize audio levels
ffmpeg -i input.wav -af "loudnorm" -c:a mp3 -b:a 128k output.mp3

# Add fade in/out
ffmpeg -i input.mp3 -af "afade=t=in:ss=0:d=2,afade=t=out:st=290:d=3" output.mp3
```

## Sample Script Template

```
[MORNING MEDITATION - FEMALE VOICE]

Welcome to your morning meditation. Find a comfortable position, either sitting or lying down. 

[PAUSE 3 seconds]

Let's begin by taking three deep breaths together. Breathe in slowly through your nose...

[PAUSE 4 seconds]

And breathe out gently through your mouth...

[Continue with meditation content...]

Take a moment to set an intention for your day ahead...

[PAUSE 5 seconds]

When you're ready, gently wiggle your fingers and toes, and slowly open your eyes. Have a wonderful day.
```

## Implementation Notes

### Playback Features
- Audio plays at 0.75x speed for more calming effect
- Volume controlled by user
- Can be muted for silent meditation
- Seamless integration with visual backgrounds

### User Options
- Choice between male/female voice
- Time-of-day appropriate content
- Silent option (no voice, just background)

## Quality Checklist

- [ ] Clear, professional audio quality
- [ ] Consistent volume levels across all tracks
- [ ] Appropriate pacing with natural pauses
- [ ] Content matches time-of-day themes
- [ ] Files are properly named and organized
- [ ] Audio duration matches meditation session length
- [ ] No background noise or distractions

## Quick Setup

1. **Scripts**: Write or find meditation scripts for each time period
2. **Recording**: Use AI voice generation or record with quality microphone
3. **Processing**: Normalize and enhance audio in Audacity
4. **Organization**: Place files in correct voice/time directories
5. **Testing**: Verify all tracks play correctly in meditation interface

The meditation zone will automatically select the appropriate audio based on user preferences and time of day.