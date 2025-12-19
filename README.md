# NymCard Mobile Automation Framework

A standardized framework for E2E mobile testing across all NymCard client applications using [Maestro](https://docs.maestro.dev/). This repository provides patterns and best practices to help you quickly build maintainable test suites for any client.

## Quick Start

### Prerequisites
- [Maestro CLI](https://docs.maestro.dev/getting-started/installing-maestro) installed
- iOS Simulator or Android Emulator set up
- Your client's mobile app built and ready to test

### New to Maestro?
Read the [Maestro docs](https://docs.maestro.dev/) to understand:
- **Flows**: Test scenarios written in YAML
- **Commands**: Actions like `tapOn`, `inputText`, `assertVisible`
- **Page Object Model (POM)**: Centralized UI element definitions (see below)

## Repository Structure

```
<client-name>/                         # e.g., ata, neo
├── .maestro/
│   ├── config.yaml                    # Test configuration (flows, testOutputDir)
│   ├── elements/                      # Page Object Model (POM) definitions
│   │   └── <feature>.js               # Element IDs per feature (login.js, dashboard.js)
│   └── <feature>/                     # Feature-specific test flows
│       ├── SuccessFlow.yaml
│       └── FailureFlow.yaml
└── test-output/                       # Auto-generated test artifacts
    ├── screenshots/
    ├── *.mp4
    └── maestro.log
```

## Page Object Model (POM) Pattern

Centralizing UI element IDs makes tests easier to maintain. When the UI changes, update element IDs in one place.

**1. Define elements** in `elements/<feature>.js`:
```javascript
output.login = {
  phoneNumberInput: 'phone_number_input',
  loginButton: 'login_button'
}
```

**2. Use in flows** via `${output.<namespace>.<element>}`:
```yaml
- runScript:
    file: ../elements/login.js

- tapOn:
    id: ${output.login.phoneNumberInput}
- inputText: '502562503'
- tapOn:
    id: ${output.login.loginButton}
```

## Workflows

Choose your workflow:

### Adding Flows to an Existing Client

**Steps:**
1. Create element definitions in `<client>/.maestro/elements/<feature>.js` (or reuse existing)
2. Create feature folder: `<client>/.maestro/<feature>/`
3. Write YAML flows with descriptive names and tags
4. Update `config.yaml` to include new flows:
   ```yaml
   flows:
     - "auth/*"
     - "payments/*"  # Add your new feature
   ```
5. Test locally: `maestro test <client>/.maestro/`

**Platform-specific handling:**
```yaml
- runFlow:
    when:
      platform: android
    commands:
      - tapOn: "OK"
```

### Creating a New Client Package

**Steps:**
1. Create directory structure:
   ```bash
   mkdir -p <client>/.maestro/elements <client>/test-output
   ```

2. Create `<client>/.maestro/config.yaml`:
   ```yaml
   flows:
     - "auth/*"

   testOutputDir: "<client>/test-output"

   platform:
     ios:
       disableAnimations: true
     android:
       disableAnimations: true
   ```

3. Create element definitions: `<client>/.maestro/elements/<feature>.js`
4. Create feature folder and write first flow
5. Test: `maestro test <client>/.maestro/`

**Reference:** See the `ata` client as an example implementation.

## Best Practices

- **Naming**: Clients `lowercase` (ata), features `lowercase` (auth), flows `PascalCase` (LoginSuccess.yaml)
- **Organization**: Group flows by feature, use tags (`auth`, `smoke`, `regression`)
- **Elements**: Use descriptive names, keep one feature per JS file
- **Assertions**: Add labels for clear error messages: `label: "Verify login button enabled"`
- **Debugging**: Use `takeScreenshot` and `maestro studio` for interactive development

## Running Tests

```bash
# Run all client tests (from project root)
maestro test <client>/.maestro/

# Run specific flow
maestro test <client>/.maestro/<feature>/FlowName.yaml

# Run with tags
maestro test --include-tags=smoke <client>/.maestro/

# Run on specific platform
maestro test --platform ios <client>/.maestro/

# Generate reports
maestro test --format junit <client>/.maestro/  # CI/CD
maestro test --format html <client>/.maestro/   # Human-readable
```

**Note:** Test artifacts (screenshots, videos, logs) are auto-stored in `<client>/test-output/` as configured in `config.yaml`. Always run commands from the project root.

## Video Recording

**Command-line recording** (demos, bug reports):
```bash
maestro record --local <client>/.maestro/<feature>/Flow.yaml <client>/test-output/demo.mp4
```

**In-flow recording** (specific sections, max 2-3 minutes):
```yaml
- startRecording: section_name
- tapOn: "Login"
- inputText: "user@example.com"
- stopRecording
```

Videos are saved to `<client>/test-output/` automatically.

## Test Artifacts

Maestro generates artifacts in `<client>/test-output/`:
- **Screenshots**: Auto-captured on failures, or use `- takeScreenshot: name`
- **Videos**: From recording commands (see above)
- **Logs**: Execution details in `maestro.log`
- **Reports**: JUnit XML or HTML (via `--format` flag)

**Note:** All artifacts are git-ignored and stored per-client.

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

- Follow established patterns (see `ata` client for reference)
- Write clear flow names and labels
- Test on both iOS and Android when applicable
- Update this README when introducing new patterns

## Need Help?

1. Check the [Maestro docs](https://docs.maestro.dev/)
2. Review existing flows in the `ata` client
3. Reach out to the QA/Automation team

---

**Remember:** This framework helps you build maintainable, scalable tests quickly. Start with simple flows, follow the POM pattern, and scale confidently.
