# Node.js Setup Guide

## Quick Installation (Choose One Method)

### Method 1: Official Installer (Easiest - Recommended)

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Click "Download Node.js (LTS)" - this will download the macOS installer
   - The LTS version (20.x or 22.x) is recommended

2. **Install:**
   - Open the downloaded `.pkg` file
   - Follow the installation wizard (click "Continue" and "Install")
   - Enter your password when prompted

3. **Verify Installation:**
   - Close and reopen your terminal
   - Run: `node --version` and `npm --version`
   - You should see version numbers

4. **Install Project Dependencies:**
   ```bash
   cd /Users/yohaanvaryani/hackathon/kiroween/kiroween
   npm install
   ```

5. **Start Development Server:**
   ```bash
   npm run deb
   # or
   npm run dev
   ```

### Method 2: Homebrew (If you prefer package managers)

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   - Follow the prompts and enter your password
   - After installation, you may need to add Homebrew to your PATH:
     ```bash
     echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
     source ~/.zshrc
     ```

2. **Install Node.js:**
   ```bash
   brew install node
   ```

3. **Verify and Continue:**
   ```bash
   node --version
   npm --version
   cd /Users/yohaanvaryani/hackathon/kiroween/kiroween
   npm install
   npm run deb
   ```

### Method 3: NVM (Node Version Manager - For managing multiple Node versions)

1. **Install NVM:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Reload your shell:**
   ```bash
   source ~/.zshrc
   ```

3. **Install and use Node.js:**
   ```bash
   nvm install 20
   nvm use 20
   nvm alias default 20
   ```

4. **Verify and Continue:**
   ```bash
   node --version
   npm --version
   cd /Users/yohaanvaryani/hackathon/kiroween/kiroween
   npm install
   npm run deb
   ```

## Troubleshooting

### If `npm` command is still not found after installation:

1. **Restart your terminal** completely (close and reopen)

2. **Check your PATH:**
   ```bash
   echo $PATH
   ```
   Should include `/usr/local/bin` or `/opt/homebrew/bin`

3. **Manually add to PATH** (if needed):
   ```bash
   echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

### If you get permission errors:

- Make sure you're using the correct password
- On macOS, you may need to allow the installation in System Settings > Privacy & Security

## After Installation

Once Node.js is installed, you can:

1. **Install dependencies:**
   ```bash
   cd /Users/yohaanvaryani/hackathon/kiroween/kiroween
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run deb
   ```
   The app will be available at `http://localhost:5173`

3. **Other useful commands:**
   - `npm run build` - Build for production
   - `npm run preview` - Preview production build
   - `npm test` - Run tests
   - `npm run lint` - Check code quality

