# Add Your Parliamentary YouTube Videos

To get ParliQ working with real parliamentary data, replace the example URLs in `src/data/parliamentaryVideos.ts` with actual UK Parliament YouTube videos.

## 🎯 What You Need

**5-10 YouTube URLs** from UK Parliament channels, such as:
- Prime Minister's Questions
- Committee hearings (Health, Education, Housing, etc.)
- Parliamentary debates
- Select Committee sessions

## 📝 How to Add Videos

1. **Open** `src/data/parliamentaryVideos.ts`
2. **Replace** the example URLs with real ones:

```typescript
export const PARLIAMENTARY_VIDEOS = [
  {
    id: 'REAL_VIDEO_ID_1',
    url: 'https://www.youtube.com/watch?v=REAL_VIDEO_ID_1',
    title: 'Prime Minister\'s Questions - 15 November 2023',
    channel: 'UK Parliament',
    description: 'Weekly Prime Minister\'s Questions session'
  },
  // Add 4-9 more real videos...
];
```

## 🔍 Where to Find Videos

**UK Parliament YouTube Channel:**
- https://www.youtube.com/@UKParliament
- Look for recent PMQs, committee hearings, debates

**Good Video Types:**
- ✅ Prime Minister's Questions (PMQs)
- ✅ Health and Social Care Committee
- ✅ Education Committee hearings
- ✅ Housing, Communities and Local Government Committee
- ✅ Foreign Affairs Committee
- ✅ Treasury Committee sessions

## 📋 Video Requirements

- **Must have transcripts/captions** (most UK Parliament videos do)
- **Recent content** (last 1-2 years preferred)
- **Clear audio** for good transcript quality
- **Substantive discussions** (not just procedural)

## 🚀 After Adding Videos

Once you've added real URLs:
1. **Restart the development server** (`npm run dev`)
2. **Test ParliQ** - ask about topics covered in your videos
3. **Get real citations** - links will go to actual moments in the videos
4. **Export real data** - TTL export will contain actual parliamentary content

## 💡 Tips

- **Mix topics** - include videos about different policy areas
- **Include different formats** - PMQs, committees, debates
- **Check video length** - shorter videos (10-60 minutes) work well
- **Verify transcripts** - make sure YouTube has generated captions

## 🎯 Result

With real videos added, ParliQ will:
- Answer questions about actual parliamentary discussions
- Provide precise video citations with timestamps
- Export real knowledge graph data
- Work with authentic UK political content

**No API keys needed** - just real YouTube URLs!