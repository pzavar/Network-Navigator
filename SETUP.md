# Network Navigator - Local Setup Guide

## 🚀 Quick Start Options

### Option 1: Direct File Access (Simplest)
1. **Double-click** `launch.html` or `index.html`
2. **Your browser opens** the app directly
3. **Bookmark** the page for quick access

### Option 2: Local Server (Recommended)
Choose your preferred method:

#### A) Python Server (Most Compatible)
```bash
# Mac/Linux
./start-app.sh

# Windows
start-app.bat

# Or manually
python -m http.server 8000
```
Then open: http://localhost:8000

#### B) Node.js Server (Better Performance)
```bash
node server.js
```
Then open: http://localhost:8000

## 📱 Making It Always Ready

### 1. Browser Bookmark
- Open the app in your browser
- Press `Cmd+D` (Mac) or `Ctrl+D` (Windows)
- Name it "Network Navigator"
- Access anytime from your bookmarks bar

### 2. Desktop Shortcut
- **Mac**: Right-click `launch.html` → "Make Alias" → Drag to Desktop
- **Windows**: Right-click `launch.html` → "Create shortcut" → Move to Desktop

### 3. Browser Homepage
- Set `launch.html` as your browser's homepage
- Opens automatically when you start your browser

### 4. Auto-Start Server (Advanced)
Create a startup script to automatically run the server:

#### Mac (using Automator):
1. Open Automator
2. Create "Application"
3. Add "Run Shell Script" action
4. Add: `cd "/Users/parhamhajzavar/Desktop/My Apps/network-navigator" && python3 -m http.server 8000`
5. Save as "Network Navigator Server"
6. Add to Login Items in System Preferences

#### Windows (using Task Scheduler):
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: "When I log on"
4. Action: Start a program
5. Program: `python.exe`
6. Arguments: `-m http.server 8000`
7. Start in: `C:\path\to\network-navigator`

## 🔧 Troubleshooting

### Python Not Found
- **Mac**: Install from [python.org](https://python.org)
- **Windows**: Install from [python.org](https://python.org) or Microsoft Store

### Port 8000 Busy
- Change port in the scripts to 8001, 8002, etc.
- Or kill the process using port 8000

### File Permissions (Mac/Linux)
```bash
chmod +x start-app.sh
```

## 📊 Features Available Locally

✅ **Full AI Integration** - DistilGPT-2 model runs in browser
✅ **Data Persistence** - All data saved locally
✅ **Offline Capable** - Works without internet (after first load)
✅ **Mobile Responsive** - Perfect on all devices
✅ **Dark Mode** - Toggle between themes
✅ **Export/Import** - Backup your data
✅ **Analytics** - Track your networking progress

## 🎯 Pro Tips

1. **Bookmark the app** for instant access
2. **Use the local server** for best performance
3. **Export your data regularly** as backup
4. **Enable dark mode** for comfortable extended use
5. **Check analytics** to track your networking success

## 🔄 Updates

To update the app:
1. Replace the files with new versions
2. Refresh your browser
3. Your data remains intact (stored locally)

---

**Your Network Navigator is now always ready to use! 🎉**
