# Testing the Extension Locally

This guide will walk you through how to test and debug your Comodoro extension locally in VS Code.

## Prerequisites

1. **Node.js and npm**: Make sure you have Node.js installed (check with `node --version` and `npm --version`)
2. **VS Code**: You'll need VS Code installed to run the extension
3. **Dependencies**: Install project dependencies by running:
   ```bash
   npm install
   ```

## Building the Extension

Before testing, you need to compile the TypeScript code:

```bash
npm run compile
```

This will compile your TypeScript files from `src/` into JavaScript files in `out/`.

### Watch Mode (Recommended for Development)

For active development, use watch mode to automatically recompile when you make changes:

```bash
npm run watch
```

Keep this terminal running while you develop. It will automatically recompile your TypeScript files whenever you save changes.

## Running the Extension in Development

### Method 1: Using VS Code's Debugger (Recommended)

1. **Open the project in VS Code**:
   ```bash
   code .
   ```

2. **Set up the debug configuration**:
   - Press `F5` or go to **Run > Start Debugging**
   - VS Code will automatically create a launch configuration if one doesn't exist
   - This will open a new "Extension Development Host" window

3. **Test in the Extension Development Host**:
   - The new window is a separate instance of VS Code with your extension loaded
   - Look for the **Heart icon** in the Activity Bar (left sidebar)
   - Click it to open the Settings panel
   - Test all the features:
     - Enable/disable reminders
     - Change the interval
     - Toggle stretch and core reminders
     - Wait for a reminder to appear (or set a very short interval for testing)

4. **Making changes**:
   - Edit your code in the original VS Code window
   - If using watch mode, changes will auto-compile
   - Press `Ctrl+R` (or `Cmd+R` on Mac) in the Extension Development Host window to reload the extension
   - Or stop debugging (`Shift+F5`) and start again (`F5`)

### Method 2: Using the Command Line

1. **Compile the extension**:
   ```bash
   npm run compile
   ```

2. **Copy the webview UI toolkit** (required for the settings panel):
   ```bash
   npm run copy-toolkit
   ```

3. **Package the extension** (optional, for testing the packaged version):
   ```bash
   npm run vscode:prepublish
   ```

4. **Install the extension locally**:
   ```bash
   code --install-extension comodoro-0.0.4.vsix
   ```

   Or use the VS Code UI:
   - Open VS Code
   - Go to Extensions view (`Ctrl+Shift+X`)
   - Click the "..." menu
   - Select "Install from VSIX..."
   - Choose your `.vsix` file

## Quick Testing Tips

### Testing Reminders Quickly

The default interval is 25 minutes, which is too long for testing. To test quickly:

1. Open the extension settings panel (Heart icon in Activity Bar)
2. Set the interval to a very short time (e.g., `1` minute or even `0.1` minutes = 6 seconds)
3. Make sure "Enable Reminders" is checked
4. Wait for the reminder to appear

### Testing Different Reminder Types

1. **Test stretch reminders only**:
   - Enable "Stretch Reminders"
   - Disable "Core Reminders"
   - Wait for a reminder

2. **Test core reminders only**:
   - Enable "Core Reminders"
   - Disable "Stretch Reminders"
   - Wait for a reminder

3. **Test alternating reminders**:
   - Enable both types
   - Reminders should alternate between stretch and core

### Testing the Timer Feature

Some reminders include a built-in timer. When a reminder with a timer appears:
- Click "Start" to begin the countdown
- Test "Pause" and "Resume"
- Test "Stop" to reset to zero
- Test "Reset" to return to the initial time

## Debugging

### Viewing Console Logs

1. In the Extension Development Host window, open the Developer Tools:
   - Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac)
   - Or go to **Help > Toggle Developer Tools**

2. Check the Console tab for any errors or log messages

### Debugging the Extension Code

1. Set breakpoints in your `src/extension.ts` file
2. Start debugging with `F5`
3. When code execution hits a breakpoint, you can:
   - Inspect variables
   - Step through code
   - Evaluate expressions

### Debugging the Webview

The settings panel and reminder panels are webviews. To debug them:

1. Open the Developer Tools in the Extension Development Host window
2. In the webview panel, right-click and select "Inspect" (if available)
3. Or use the Console in Developer Tools - webview messages will appear there

## Common Issues and Solutions

### Extension doesn't appear in Activity Bar

- **Solution**: Make sure you've compiled the code (`npm run compile`)
- **Solution**: Reload the Extension Development Host window (`Ctrl+R` or `Cmd+R`)
- **Solution**: Check that `package.json` has the correct `main` field pointing to `./out/extension.js`

### Settings panel is blank or broken

- **Solution**: Run `npm run copy-toolkit` to copy the webview UI toolkit files
- **Solution**: Check the Developer Tools console for JavaScript errors
- **Solution**: Verify that `media/main.js` exists and is being loaded

### Reminders don't appear

- **Solution**: Check that "Enable Reminders" is checked in the settings panel
- **Solution**: Verify the interval is set to a reasonable value (not 0)
- **Solution**: Make sure at least one reminder type (Stretch or Core) is enabled
- **Solution**: Check the Developer Tools console for errors

### Changes don't appear after editing

- **Solution**: Make sure watch mode is running (`npm run watch`)
- **Solution**: Manually recompile with `npm run compile`
- **Solution**: Reload the Extension Development Host window (`Ctrl+R` or `Cmd+R`)
- **Solution**: Stop and restart debugging (`Shift+F5` then `F5`)

## Testing Checklist

Before publishing or sharing your extension, test:

- [ ] Extension appears in Activity Bar with heart icon
- [ ] Settings panel opens and displays correctly
- [ ] Enable/disable toggle works
- [ ] Interval can be changed and saved
- [ ] Stretch reminders checkbox works
- [ ] Core reminders checkbox works
- [ ] Reminders appear after the set interval
- [ ] Reminders alternate between stretch and core (when both enabled)
- [ ] Timer functionality works in reminders that have timers
- [ ] Settings persist after reloading VS Code
- [ ] Extension works after restarting VS Code

## Additional Resources

- [VS Code Extension Development Documentation](https://code.visualstudio.com/api)
- [VS Code Extension API Reference](https://code.visualstudio.com/api/references/vscode-api)
- [Webview API Documentation](https://code.visualstudio.com/api/extension-guides/webview)
