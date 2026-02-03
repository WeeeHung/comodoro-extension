import * as vscode from 'vscode';

// --- DATA & TYPES ---

type ReminderTimer = {
    label: string;
    seconds: number;
};

type Reminder = {
    text: string;
    details: string[];
    timer?: ReminderTimer;
};

const stretchReminders: Reminder[] = [
    {
        text: 'Time to stretch your neck!',
        details: [
            'Gently tilt your head from side to side.',
            'Hold each stretch for 20 seconds.'
        ],
        timer: {
            label: 'Neck stretch (20s)',
            seconds: 20
        }
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
            'Hold for 15 seconds and repeat on the other side.'
        ],
        timer: {
            label: 'Seated twist hold (15s)',
            seconds: 15
        }
    },
    {
        text: 'Roll your shoulders!',
        details: [
            'Sit or stand tall with your arms relaxed.',
            'Roll your shoulders up, back, and down.',
            'Repeat 10 times, then reverse direction.'
        ]
    },
    {
        text: 'Open your chest!',
        details: [
            'Interlace your fingers behind your back.',
            'Lift your hands slightly and broaden your chest.',
            'Hold for 20 seconds while breathing steadily.'
        ],
        timer: {
            label: 'Chest opener (20s)',
            seconds: 20
        }
    },
    {
        text: 'Seated hamstring stretch!',
        details: [
            'Extend one leg straight with your heel on the floor.',
            'Hinge forward from your hips with a long spine.',
            'Hold for 20 seconds, then switch legs.'
        ],
        timer: {
            label: 'Hamstring hold (20s)',
            seconds: 20
        }
    },
    {
        text: 'Do ankle circles!',
        details: [
            'Lift one foot slightly off the ground.',
            'Rotate your ankle 10 times in each direction.',
            'Switch to the other foot.'
        ]
    },
    {
        text: 'Upper trap stretch!',
        details: [
            'Sit tall and gently drop your right ear toward your shoulder.',
            'Use your right hand for light pressure.',
            'Hold for 15 seconds, then switch sides.'
        ],
        timer: {
            label: 'Upper trap hold (15s)',
            seconds: 15
        }
    }
];

const coreReminders: Reminder[] = [
    {
        text: 'Engage your core!',
        details: [
            'Sit up straight, away from the back of your chair.',
            'Pull your belly button in towards your spine.',
            'Hold for 30 seconds while breathing normally.'
        ],
        timer: {
            label: 'Core brace (30s)',
            seconds: 30
        }
    },
    {
        text: 'Do a few seated leg lifts!',
        details: [
            'Sit up straight and hold the sides of your chair.',
            'Extend one leg out straight in front of you.',
            'Hold for 10 seconds, then lower it slowly.',
            'Repeat 5 times for each leg.'
        ],
        timer: {
            label: 'Leg lift hold (10s)',
            seconds: 10
        }
    },
    {
        text: 'Try box breathing!',
        details: [
            'Inhale through your nose for 4 seconds.',
            'Hold your breath for 4 seconds.',
            'Exhale slowly for 4 seconds.',
            'Pause for 4 seconds, then repeat.'
        ],
        timer: {
            label: 'Breathing phase (4s)',
            seconds: 4
        }
    },
    {
        text: 'Seated marches!',
        details: [
            'Sit tall and brace your core.',
            'Lift one knee toward your chest, then switch.',
            'Continue for 30 seconds.'
        ],
        timer: {
            label: 'Seated march (30s)',
            seconds: 30
        }
    },
    {
        text: 'Glute squeeze holds!',
        details: [
            'Squeeze your glutes as firmly as you can.',
            'Hold for 10 seconds, then relax.',
            'Repeat 5 times.'
        ],
        timer: {
            label: 'Glute squeeze (10s)',
            seconds: 10
        }
    },
    {
        text: 'Wall sit!',
        details: [
            'Stand with your back against a wall.',
            'Slide down until your knees are near 90 degrees.',
            'Hold for 30 seconds.'
        ],
        timer: {
            label: 'Wall sit (30s)',
            seconds: 30
        }
    },
    {
        text: 'Bird-dog balance!',
        details: [
            'From hands and knees, extend your right arm and left leg.',
            'Keep your hips level and core engaged.',
            'Hold for 5 seconds, then switch sides.'
        ],
        timer: {
            label: 'Bird-dog hold (5s)',
            seconds: 5
        }
    },
    {
        text: 'Standing cross-body crunch!',
        details: [
            'Stand tall with hands behind your head.',
            'Bring your right knee toward your left elbow.',
            'Alternate sides for 10 controlled reps.'
        ]
    }
];

