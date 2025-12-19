# NymCard Mobile Automation Framework

## Overview

This repository serves as the foundational framework for standardized end-to-end (E2E) automation testing across all NymCard client-facing mobile applications. Built on the Maestro framework, this codebase establishes best practices and patterns that enable engineering teams to rapidly scale their test coverage while maintaining consistency across multiple client applications.

## Purpose

At NymCard, we develop mobile applications for various clients, each with unique branding and features. This automation framework:

- **Standardizes testing practices** across all client applications
- **Accelerates development** by providing a ready-to-use foundation
- **Ensures quality** through consistent test patterns and methodologies
- **Reduces onboarding time** for engineers contributing to test automation
- **Maintains scalability** as the test suite grows

Think of this repository as your starting point. Study the patterns here, understand the structure, and replicate it for your client's application.

## What is Maestro?

[Maestro](https://docs.maestro.dev/) is an open-source mobile and web UI testing framework that allows you to define test flows using declarative YAML syntax. Unlike traditional testing frameworks, Maestro:

- **Handles flakiness automatically** - No more random test failures
- **Waits intelligently** - No manual sleep commands needed
- **Iterates quickly** - No compilation required, instant feedback
- **Works everywhere** - Supports Android, iOS, React Native, Flutter, and more
- **Uses simple YAML** - Accessible to engineers of all backgrounds

### Key Maestro Concepts

**Flows**: A flow represents a user journey or test scenario written in YAML. Example:
```yaml
appId: com.example.app
---
- launchApp
- tapOn: "Login"
- inputText: "[email protected]"
```

**Commands**: Actions like `tapOn`, `inputText`, `assertVisible`, etc.

**Page Object Model (POM)**: A design pattern that centralizes UI element definitions in JavaScript files, reducing duplication and improving maintainability.

## Repository Structure

```
masaar-automation/
├── README.md                          # This file
├── .gitignore
└── <client-name>/                     # e.g., ata, neo, etc.
    ├── .maestro/
    │   ├── config.yaml                # Test suite configuration
    │   ├── elements/                  # Page Object Model (POM) definitions
    │   │   ├── loadElements.yaml      # Imports all element definitions
    │   │   └── <feature>.js           # Element definitions per feature
    │   └── <feature>/                 # Feature-specific flows
    │       ├── FlowName1.yaml
    │       └── FlowName2.yaml
    └── test-output/                   # Test artifacts (screenshots, videos, logs)
        ├── screenshots/
        ├── *.mp4                      # Recorded videos
        └── maestro.log                # Test execution logs
```

### Example: ATA Client Structure

```
ata/
├── .maestro/
│   ├── config.yaml
│   ├── elements/
│   │   ├── loadElements.yaml
│   │   └── login.js
│   └── auth/
│       ├── LoginSuccess.yaml
│       └── LoginFailure.yaml
└── test-output/                       # Configured in config.yaml
    ├── screenshots/
    ├── maestro.log
    └── *.mp4
```

## Understanding the Page Object Model (POM)

The Page Object Model is a design pattern that separates UI element locators from test logic. This provides several benefits:

- **Single source of truth**: Update an element ID in one place, not across dozens of test files
- **Improved readability**: Tests read like user actions, not technical selectors
- **Easier maintenance**: When the UI changes, update only the element definitions

### How POM Works in This Codebase

#### 1. Define Elements in JavaScript Files

Create a JavaScript file for each feature or screen (e.g., `elements/login.js`):

```javascript
// Login Page Elements
output.login = {
  // Navigation
  goToLoginButton: 'go_to_login_btn',

  // Input fields
  phoneNumberInput: 'phone_number_input',

  // Buttons
  loginButton: 'login_button',
  continueButton: 'continue_button',

  // Verification elements
  codeField: 'code_field_0',
  otpInputSection: 'otp_input_section'
}
```

#### 2. Load Elements in Your Flows

Reference elements using the `${output.<namespace>.<element>}` syntax:

```yaml
# Load element definitions
- runScript:
    file: ../elements/login.js

# Use elements in your flow
- tapOn:
    id: ${output.login.phoneNumberInput}

- inputText: '502562503'

- tapOn:
    id: ${output.login.loginButton}
```

#### 3. Create a loadElements.yaml (Optional but Recommended)

For convenience, create a file that loads all element definitions:

```yaml
appId: com.nymcard.client.dev
---
- runScript:
    file: login.js
- runScript:
    file: dashboard.js
```

Then reference it in your flows:

```yaml
- runFlow:
    label: Load element definitions
    commands:
      - runScript:
          file: ../elements/login.js
```

## Prerequisites

Before you start contributing to this codebase, ensure you have:

1. **Maestro CLI installed** - Follow the [official installation guide](https://docs.maestro.dev/getting-started/installing-maestro)
2. **Mobile development environment**:
   - For iOS: Xcode and iOS Simulator
   - For Android: Android Studio and Android Emulator
3. **Your client's mobile application** built and ready to install
4. **Basic understanding of YAML syntax**
5. **Familiarity with your client's application** and its user flows

## Getting Started: Onboarding Checklist

### Step 1: Learn Maestro

Before touching any code, invest time in understanding Maestro:

- [ ] Read the [Maestro documentation](https://docs.maestro.dev/)
- [ ] Complete the [Getting Started guide](https://docs.maestro.dev/getting-started/installing-maestro)
- [ ] Run a simple "Hello World" flow on your local device
- [ ] Understand basic commands: `launchApp`, `tapOn`, `inputText`, `assertVisible`
- [ ] Read about the [Page Object Model pattern](https://docs.maestro.dev/examples/page-object-model)

### Step 2: Study This Codebase

- [ ] Clone this repository
- [ ] Examine the `ata` client package as a reference implementation
- [ ] Read through `ata/.maestro/auth/LoginSuccess.yaml` to understand flow structure
- [ ] Study `ata/.maestro/elements/login.js` to understand POM implementation
- [ ] Review `ata/.maestro/config.yaml` to understand suite configuration

### Step 3: Set Up Your Development Environment

- [ ] Install Maestro CLI
- [ ] Set up Android Emulator or iOS Simulator
- [ ] Install your client's application on the emulator/simulator
- [ ] Verify you can launch the app manually

### Step 4: Choose Your Path

Are you:
- **Adding flows to an existing client?** → See [Adding Flows to Existing Client](#adding-flows-to-an-existing-client)
- **Starting a new client package?** → See [Creating a New Client Package](#creating-a-new-client-package)

## Adding Flows to an Existing Client

Follow this checklist when contributing new test flows to an existing client:

### Checklist

- [ ] **Identify the feature** you want to test (e.g., login, dashboard, payments)
- [ ] **Check if element definitions exist** in `<client>/.maestro/elements/`
  - If yes, review and reuse existing elements
  - If no, create a new JavaScript file for your feature's elements
- [ ] **Create a feature folder** under `<client>/.maestro/` (e.g., `payments/`)
- [ ] **Write your flow(s)** in YAML files inside the feature folder
  - Use descriptive names: `SuccessfulPayment.yaml`, `InsufficientFunds.yaml`
  - Include appropriate tags for filtering: `tags: [payments, success]`
  - Add clear labels to each step for debugging
- [ ] **Update config.yaml** to include your new flows:
  ```yaml
  flows:
    - "auth/*"
    - "payments/*"  # Add your feature folder here

  testOutputDir: "../../<client-name>/test-output"
  ```
- [ ] **Test your flows locally**:
  ```bash
  maestro test <client>/.maestro/
  ```
- [ ] **Verify on both platforms** (iOS and Android) if applicable
- [ ] **Add platform-specific logic** using conditional flows if needed:
  ```yaml
  - runFlow:
      label: Handle Android-specific behavior
      when:
        platform: android
      commands:
        - tapOn: "OK"
  ```
- [ ] **Commit your changes** following the repository's commit conventions

### Example: Adding a Dashboard Flow

1. Create `ata/.maestro/elements/dashboard.js`:
   ```javascript
   output.dashboard = {
     balanceCard: 'balance_card',
     transactionsList: 'transactions_list'
   }
   ```

2. Create `ata/.maestro/dashboard/ViewBalance.yaml`:
   ```yaml
   appId: com.nymcard.masaar.dev
   tags:
     - dashboard
     - smoke
   ---
   - runScript:
       file: ../elements/dashboard.js

   - launchApp

   - assertVisible:
       label: Verify balance card is visible
       id: ${output.dashboard.balanceCard}
   ```

3. Update `ata/.maestro/config.yaml`:
   ```yaml
   flows:
     - "auth/*"
     - "dashboard/*"

   testOutputDir: "ata/test-output"
   ```

## Creating a New Client Package

If you're the first engineer setting up automation for a new client, follow this comprehensive checklist:

### Checklist

- [ ] **Determine the client's shortened name** (e.g., `ata`, `neo`, `masaar`)
  - Use lowercase, 2-4 characters if possible
  - This will be your package folder name

- [ ] **Create the package structure**:
  ```bash
  mkdir -p <client-name>/.maestro/elements
  mkdir -p <client-name>/test-output
  ```

- [ ] **Create the config.yaml file**:
  ```yaml
  # <client-name>/.maestro/config.yaml
  flows:
    - "auth/*"  # Add your initial feature folder

  # Test Output Configuration
  # All test artifacts (screenshots, logs, reports, recordings) will be stored in this directory
  # Path is relative to where the maestro command is executed from (project root)
  testOutputDir: "<client-name>/test-output"

  # Platform Configuration
  platform:
    ios:
      disableAnimations: true
    android:
      disableAnimations: true
  ```

- [ ] **Set up the elements folder**:
  - Create `<client-name>/.maestro/elements/loadElements.yaml`:
    ```yaml
    appId: com.nymcard.<client>.dev
    ---
    # Load element definitions for all flows
    - runScript:
        file: <feature>.js
    ```

- [ ] **Create your first element definition file**:
  - Create `<client-name>/.maestro/elements/<feature>.js` (e.g., `login.js`)
  - Define element IDs following the POM pattern

- [ ] **Create your first feature folder and flow**:
  - Create `<client-name>/.maestro/<feature>/` (e.g., `auth/`)
  - Write your first flow YAML file
  - Ensure it includes:
    - Correct `appId`
    - Relevant `tags`
    - Element definitions loaded via `runScript` or `runFlow`

- [ ] **Test your setup**:
  ```bash
  maestro test <client-name>/.maestro/
  ```

- [ ] **Document client-specific details**:
  - Create a `<client-name>/README.md` with:
    - App ID for iOS and Android
    - Any special setup requirements
    - Known platform-specific quirks

- [ ] **Update the main config.yaml** (if using a monorepo with multiple clients)

### Example: Setting Up "Neo" Client

```bash
# Create structure
mkdir -p neo/.maestro/elements
mkdir -p neo/test-output

# Create config.yaml
cat > neo/.maestro/config.yaml <<EOF
flows:
  - "auth/*"

# Test Output Configuration
# Path is relative to where the maestro command is executed from (project root)
testOutputDir: "neo/test-output"

platform:
  ios:
    disableAnimations: true
  android:
    disableAnimations: true
EOF

# Create loadElements.yaml
cat > neo/.maestro/elements/loadElements.yaml <<EOF
appId: com.nymcard.neo.dev
---
- runScript:
    file: login.js
EOF

# Create element definitions
cat > neo/.maestro/elements/login.js <<EOF
output.login = {
  emailInput: 'email_input',
  passwordInput: 'password_input',
  loginButton: 'login_btn'
}
EOF

# Create feature folder
mkdir neo/.maestro/auth

# Create first flow
cat > neo/.maestro/auth/LoginSuccess.yaml <<EOF
appId: com.nymcard.neo.dev
tags:
  - auth
  - smoke
---
- runScript:
    file: ../elements/login.js

- launchApp

- tapOn:
    id: \${output.login.emailInput}
- inputText: "[email protected]"

- tapOn:
    id: \${output.login.passwordInput}
- inputText: "password123"

- tapOn:
    id: \${output.login.loginButton}
EOF
```

## Best Practices

### 1. Naming Conventions

- **Client folders**: Lowercase, short (e.g., `ata`, `neo`)
- **Feature folders**: Lowercase, descriptive (e.g., `auth`, `payments`, `profile`)
- **Flow files**: PascalCase, descriptive (e.g., `LoginSuccess.yaml`, `TransferFunds.yaml`)
- **Element files**: camelCase JavaScript (e.g., `login.js`, `dashboard.js`)

### 2. Flow Organization

- Group related flows in feature folders
- Use tags to categorize flows: `[auth, smoke, regression]`
- Include both success and failure scenarios
- Add clear labels to each step for easier debugging

### 3. Element Definitions

- Use semantic, descriptive names for elements
- Group related elements together in the JavaScript object
- Add comments to clarify complex element structures
- Keep element files focused on a single feature or screen

### 4. Platform Handling

- Use conditional flows for platform-specific behavior:
  ```yaml
  - runFlow:
      label: Handle iOS-specific navigation
      when:
        platform: ios
      commands:
        - tapOn: "Continue"
  ```
- Take platform-specific screenshots for documentation

### 5. Assertions

- Use `assertVisible` to verify critical UI elements
- Check element states (`enabled`, `disabled`) when relevant
- Add meaningful labels to assertions for clear error messages

### 6. Debugging

- Add descriptive labels to every step
- Use `takeScreenshot` to capture key moments
- Run single flows during development: `maestro test path/to/flow.yaml`
- Use `maestro studio` for interactive test development

## Running Tests

### Run All Tests for a Client

```bash
maestro test <client-name>/.maestro/
```

### Run a Specific Flow

```bash
maestro test <client-name>/.maestro/<feature>/FlowName.yaml
```

### Run Tests with Tags

```bash
maestro test --include-tags=smoke <client-name>/.maestro/
```

### Generate Reports

```bash
# JUnit XML report (for CI/CD)
maestro test --format junit <client-name>/.maestro/

# HTML report
maestro test --format html <client-name>/.maestro/
```

### Run on Specific Platform

```bash
# iOS
maestro test --platform ios <client-name>/.maestro/

# Android
maestro test --platform android <client-name>/.maestro/
```

### Custom Test Output Directory

By default, test artifacts are configured in `config.yaml` to be stored in client-specific directories. You can override this using the `--test-output-dir` flag:

```bash
# Use custom output directory (overrides config.yaml setting)
maestro test --test-output-dir=<client-name>/custom-output <client-name>/.maestro/

# Use debug output directory for detailed debugging
maestro test --debug-output=<client-name>/debug-logs <client-name>/.maestro/

# Flatten output (no timestamps, useful for CI/CD)
maestro test --flatten-debug-output --debug-output=<client-name>/ci-output <client-name>/.maestro/
```

**Note:**
- The `testOutputDir` is already configured in each client's `config.yaml` file to ensure all artifacts (screenshots, logs, reports) are stored in client-specific directories (e.g., `ata/test-output/`), not in the root directory.
- The path in `testOutputDir` is relative to where you execute the `maestro test` command (typically the project root), so `ata/test-output` resolves to the correct client-specific directory.
- Always run `maestro test` commands from the project root directory for paths to resolve correctly.

## Video Recording

Maestro provides two ways to record videos of your test flows locally, which is especially useful for demos, bug reports, and documentation.

### Method 1: Local Recording with Record Command

Use the `maestro record --local` command to create a polished video of a single flow:

```bash
# Record a flow locally (saves to specified file)
maestro record --local <client-name>/.maestro/<feature>/FlowName.yaml <client-name>/test-output/demo.mp4

# Example: Record the login flow for ATA client
maestro record --local ata/.maestro/auth/LoginSuccess.yaml ata/test-output/login-demo.mp4
```

**Important Notes:**
- Videos are saved locally to the specified path
- **Maximum recording duration:** Approximately 2-3 minutes per recording
- Best for creating demo videos or bug reports

### Method 2: In-Flow Recording (For Specific Sections)

You can record specific portions of a flow using `startRecording` and `stopRecording` commands within your YAML flows:

```yaml
appId: com.nymcard.client.dev
---
- launchApp

# Start recording a specific section
- startRecording: critical_flow_section

- tapOn: "Login"
- inputText: "[email protected]"
- tapOn: "Submit"

# Stop recording
- stopRecording

- assertVisible: "Dashboard"
```

**Important Notes:**
- Recording duration is limited to approximately 2-3 minutes per recording session
- Videos are automatically stored in the configured `testOutputDir`
- For longer test suites, use multiple recording sessions for different sections
- Useful for capturing specific interactions during automated test runs

## Test Artifacts and Output

All test artifacts are automatically organized in client-specific directories to maintain a clean repository structure.

### Artifact Types

When you run tests, Maestro generates several types of artifacts:

1. **Screenshots**:
   - **Automatically captured on test failures only** (saved to `testOutputDir`)
   - **Manual capture**: Use the `takeScreenshot` command in your flows to capture screenshots during successful tests
   - Example: `- takeScreenshot: login_screen`
2. **Logs**: Detailed execution logs (`maestro.log`)
3. **Reports**: JUnit XML or HTML test reports
4. **Videos**: Recorded flow executions (when using recording features)
5. **Command Metadata**: JSON files with command execution details

### Directory Structure

```
<client-name>/
├── .maestro/
│   ├── config.yaml           # testOutputDir configured here
│   └── ...
└── test-output/              # Configured in config.yaml
    ├── screenshots/          # Auto-generated screenshots
    ├── maestro.log          # Execution logs
    ├── commands-*.json      # Command metadata
    └── *.mp4               # Recorded videos
```

### Output Configuration Priority

Maestro applies configuration in this order:

1. **CLI flags** (`--test-output-dir`, `--debug-output`)
2. **config.yaml** (`testOutputDir` setting)
3. **Default** (`~/.maestro/tests/<datetime>/`)

Since `testOutputDir` is configured in each client's `config.yaml`, all artifacts will automatically go to the client-specific directory unless you explicitly override it with CLI flags.

### Best Practices for Artifacts

- **Keep videos short**: Recording is limited to 2-3 minutes; break long flows into smaller recorded sections
- **Use meaningful names**: When using `takeScreenshot`, provide descriptive names
- **Clean up regularly**: Test artifacts can accumulate quickly; add cleanup scripts to your CI/CD pipeline
- **Version control**: The `.gitignore` file is configured to exclude `test-output/` directories
- **CI/CD integration**: Use `--flatten-debug-output` flag for cleaner CI artifact organization

## Common Maestro Commands

| Command | Description |
|---------|-------------|
| `launchApp` | Launch the application |
| `tapOn: "text"` | Tap on element containing text |
| `tapOn: { id: "element_id" }` | Tap on element by ID |
| `inputText: "text"` | Enter text into focused input |
| `assertVisible: "text"` | Assert element is visible |
| `assertNotVisible: { id: "id" }` | Assert element is not visible |
| `scroll` | Scroll down |
| `swipe: { direction: "LEFT" }` | Swipe in direction |
| `takeScreenshot: name` | Capture screenshot |
| `startRecording: name` | Start recording a video section (max 2-3 min) |
| `stopRecording` | Stop the current recording |
| `runFlow: { file: "path" }` | Execute another flow |
| `runScript: { file: "path.js" }` | Execute JavaScript file |

## Resources

- **Maestro Documentation**: [https://docs.maestro.dev/](https://docs.maestro.dev/)
- **Maestro GitHub**: [https://github.com/mobile-dev-inc/maestro](https://github.com/mobile-dev-inc/maestro)
- **Page Object Model Guide**: [https://docs.maestro.dev/examples/page-object-model](https://docs.maestro.dev/examples/page-object-model)
- **Maestro Community**: Join discussions and get help

## Contributing

When contributing to this repository:

1. Follow the established patterns and structure
2. Write clear, descriptive flow names and labels
3. Add comments where necessary
4. Test on both iOS and Android when applicable
5. Update this README if you introduce new patterns or practices

## Questions or Issues?

If you encounter problems or have questions:

1. Review the Maestro documentation
2. Check existing flows in this repository for examples
3. Reach out to the QA/Automation team
4. Create an issue in the repository (if applicable)

## Summary

This repository is your foundation for building comprehensive, maintainable mobile automation tests. By following the Page Object Model pattern and Maestro's best practices, you'll create tests that are:

- **Easy to maintain** - Change once, update everywhere
- **Quick to write** - Reuse elements and flows
- **Reliable** - Maestro's built-in resilience reduces flakiness
- **Scalable** - Organized structure supports growth

Start small, follow the patterns, and scale confidently. Happy testing!
