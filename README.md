# StayFocused – Reducing Online Distractions Through Real-Time Browser Interventions

**StayFocused** is a Chrome browser extension designed to help students maintain sustained focus during study sessions by blocking distracting websites, tracking distraction behavior, and motivating consistent habits through gamification features like streaks, rewards, and a virtual focus garden.

The platform combines **distraction control** with **behavioral feedback**, offering a flexible and motivating alternative to rigid focus tools.

---

## 🚀 Features

- **Focus Timer**
  - Customizable focus sessions (15–180 minutes)
  - Start, pause, and resume support
  - Automatic enforcement of blocking during active sessions

- **Website Blocking**
  - Default list of commonly distracting websites
  - User-configurable blacklist
  - Real-time interception and redirection to a blocking screen

- **Distraction Tracking**
  - Counts blocked website access attempts
  - Per-session and per-minute distraction rate
  - Helps users reflect on distraction patterns

- **Gamified Motivation**
  - **Focus Garden**: Earn plants, XP, and coins for completed sessions
  - **Streak System**: Tracks consecutive focus days with milestone rewards
  - Encourages habit formation and long-term engagement

- **Analytics & Data Export**
  - Export focus data as **JSON, CSV, or HTML**
  - Includes focus time, blocked attempts, and session trends
  - Visual insights through HTML reports

- **Personalization**
  - Editable blocked website list
  - Adjustable default focus duration
  - Notification blocking toggle
  - Syncs preferences across devices

- **Privacy-Focused**
  - All processing done locally
  - No external servers or data collection

---

## 🧠 Research Motivation

Digital distractions significantly impact productivity in computer-based learning. Existing focus tools often rely on strict blocking mechanisms and lack motivational support.

**Research Question:**

> How can a browser extension minimize online distractions while motivating students to maintain consistent focus during study sessions?

StayFocused addresses this by combining **website blocking** with **motivational feedback systems**.

---

## 🛠 Tech Stack

- **Platform**: Google Chrome Extension  
- **Frontend**: HTML, CSS, JavaScript  
- **APIs Used**:
  - Chrome Storage Sync API
  - Chrome Web Navigation API
  - Chrome Alarms API  
- **Architecture**: Service-worker–based background processing

---

## 🧩 System Architecture

- **Service Worker**
  - Manages timers, blocking logic, and session states
- **Navigation Interception**
  - Detects and redirects blocked website requests
- **Local Storage & Sync**
  - Stores preferences, streaks, and session data
  - Synchronizes across devices
- **Client-Side Analytics**
  - Tracks focus time and distraction attempts
  - Generates exportable reports

All features run **locally** to ensure performance and user privacy.

---

## 📊 User Study & Evaluation

- **Participants**: 7 university students (ages 19–25)
- **Evaluation Method**: Quantitative + Qualitative user study

### Key Findings
- **85.7%** reported improved focus
- **71.4%** experienced fewer distractions
- Majority completed more work using the extension
- Users preferred studying with StayFocused enabled
- Low perceived intrusiveness

### Most Impactful Features
- Website blocking
- Block-attempt counter
- Streak and reward systems

---

## ⚡ Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/StayFocused.git
   cd StayFocused
   ```

2. Open Chrome Extensions:
  - Navigate to chrome://extensions/
  - Enable Developer Mode

3. Load the extension:
  - Click Load unpacked
  - Select the project directory

4. Start a focus session 🚀

---

## 📈 Future Improvements
- Clearer visual/audio indicators for session start and end
- Adaptive blocking based on usage behavior
- Long-term behavioral analytics
- Larger-scale user studies
- Personalized focus interventions

---
