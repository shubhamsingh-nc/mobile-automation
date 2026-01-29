# Test Farm Setup Guide

This guide covers setting up an internal mobile device test farm for running Maestro E2E tests at scale.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                           │
│                    (Workflow Dispatcher)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│   Android Runner(s)   │   │     iOS Runner(s)     │
│   [self-hosted,       │   │   [self-hosted,       │
│    android-device]    │   │    ios-device]        │
├───────────────────────┤   ├───────────────────────┤
│  ┌─────┐ ┌─────┐     │   │  ┌─────┐ ┌─────┐     │
│  │Dev 1│ │Dev 2│ ... │   │  │iPhone│ │iPad │ ... │
│  └─────┘ └─────┘     │   │  └─────┘ └─────┘     │
└───────────────────────┘   └───────────────────────┘
     Linux/Mac/Windows            macOS only
```

## Hardware Requirements

### Minimum Setup (Small Team)
| Component | Quantity | Purpose |
|-----------|----------|---------|
| Mac Mini / MacBook | 1 | Hosts both iOS and Android runners |
| Android phone | 1-2 | Android testing |
| iPhone | 1-2 | iOS testing |
| USB hub (powered) | 1 | Connect multiple devices |

### Recommended Setup (Medium Team)
| Component | Quantity | Purpose |
|-----------|----------|---------|
| Mac Mini (M1/M2) | 2 | Dedicated iOS runner |
| Linux machine | 1 | Dedicated Android runner |
| Android phones | 3-5 | Various screen sizes/OS versions |
| iPhones | 2-3 | Various screen sizes/iOS versions |
| USB hubs (powered) | 2 | Reliable device connections |

### Enterprise Setup (Large Team)
| Component | Quantity | Purpose |
|-----------|----------|---------|
| Mac Mini rack | 3+ | iOS testing at scale |
| Linux servers | 2+ | Android testing at scale |
| Android device farm | 10+ | Full device matrix |
| iOS device farm | 5+ | Full device matrix |
| Network switch | 1 | Dedicated test network |
| UPS | 1 | Power protection |

---

## Network Configuration

### Dedicated Test Network (Recommended)
Isolate test devices on a separate VLAN or network segment:

```
Internet
    │
┌───┴───┐
│Router │
└───┬───┘
    │
┌───┴────────────────────────┐
│  Switch / VLAN             │
├────────────────────────────┤
│  - Runner machines         │
│  - Test devices (WiFi AP)  │
│  - Isolated from prod      │
└────────────────────────────┘
```

### Firewall Rules
Allow outbound traffic from runners to:
- `github.com` (443) - API and runner communication
- `*.actions.githubusercontent.com` (443) - Downloading actions
- `ghcr.io` (443) - Container registry (if needed)

---

## Device Preparation

### Android Devices

#### 1. Factory Reset (Recommended for dedicated test devices)
```
Settings → System → Reset → Factory data reset
```

#### 2. Initial Setup
- Skip all Google account setup (or use a dedicated test account)
- Disable all automatic updates
- Set screen timeout to maximum or "Never"
- Disable screen lock / PIN

#### 3. Enable Developer Options
```bash
# On device:
Settings → About phone → Tap "Build number" 7 times

# Then:
Settings → Developer options → Enable:
  - USB debugging
  - Stay awake (screen on while charging)
  - Disable animations (optional, speeds up tests)
```

#### 4. Disable Interfering Features
```
Settings → Developer options:
  - Window animation scale → Off
  - Transition animation scale → Off
  - Animator duration scale → Off

Settings → Display:
  - Adaptive brightness → Off
  - Set fixed brightness level

Settings → Apps → Disable:
  - Software update apps
  - Carrier bloatware
```

#### 5. Authorize Computer
```bash
# Connect via USB and run:
adb devices

# Accept the prompt on the device
# Check that status shows "device" not "unauthorized"
```

### iOS Devices

#### 1. Initial Setup
- Use a dedicated Apple ID (or skip sign-in for Simulator testing)
- Disable auto-updates: Settings → General → Software Update → Automatic Updates → Off
- Disable auto-lock: Settings → Display & Brightness → Auto-Lock → Never

#### 2. Enable Developer Mode (iOS 16+)
```
Settings → Privacy & Security → Developer Mode → Enable
# Restart when prompted
```

#### 3. Trust Computer
```bash
# Connect via USB
# Tap "Trust" on the device when prompted
# Enter device passcode

# Verify connection:
idevice_id -l
# or
xcrun xctrace list devices
```

#### 4. Disable Interfering Features
```
Settings → Notifications → Disable for all non-essential apps
Settings → General → Background App Refresh → Off
Settings → Siri & Search → Disable Siri
```

---

## Runner Machine Setup

### macOS Runner (iOS + Android)

#### 1. System Configuration
```bash
# Prevent sleep
sudo pmset -a disablesleep 1
sudo pmset -a sleep 0

# Disable screen saver
defaults write com.apple.screensaver idleTime 0

# Enable remote login (for maintenance)
sudo systemsetup -setremotelogin on
```

#### 2. Install Dependencies
```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Android tools
brew install android-platform-tools

# iOS tools
xcode-select --install
brew install libimobiledevice
brew install ios-deploy

# Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
echo 'export PATH="$PATH:$HOME/.maestro/bin"' >> ~/.zshrc
source ~/.zshrc
```

#### 3. Grant Permissions
System Preferences → Security & Privacy → Privacy:
- **Accessibility**: Add Terminal, iTerm, or runner process
- **Full Disk Access**: Add Terminal (if needed)
- **Developer Tools**: Enable

#### 4. Verify Setup
```bash
# Android
adb devices

# iOS
xcrun simctl list devices booted
idevice_id -l

