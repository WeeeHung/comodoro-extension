import * as vscode from 'vscode';

// --- DATA & TYPES ---

const stretchReminders = [
    {
        text: 'Time to stretch your neck!',
        details: [
            'Gently tilt your head from side to side.',
            'Hold each stretch for 15-20 seconds.'
        ]
    },
    {
        text: 'Stretch your wrists and fingers!',
        details: [
            'Extend your arms in front of you.',
            'Gently rotate your wrists in both directions.',
            'Open and close your fists to stretch your fingers.'
        ]
    },
    {
        text: 'Do a simple back stretch!',
        details: [
            'While seated, place your right hand on your left knee.',
            'Gently twist your torso to the left.',
            'Hold for 10-15 seconds and repeat on the other side.'
        ]
    }
];

const coreReminders = [
    {
        text: 'Engage your core!',
        details: [
            'Sit up straight, away from the back of your chair.',
            'Pull your belly button in towards your spine.',
            'Hold for 30 seconds while breathing normally.'
        ]
    },
    {
        text: 'Do a few seated leg lifts!',
        details: [
            'Sit up straight and hold the sides of your chair.',
            'Extend one leg out straight in front of you.',
            'Hold for 10 seconds, then lower it slowly.',
            'Repeat 5 times for each leg.'
        ]
    },
    {
        text: 'Practice deep breathing!',
        details: [
            'Inhale deeply through your nose for a count of 4.',
            'Hold your breath for a count of 4.',
            'Exhale slowly through your mouth for a count of 6.',
            'This engages your diaphragm and core muscles.'
        ]
    }
];

let lastReminderType: 'stretch' | 'core' = 'core';

// --- WEBVIEW PANEL CONTENT ---

function getReminderContent(reminder: { text: string, details: string[] }, intervalInMinutes: number) {
    const instructions = reminder.details.map(step => `<li>${step}</li>`).join('');

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wellness Reminder</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 1.2em;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                h1 { font-size: 1.5em; color: var(--vscode-textLink-foreground); }
                p, li { font-size: 1.1em; }
                ol { padding-left: 20px; }
                .intro { font-style: italic; opacity: 0.8; margin-bottom: 1.5em; }
            </style>
        </head>
        <body>
            <p class="intro">You've been focused for ${intervalInMinutes} minutes! Taking a moment to move is key to staying healthy and sharp.</p>
            <h1>${reminder.text}</h1>
            <ol>
                ${instructions}
            </ol>
        </body>
        </html>`;
}

// --- SIDEBAR VIEW PROVIDER ---

class WellnessReminderViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'wellness-reminder.settingsView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [ 
                vscode.Uri.joinPath(this._extensionUri, 'media')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.command) {
                case 'updateSettings':
                    this._context.globalState.update('extensionEnabled', data.extensionEnabled);
                    this._context.globalState.update('reminderInterval', data.interval);
                    this._context.globalState.update('stretchEnabled', data.stretchEnabled);
                    this._context.globalState.update('coreEnabled', data.coreEnabled);
                    vscode.commands.executeCommand('wellness-reminder.restartTimer');
                    break;
            }
        });

        // Load initial settings into the webview
        const settings = this.getSettings();
        webviewView.webview.postMessage({ command: 'loadSettings', ...settings });
    }

    private getSettings() {
        return {
            extensionEnabled: this._context.globalState.get('extensionEnabled', true),
            interval: this._context.globalState.get('reminderInterval', 25),
            stretchEnabled: this._context.globalState.get('stretchEnabled', true),
            coreEnabled: this._context.globalState.get('coreEnabled', true),
        };
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const toolkitUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'webview-ui-toolkit', 'toolkit.js'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script type="module" src="${toolkitUri}"></script>
                <title>Wellness Settings</title>
                <style>
                    body { padding: 5px 10px; }
                    vscode-text-field, vscode-checkbox { display: block; margin-bottom: 10px; }
                    hr { margin: 15px 0; border: 1px solid var(--vscode-editorWidget-border); }
                </style>
            </head>
            <body>
                <vscode-checkbox id="enabled-checkbox" checked>Enable Reminders</vscode-checkbox>
                <hr/>
                <h3>Interval (minutes)</h3>
                <vscode-text-field id="interval-input" type="number"></vscode-text-field>

                <h3>Enabled Reminders</h3>
                <vscode-checkbox id="stretch-checkbox" checked>Stretch Reminders</vscode-checkbox>
                <vscode-checkbox id="core-checkbox" checked>Core Reminders</vscode-checkbox>

                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

// --- EXTENSION LIFECYCLE ---

let reminderInterval: NodeJS.Timeout | undefined;
let reminderWebviewPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {

    const provider = new WellnessReminderViewProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(WellnessReminderViewProvider.viewType, provider));

    context.subscriptions.push(vscode.commands.registerCommand('wellness-reminder.restartTimer', () => {
        if (reminderInterval) { clearInterval(reminderInterval); }
        
        const isEnabled = context.globalState.get('extensionEnabled', true);
        if (isEnabled) {
            startTimer(context);
        }
    }));

    // Initial start of the timer
    vscode.commands.executeCommand('wellness-reminder.restartTimer');
}

function startTimer(context: vscode.ExtensionContext) {
    
    
    const intervalMinutes = context.globalState.get('reminderInterval', 25);
    
    if (intervalMinutes <= 0) { return; }

    reminderInterval = setInterval(() => {
        const stretchEnabled = context.globalState.get('stretchEnabled', true);
        const coreEnabled = context.globalState.get('coreEnabled', true);

        let possibleReminders: { text: string; details: string[]; }[] = [];
        
        // Decide which pool to draw from
        if (stretchEnabled && coreEnabled) {
            if (lastReminderType === 'core') {
                possibleReminders = stretchReminders;
                lastReminderType = 'stretch';
            } else {
                possibleReminders = coreReminders;
                lastReminderType = 'core';
            }
        } else if (stretchEnabled) {
            possibleReminders = stretchReminders;
        } else if (coreEnabled) {
            possibleReminders = coreReminders;
        }

        if (possibleReminders.length === 0) {
            return; // Nothing to remind about
        }

        const reminder = possibleReminders[Math.floor(Math.random() * possibleReminders.length)];
        const intervalInMinutes = intervalMinutes;

        // If we already have a panel, show it and update it.
        if (reminderWebviewPanel) {
            reminderWebviewPanel.webview.html = getReminderContent(reminder, intervalInMinutes);
            reminderWebviewPanel.reveal(vscode.ViewColumn.Two, true);
        } else {
            // Otherwise, create a new panel.
            reminderWebviewPanel = vscode.window.createWebviewPanel(
                'wellnessReminder',
                'Wellness Reminder',
                { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
                {}
            );
            reminderWebviewPanel.webview.html = getReminderContent(reminder, intervalInMinutes);

            // When the panel is closed, reset our reference to it
            reminderWebviewPanel.onDidDispose(
                () => {
                    reminderWebviewPanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    }, intervalMinutes * 60 * 1000);
}

export function deactivate() {
    console.log('Wellness Reminder: Deactivating extension.');
    if (reminderInterval) {
        clearInterval(reminderInterval);
    }
    if (reminderWebviewPanel) {
        reminderWebviewPanel.dispose();
    }
}
