// media/main.js

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    // Get the elements
    const enabledCheckbox = document.getElementById('enabled-checkbox');
    const intervalInput = document.getElementById('interval-input');
    const stretchCheckbox = document.getElementById('stretch-checkbox');
    const coreCheckbox = document.getElementById('core-checkbox');

    // Function to post state
    function updateSettings() {
        vscode.postMessage({
            command: 'updateSettings',
            extensionEnabled: enabledCheckbox.checked,
            interval: intervalInput.value,
            stretchEnabled: stretchCheckbox.checked,
            coreEnabled: coreCheckbox.checked
        });
    }

    // Add event listeners
    enabledCheckbox.addEventListener('change', updateSettings);
    intervalInput.addEventListener('input', updateSettings);
    stretchCheckbox.addEventListener('change', updateSettings);
    coreCheckbox.addEventListener('change', updateSettings);

    // Handle messages from the extension
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'loadSettings':
                enabledCheckbox.checked = message.extensionEnabled;
                intervalInput.value = message.interval;
                stretchCheckbox.checked = message.stretchEnabled;
                coreCheckbox.checked = message.coreEnabled;
                break;
        }
    });
}());