# Maestro
maestro --version
```

### Linux Runner (Android only)

#### 1. Install Dependencies
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  android-tools-adb \
  openjdk-11-jdk \
  curl \
  git

# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
echo 'export PATH="$PATH:$HOME/.maestro/bin"' >> ~/.bashrc
source ~/.bashrc
```

#### 2. USB Permissions
```bash
# Create udev rule for Android devices
sudo tee /etc/udev/rules.d/51-android.rules << 'EOF'
SUBSYSTEM=="usb", ATTR{idVendor}=="*", MODE="0666", GROUP="plugdev"
EOF

sudo udevadm control --reload-rules
sudo usermod -aG plugdev $USER
# Log out and back in
```

#### 3. Verify Setup
```bash
adb devices
maestro --version
```

---

## GitHub Runner Registration

### Single Runner (All Devices on One Machine)
```bash
# Download runner (from GitHub Settings → Actions → Runners → New)
mkdir actions-runner && cd actions-runner
curl -o actions-runner-osx-arm64-2.xxx.x.tar.gz -L https://github.com/actions/runner/releases/download/v2.xxx.x/actions-runner-osx-arm64-2.xxx.x.tar.gz
tar xzf ./actions-runner-osx-arm64-2.xxx.x.tar.gz

# Configure with both labels
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO --token YOUR_TOKEN

# When prompted for labels:
# android-device,ios-device
```

### Multiple Runners (Dedicated Machines)

**Android Runner Machine:**
```bash
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO --token YOUR_TOKEN
# Labels: android-device
```

**iOS Runner Machine:**
```bash
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO --token YOUR_TOKEN
# Labels: ios-device
```

### Run as Service
```bash
# Install
./svc.sh install

# Start
./svc.sh start

# Check status
./svc.sh status

# View logs (macOS)
tail -f ~/Library/Logs/actions-runner/*.log
```

---

## Device Matrix Strategy

### Recommended Test Devices

#### Android
| Device | OS Version | Screen Size | Purpose |
|--------|------------|-------------|---------|
| Pixel 7 | Android 14 | 6.3" | Latest stock Android |
| Samsung S23 | Android 14 | 6.1" | Popular flagship |
| Samsung A54 | Android 13 | 6.4" | Mid-range |
| Pixel 4a | Android 12 | 5.8" | Smaller screen |

#### iOS
| Device | OS Version | Screen Size | Purpose |
|--------|------------|-------------|---------|
| iPhone 15 Pro | iOS 17 | 6.1" | Latest flagship |
| iPhone 13 | iOS 16 | 6.1" | Previous gen |
| iPhone SE 3 | iOS 17 | 4.7" | Small screen |
| iPad Air | iPadOS 17 | 10.9" | Tablet testing |

---

## Monitoring and Maintenance

### Daily Checks
```bash
# Verify all devices connected
adb devices
idevice_id -l

# Check runner status
./svc.sh status

# Review recent workflow runs in GitHub Actions
```

### Weekly Maintenance
- Check for OS updates on runner machines (apply during maintenance window)
- Verify device battery health
- Clear test artifacts and logs
- Review and rotate test accounts if needed

### Automated Health Checks
Add a health check workflow:

```yaml
# .github/workflows/device-health-check.yml
name: Device Health Check

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours

jobs:
  check-android:
    runs-on: [self-hosted, android-device]
    steps:
      - name: Check Android devices
        run: |
          count=$(adb devices | grep -E "device$" | wc -l)
          echo "Connected Android devices: $count"
          if [ "$count" -eq 0 ]; then
            echo "::error::No Android devices connected!"
            exit 1
          fi
          adb devices -l

  check-ios:
    runs-on: [self-hosted, ios-device]
    steps:
      - name: Check iOS devices
        run: |
          sim_count=$(xcrun simctl list devices booted | grep -c "Booted" || echo "0")
          phys_count=$(idevice_id -l 2>/dev/null | wc -l || echo "0")
          total=$((sim_count + phys_count))
          echo "Connected iOS devices: $total"
          if [ "$total" -eq 0 ]; then
            echo "::error::No iOS devices connected!"
            exit 1
          fi
```

---

## Troubleshooting

### Device Disconnects Frequently
- Use high-quality USB cables (data + power capable)
- Use powered USB hubs
- Check for loose connections
- On Android: Enable "USB debugging (Security settings)" if available

### Tests Fail with "Device not found"
```bash
# Android
adb kill-server && adb start-server
adb devices

# iOS - reconnect and re-trust
# Unplug device, plug back in, tap "Trust"
```

### Runner Goes Offline
```bash
# Check service status
./svc.sh status

# Restart service
./svc.sh stop
./svc.sh start

# Check logs for errors
tail -100 ~/Library/Logs/actions-runner/*.log  # macOS
journalctl -u actions.runner.* -n 100          # Linux
```

### Slow Test Execution
- Disable animations on Android devices
- Close unnecessary apps on devices
- Ensure devices are charged or plugged in
- Check network latency to GitHub

---

## Cost Considerations

### Budget Setup (~$500-1000)
- Used Mac Mini (M1) - ~$400-600
- Used Android phones - ~$100-200
- USB hub - ~$30
- Cables - ~$20

### Production Setup (~$3000-5000)
- Mac Mini M2 - ~$600 x 2
- New test devices - ~$1500-2000
- Infrastructure (cables, hubs, rack) - ~$200-300

### Ongoing Costs
- Electricity: ~$10-30/month
- Internet: Existing connection
- Device replacement: Budget 10-20%/year for device failures

---

## Security Considerations

- Use dedicated test accounts, never production credentials
- Isolate test network from production
- Regularly rotate runner tokens
- Don't store secrets on devices; use GitHub Secrets
- Consider device management (MDM) for enterprise setups
- Wipe devices before decommissioning
