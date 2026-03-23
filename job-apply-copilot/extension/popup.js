document.addEventListener('DOMContentLoaded', async () => {
    const authDot = document.getElementById('auth-dot');
    const authStatus = document.getElementById('auth-status');
    const pageDot = document.getElementById('page-dot');
    const pageStatus = document.getElementById('page-status');
    const autofillBtn = document.getElementById('autofill-btn');

    let currentKitData = null;

    // 1. Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // 2. Check if we are on a supported job board
    const isGreenhouse = url.includes('boards.greenhouse.io');
    const isLever = url.includes('jobs.lever.co');

    if (isGreenhouse || isLever) {
        pageDot.classList.replace('dot-red', 'dot-green');
        pageStatus.textContent = isGreenhouse ? 'Greenhouse detected' : 'Lever detected';
    } else {
        pageStatus.textContent = 'Not on a supported job board';
        return; // Stop early
    }

    // 3. Fetch data from OpenClaw (must be logged in on localhost:3000)
    try {
        const response = await fetch(`http://localhost:3000/api/extension/data?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            authDot.classList.replace('dot-red', 'dot-green');
            authStatus.textContent = `Connected as ${data.user.email}`;

            if (data.kit) {
                currentKitData = {
                    profile: data.profile,
                    kit: data.kit
                };
                autofillBtn.disabled = false;
                autofillBtn.textContent = '✨ Auto-Fill this Application';
            } else {
                autofillBtn.textContent = 'No AI Kit found for this URL';
            }
        } else {
            if (response.status === 401) {
                authStatus.textContent = 'Please log into OpenClaw (localhost:3000)';
            } else {
                authStatus.textContent = 'Error connecting to OpenClaw';
            }
        }
    } catch (error) {
        authStatus.textContent = 'OpenClaw server is not running (localhost:3000)';
    }

    // 4. Handle Auto-fill click
    autofillBtn.addEventListener('click', async () => {
        if (!currentKitData) return;

        autofillBtn.disabled = true;
        autofillBtn.textContent = 'Filling...';

        try {
            // First, inject the content script into the page if it's not already there
            // This avoids the "Error: Please refresh the page" issue
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
        } catch (e) {
            // Script may already be injected, which throws an error we can safely ignore
            console.log('Content script already present or injection failed:', e);
        }

        // Small delay to let the content script initialize
        await new Promise(resolve => setTimeout(resolve, 200));

        // Send message to the content script running on the active tab
        chrome.tabs.sendMessage(tab.id, {
            action: "AUTO_FILL",
            data: currentKitData
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                autofillBtn.disabled = false;
                autofillBtn.textContent = 'Error: Could not fill. Try reloading the page.';
                return;
            }
            if (response && response.success) {
                autofillBtn.textContent = '✅ Fields Filled!';
                setTimeout(() => window.close(), 1500);
            } else {
                autofillBtn.textContent = '⚠️ Done (Some fields may be missed)';
            }
        });
    });
});