let lastReminderType: 'stretch' | 'core' = 'core';

// --- WEBVIEW PANEL CONTENT ---

function getReminderContent(reminder: Reminder, intervalInMinutes: number) {
    const instructions = reminder.details.map(step => `<li>${step}</li>`).join('');
    const timerSection = reminder.timer
        ? `
            <section class="timer" data-timer="true" data-initial-seconds="${reminder.timer.seconds}">
                <div class="timer-header">
                    <h2>${reminder.timer.label}</h2>
                </div>
                <div class="timer-display-container">
                    <div class="timer-display" id="timer-display"></div>
                </div>
                <div class="timer-controls">
                    <button id="timer-start" class="btn-primary">Start</button>
                    <button id="timer-pause" class="btn-secondary" style="display: none;">Pause</button>
                    <button id="timer-reset" class="btn-secondary">Reset</button>
                    <button id="timer-stop" class="btn-secondary">Stop</button>
                </div>
            </section>`
        : '';
    const timerScript = reminder.timer
        ? `
            <script>
                (function() {
                    const timerSection = document.querySelector('[data-timer="true"]');
                    if (!timerSection) {
                        return;
                    }

                    const display = document.getElementById('timer-display');
                    const startButton = document.getElementById('timer-start');
                    const pauseButton = document.getElementById('timer-pause');
                    const stopButton = document.getElementById('timer-stop');
                    const resetButton = document.getElementById('timer-reset');
                    const initialSeconds = Number(timerSection.getAttribute('data-initial-seconds') || '0');

                    if (!display || !startButton || !pauseButton || !stopButton || !resetButton || Number.isNaN(initialSeconds) || initialSeconds <= 0) {
                        return;
                    }

                    let remainingSeconds = initialSeconds;
                    let intervalId = null;
                    let isRunning = false;

                    const formatTime = (totalSeconds) => {
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = totalSeconds % 60;
                        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
                    };

                    const updateDisplay = () => {
                        display.textContent = formatTime(remainingSeconds);
                        
                        // Update button states
                        if (isRunning) {
                            startButton.style.display = 'none';
                            pauseButton.style.display = 'inline-block';
                        } else {
                            startButton.style.display = 'inline-block';
                            pauseButton.style.display = 'none';
                        }
                    };

                    const clearTimer = () => {
                        if (intervalId !== null) {
                            clearInterval(intervalId);
                            intervalId = null;
                            isRunning = false;
                        }
                    };

                    const tick = () => {
                        remainingSeconds = Math.max(remainingSeconds - 1, 0);
                        updateDisplay();
                        if (remainingSeconds === 0) {
                            clearTimer();
                            display.classList.add('timer-complete');
                        }
                    };

                    const startTimer = () => {
                        if (intervalId !== null) {
                            return;
                        }
                        if (remainingSeconds === 0) {
                            remainingSeconds = initialSeconds;
                        }
                        display.classList.remove('timer-complete');
                        isRunning = true;
                        updateDisplay();
                        intervalId = window.setInterval(tick, 1000);
                    };

                    const pauseTimer = () => {
                        clearTimer();
                        updateDisplay();
                    };

                    const stopTimer = () => {
                        clearTimer();
                        remainingSeconds = 0;
                        display.classList.remove('timer-complete');
                        updateDisplay();
                    };

                    const resetTimer = () => {
                        clearTimer();
                        remainingSeconds = initialSeconds;
                        display.classList.remove('timer-complete');
                        updateDisplay();
                    };

                    updateDisplay();

                    startButton.addEventListener('click', startTimer);
                    pauseButton.addEventListener('click', pauseTimer);
                    stopButton.addEventListener('click', stopTimer);
                    resetButton.addEventListener('click', resetTimer);
                }());
            </script>`
        : '';

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Comodoro</title>
            <style>
                * {
                    box-sizing: border-box;
                }
                
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    padding: 2em 1.5em;
                    color: var(--vscode-editor-foreground);
                    background: linear-gradient(135deg, 
                        var(--vscode-editor-background) 0%, 
                        var(--vscode-editorWidget-background) 50%,
                        var(--vscode-editor-background) 100%);
                    background-attachment: fixed;
                    min-height: 100vh;
                    line-height: 1.6;
                    max-width: 600px;
                    margin: 0 auto;
                }
                
                .intro { 
                    font-style: italic; 
                    opacity: 0.85; 
                    margin-bottom: 2em;
                    padding: 1em;
                    background: var(--vscode-editorWidget-background);
                    border-left: 3px solid var(--vscode-textLink-foreground);
                    border-radius: 4px;
                    font-size: 0.95em;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                h1 { 
                    font-size: 1.8em; 
                    color: var(--vscode-textLink-foreground);
                    margin: 0 0 1.2em 0;
                    font-weight: 600;
                    line-height: 1.3;
                }
                
                ol { 
                    padding-left: 1.8em;
                    margin: 0 0 2em 0;
                }
                
                ol li {
                    font-size: 1.05em;
                    margin-bottom: 0.8em;
                    padding-left: 0.3em;
                    line-height: 1.5;
                }
                
                ol li:last-child {
                    margin-bottom: 0;
                }
                
                .timer {
                    margin-top: 2em;
                    padding: 1.8em;
                    border: 1px solid var(--vscode-editorWidget-border);
                    border-radius: 12px;
                    background: var(--vscode-editorWidget-background);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .timer-header {
                    margin-bottom: 1.2em;
                }
                
                .timer-header h2 {
                    margin: 0;
                    font-size: 1.1em;
                    font-weight: 500;
                    color: var(--vscode-descriptionForeground);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.8;
                }
                
                .timer-display-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 1.5em 0;
                    position: relative;
                }
                
                .timer-display {
                    font-size: 3.5em;
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                    color: var(--vscode-textLink-foreground);
                    text-align: center;
                    position: relative;
                    padding: 0.3em 0;
                    transition: all 0.3s ease;
                }
                
                .timer-display.timer-complete {
                    color: var(--vscode-errorForeground);
                    animation: pulse 1s ease-in-out;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .timer-controls {
                    display: flex;
                    gap: 0.6em;
                    flex-wrap: wrap;
                    justify-content: center;
                    margin-top: 1.5em;
                }
                
                .timer-controls button {
                    border: none;
                    border-radius: 6px;
                    padding: 0.7em 1.4em;
                    cursor: pointer;
                    font-size: 0.95em;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }
                
                .timer-controls .btn-primary {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                
                .timer-controls .btn-primary:hover {
                    background: var(--vscode-button-hoverBackground);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .timer-controls .btn-secondary {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                
                .timer-controls .btn-secondary:hover {
                    background: var(--vscode-button-secondaryHoverBackground);
                    transform: translateY(-1px);
                }
                
                .timer-controls button:active {
                    transform: translateY(0);
                }
                
                .timer-controls button:focus {
                    outline: 2px solid var(--vscode-focusBorder);
                    outline-offset: 2px;
                }
                
                .timer-controls button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
        </head>
        <body>
            <p class="intro">You've been focused for ${intervalInMinutes} ${intervalInMinutes === 1 ? 'minute' : 'minutes'}! Taking a moment to move is key to staying healthy and sharp.</p>
            <h1>${reminder.text}</h1>
            <ol>
                ${instructions}
            </ol>
            ${timerSection}
            ${timerScript}
        </body>
        </html>`;
}

// --- SIDEBAR VIEW PROVIDER ---

class ComodoroViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'comodoro.settingsView';
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
                    vscode.commands.executeCommand('comodoro.restartTimer');
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

    const provider = new ComodoroViewProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ComodoroViewProvider.viewType, provider));

    context.subscriptions.push(vscode.commands.registerCommand('comodoro.restartTimer', () => {
        if (reminderInterval) { clearInterval(reminderInterval); }
        
        const isEnabled = context.globalState.get('extensionEnabled', true);
        if (isEnabled) {
            startTimer(context);
        }
    }));

    // Initial start of the timer
    vscode.commands.executeCommand('comodoro.restartTimer');
}

function startTimer(context: vscode.ExtensionContext) {
    
    
    const intervalMinutes = context.globalState.get('reminderInterval', 25);
    
    if (intervalMinutes <= 0) { return; }

    reminderInterval = setInterval(() => {
        const stretchEnabled = context.globalState.get('stretchEnabled', true);
        const coreEnabled = context.globalState.get('coreEnabled', true);

        let possibleReminders: Reminder[] = [];
        
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
                'comodoroReminder',
                'Comodoro',
                { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
                { enableScripts: true }
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
    console.log('Comodoro: Deactivating extension.');
    if (reminderInterval) {
        clearInterval(reminderInterval);
    }
    if (reminderWebviewPanel) {
        reminderWebviewPanel.dispose();
    }
}
