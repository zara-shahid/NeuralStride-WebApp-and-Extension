# 🧠 NeuralStride - AI-Powered Posture Monitoring System

**Real-time posture detection with Chrome Extension featuring a living plant that grows with good posture**

![NeuralStride Banner](assets/neuralstride-thumbnail.png)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-red)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Healthcare Applications](#healthcare-applications)
- [Privacy & Security](#privacy--security)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## 🎯 Overview

NeuralStride is a comprehensive posture monitoring solution consisting of two integrated components:

1. **Web Application** - Full-featured posture detection and monitoring dashboard
2. **Chrome Extension** - Living plant icon that reflects your posture in real-time

The system uses AI computer vision (Google MediaPipe) to track your spine alignment and provides immediate feedback through multiple channels: visual indicators, voice alerts, and gamified elements.

---

## 📁 Project Structure
```
NeuralStride/
├── neuralstride-frontend/          # Web Application (Next.js)
│   ├── app/
│   │   ├── components/
│   │   │   ├── VideoFeed.tsx       # Main posture detection
│   │   │   ├── SpineHeatmap.tsx    # 3D spine visualization
│   │   │   └── VirtualPlant.tsx    # Gamified plant
│   │   ├── lib/
│   │   │   ├── useMediaPipe.ts     # Pose detection hook
│   │   │   ├── useVoiceCoach.ts    # Voice feedback
│   │   │   └── extensionBridge.ts  # Extension communication
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── package.json
│
└── neuralstride-extension/         # Chrome Extension
    ├── background/
    │   └── service-worker.js       # Background service
    ├── popup/
    │   ├── popup.html
    │   ├── popup.css
    │   └── popup.js
    ├── settings/
    │   ├── settings.html
    │   ├── settings.css
    │   └── settings.js
    ├── icons/
    │   └── plant-states/
    └── manifest.json
```

---

## ✨ Features

### 🌐 Web Application

#### **1. Real-Time Posture Detection**
- 33-point body landmark tracking
- Cervical angle measurement (±1° precision)
- Continuous scoring (0-100)
- Visual skeleton overlay
- Color-coded indicators

#### **2. Voice Coach**
- Hands-free verbal feedback
- Immediate alerts on posture changes
- Encouragement messages
- Male/female voice options
- Toggle on/off

#### **3. 3D Spine Heatmap**
- 24 vertebrae visualization
- Color-coded stress levels
- Real-time updates
- Regional breakdown (Cervical, Thoracic, Lumbar)

#### **4. Virtual Posture Plant**
- Grows with good posture (75+ score)
- Wilts with poor posture (<50 score)
- 5 growth stages
- Health bar tracking
- Gamified motivation

#### **5. Metrics Dashboard**
- Posture score (0-100)
- Cervical angle (degrees)
- Session tracking
- Real-time status

### 📱 Chrome Extension

#### **1. Living Plant Icon**
- Icon changes based on posture
- 7 plant states (Dormant → Bloom → Wilting)
- Badge shows current score
- Color-coded badge (Green/Yellow/Red)
- Real-time updates

#### **2. Quick Stats Popup**
- Current posture score
- Session time
- Streak tracking
- Link to full dashboard

#### **3. Desktop Notifications**
- Critical posture alerts
- Configurable settings
- Non-intrusive reminders

#### **4. Settings Panel**
- Voice coach configuration
- Notification preferences
- Monitoring intervals
- Data export
- Theme customization

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: TailwindCSS

### AI & Computer Vision
- **Pose Detection**: Google MediaPipe (33 landmarks)
- **ML Runtime**: TensorFlow.js
- **Processing**: 100% client-side
- **Performance**: 15-30 FPS

### Visualization
- **Charts**: Chart.js
- **Graphics**: HTML5 Canvas
- **Animations**: CSS3

### Audio
- **Voice**: Web Speech API

### Chrome Extension
- **Manifest**: V3
- **Background**: Service Worker
- **Storage**: Chrome Storage API
- **Communication**: Chrome Messaging API

---

## 💻 Installation

### Prerequisites

- ✅ Node.js (v14+) - [Download](https://nodejs.org/)
- ✅ npm (comes with Node.js)
- ✅ Git - [Download](https://git-scm.com/)
- ✅ Webcam
- ✅ Google Chrome

**Check installation:**
```bash
node --version
npm --version
```

---

### 🎯 Quick Start

#### Step 1: Clone Repository
```bash
git clone https://github.com/zara-shahid/NeuralStride-WebApp-and-Extension.git
cd neuralstride
```

#### Step 2: Setup Web App
```bash
cd neuralstride-frontend
npm install
npm run dev
```

**Web app running at:** `http://localhost:3000` ✅

#### Step 3: Load Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **"Developer mode"** (top-right)
3. Click **"Load unpacked"**
4. Select `neuralstride-extension` folder
5. Extension loaded! 🌱

#### Step 4: Connect Extension

1. Go to `chrome://extensions/`
2. Copy **Extension ID** (e.g., `abcdef123456...`)
3. Open `neuralstride-frontend/app/lib/extensionBridge.ts`
4. Update line 4:
```typescript
   private extensionId: string = 'YOUR_EXTENSION_ID_HERE';
```
5. Save and restart web app

---

## 📖 Usage

### Start Monitoring
```bash
# Start web app
cd neuralstride-frontend
npm run dev
```

1. Open `http://localhost:3000`
2. Click **"Start Monitoring"**
3. Allow camera access
4. Sit 2-3 feet from camera
5. Work normally!

### Understanding Scores

#### **Posture Score (0-100)**
- 90-100: Excellent ✅
- 75-89: Good 🟢
- 50-74: Fair 🟡
- 30-49: Poor 🟠
- 0-29: Critical 🔴

#### **Cervical Angle**
- 170-180°: Perfect ✅
- 160-170°: Very good 🟢
- 150-160°: Good 🟡
- 140-150°: Fair 🟠
- <140°: Poor 🔴

#### **Extension Icon States**
- 🌺 Bloom (85-100): Perfect posture
- 🌸 Flowering (70-85): Good posture
- 🌿 Growing (50-70): Fair posture
- 🌱 Sprout (30-50): Poor posture
- 🥀 Wilting (<30): Critical posture
- 🌰 Dormant: Not monitoring

---

## 🔧 How It Works

### Architecture
```
Web App → MediaPipe → Posture Calculation → Extension Bridge
    ↓                                              ↓
Webcam Feed                              Chrome Extension
    ↓                                              ↓
Voice Coach                              Living Plant Icon
Spine Heatmap                            Badge Score
Virtual Plant                            Notifications
```

### Posture Algorithm

**1. Landmark Detection**
- MediaPipe identifies 33 body points
- Focuses on ears, shoulders, hips

**2. Angle Calculation**
```typescript
// Average positions
ear = average(leftEar, rightEar)
shoulder = average(leftShoulder, rightShoulder)
hip = average(leftHip, rightHip)

// Calculate vectors
shoulderToEar = ear - shoulder
shoulderToHip = hip - shoulder

// Compute angle
angle = arccos(dotProduct / (magnitude1 * magnitude2))
```

**3. Score Mapping**
- 170-180°: Score 100
- 165-170°: Score 95-85
- 160-165°: Score 85-75
- 150-160°: Score 70-50
- 140-150°: Score 50-30
- <140°: Score 30-0

### Communication Flow
```javascript
// Web app sends data
extensionBridge.sendPostureData({
  postureScore: 85,
  cervicalAngle: 172,
  isPersonDetected: true
});

// Extension receives
chrome.runtime.onMessageExternal.addListener((request) => {
  updatePlantIcon(request.data.postureScore);
  updateBadge(request.data.postureScore);
});
```

---

## 🏥 Healthcare Applications

### For Individuals
- ✅ Prevent "tech neck"
- ✅ Reduce chronic pain
- ✅ Avoid medical costs
- ✅ Build healthy habits

### For Physical Therapists
- ✅ Remote monitoring
- ✅ Track progress
- ✅ Objective measurements
- ✅ Compliance verification

### For Corporations
- ✅ Injury prevention
- ✅ Reduce compensation claims
- ✅ Employee wellness
- ✅ OSHA compliance

### For Researchers
- ✅ Posture data collection
- ✅ Ergonomic studies
- ✅ Clinical trials

---

## 🔒 Privacy & Security

### Privacy-First Design
- ✅ 100% local processing
- ✅ No data collection
- ✅ No user tracking
- ✅ Session-only storage
- ✅ No account required

### What We DON'T Do
- ❌ Don't record video
- ❌ Don't store images
- ❌ Don't send data to servers
- ❌ Don't track users
- ❌ Don't sell data

**GDPR Compliant | HIPAA-Friendly | No Server Required**

---

## 🐛 Troubleshooting

### Web App Won't Start
```bash
# npm not found
Solution: Install Node.js

# Port 3000 in use
Solution: npm run dev -- -p 3001
```

### Camera Not Working
```
Solution:
1. Click 🔒 in address bar
2. Site settings → Camera → Allow
3. Refresh page
```

### Extension Not Loading
```
Solution:
1. Check icon files exist
2. Verify manifest.json
3. Reload: chrome://extensions/ → Reload
```

### Extension Not Connecting
```
Solution:
1. Get correct ID from chrome://extensions/
2. Update extensionBridge.ts
3. Restart web app
```

### Poor Performance
```
Solution:
1. Close other tabs
2. Use Chrome
3. Close unnecessary apps
```

---

## 📊 Performance

### System Requirements

**Minimum:**
- CPU: Dual-core 2.0 GHz
- RAM: 4 GB
- Webcam: 720p

**Recommended:**
- CPU: Quad-core 2.5 GHz+
- RAM: 8 GB+
- Webcam: 1080p

### Metrics
- Frame Rate: 15-30 FPS
- Latency: <50ms
- Memory: ~85MB
- CPU: 15-25%
- Accuracy: ±5°

### Browser Support

| Browser | Support | Performance |
|---------|---------|-------------|
| Chrome 90+ | ✅ | ⭐⭐⭐⭐⭐ |
| Edge 90+ | ✅ | ⭐⭐⭐⭐⭐ |
| Firefox 88+ | ✅ | ⭐⭐⭐⭐ |
| Safari 14+ | ✅ | ⭐⭐⭐⭐ |

---

## 🛣️ Roadmap

### Current ✅
- [x] Real-time posture detection
- [x] Voice coaching
- [x] Spine heatmap
- [x] Virtual plant
- [x] Chrome extension
- [x] Extension integration

### Planned 🔄
- [ ] Medical report generator
- [ ] Pain tracking
- [ ] Exercise tracker
- [ ] Session history
- [ ] Data export
- [ ] User authentication
- [ ] Cloud sync
- [ ] Mobile app
- [ ] API integrations

---

## 📄 License

MIT License
```
Copyright (c) 2026 NeuralStride

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

## 🙏 Acknowledgments

### Technologies
- [MediaPipe](https://google.github.io/mediapipe/) - Computer vision
- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Chart.js](https://www.chartjs.org/) - Charts

### Inspiration
- OSHA ergonomic research
- Physical therapy best practices
- Open source community

---

## 📞 Contact

### Support
- **Issues**: [GitHub Issues](https://github.com/zara-shahid/NeuralStride-WebApp-and-Extension/issues)
- **Email**: zarashahid444@gmail.com

### Follow
- **GitHub**: [@YOUR_USERNAME](https://github.com/zara-shahid)
- **Website**: [yourwebsite.com](https://zarashahid.vercel.app.com)

---

## 🌟 Why NeuralStride?

**Traditional Solutions:**
- ❌ Expensive wearables ($80-150)
- ❌ Privacy concerns
- ❌ No real-time feedback

**NeuralStride:**
- ✅ Free and open source
- ✅ 100% privacy-first
- ✅ Real-time feedback
- ✅ Gamified experience
- ✅ Chrome integration

---

<div align="center">

**"Because your health shouldn't be an afterthought in productivity."**

⭐ Star this repo • 🔀 Fork it • 🐛 Report bugs

*Built with ❤️ for better workplace health*

</div>
