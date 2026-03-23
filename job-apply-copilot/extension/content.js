// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "AUTO_FILL") {
        try {
            const success = autoFillForm(request.data);
            sendResponse({ success });
        } catch (e) {
            console.error("OpenClaw AutoFill Error:", e);
            sendResponse({ success: false, error: e.message });
        }
    }
    return true; // Indicates async response
});

function autoFillForm(data) {
    const { profile, kit } = data;
    let filledSomething = false;

    const hostname = window.location.hostname;

    // Detect which board we are on — handle all subdomains of greenhouse.io
    const isGreenhouse = hostname.includes('greenhouse.io');
    const isLever = hostname.includes('lever.co');
    const isAshby = hostname.includes('ashbyhq.com') || hostname.includes('jobs.ashby');

    console.log('[OpenClaw] autoFillForm called. hostname:', hostname, 'isGreenhouse:', isGreenhouse);

    if (isGreenhouse) {
        filledSomething = fillGreenhouse(profile, kit);
    } else if (isLever) {
        filledSomething = fillLever(profile, kit);
    } else if (isAshby) {
        filledSomething = fillAshby(profile, kit);
    }

    return filledSomething;
}

// Helper to set value and trigger React/Native events so the site registers the change
function setInputValue(element, value) {
    if (!element || value === null || value === undefined || value === '') return false;
    const strValue = String(value);

    // Use the native input value setter to bypass React's read-only value
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');

    if (element.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.set.call(element, strValue);
    } else if (nativeInputValueSetter) {
        nativeInputValueSetter.set.call(element, strValue);
    } else {
        element.value = strValue;
    }

    // Dispatch events to notify frameworks (React, etc.)
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('[OpenClaw] Set field:', element.id || element.name, '=', strValue.substring(0, 30));
    return true;
}

function fillGreenhouse(profile, kit) {
    let filled = false;

    // --- Basic Info ---
    // Greenhouse uses both `first_name` and `input_first_name` depending on layout
    const firstNameSelectors = ['#first_name', '#input_first_name', 'input[name="job_application[first_name]"]', 'input[autocomplete="given-name"]'];
    const lastNameSelectors = ['#last_name', '#input_last_name', 'input[name="job_application[last_name]"]', 'input[autocomplete="family-name"]'];
    const emailSelectors = ['#email', '#input_email', 'input[name="job_application[email]"]', 'input[type="email"]'];
    const phoneSelectors = ['#phone', '#input_phone', 'input[name="job_application[phone]"]', 'input[type="tel"]'];

    const findField = (selectors) => {
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) return el;
        }
        return null;
    };

    if (profile.full_name) {
        const parts = profile.full_name.trim().split(' ');
        const first = parts[0];
        const last = parts.slice(1).join(' ');

        const firstNameEl = findField(firstNameSelectors);
        const lastNameEl = findField(lastNameSelectors);
        if (firstNameEl) filled |= setInputValue(firstNameEl, first);
        if (lastNameEl && last) filled |= setInputValue(lastNameEl, last);
    }

    // Email — prefer user.email from kit, fall back to profile.email
    const emailEl = findField(emailSelectors);
    if (emailEl && profile.email) filled |= setInputValue(emailEl, profile.email);

    // Phone
    const phoneEl = findField(phoneSelectors);
    if (phoneEl && profile.phone) filled |= setInputValue(phoneEl, profile.phone);

    // --- Cover Letter --- 
    // Look for any textarea that has "cover" or "letter" or "message" in its associated label
    const allTextareas = Array.from(document.querySelectorAll('textarea'));
    const coverLetterBox = allTextareas.find(ta => {
        // Check label text nearby
        const container = ta.closest('.field') || ta.closest('.form-group') || ta.closest('li') || ta.parentElement;
        const labelEl = container && (container.querySelector('label') || container.closest('.field')?.querySelector('label'));
        const labelText = labelEl?.textContent?.toLowerCase() || ta.placeholder?.toLowerCase() || ta.name?.toLowerCase() || '';
        return labelText.includes('cover') || labelText.includes('letter') || labelText.includes('message');
    }) || (allTextareas.length > 0 ? allTextareas[0] : null); // fallback to first textarea

    if (coverLetterBox && kit && kit.cover_letter) {
        filled |= setInputValue(coverLetterBox, kit.cover_letter);
    }

    // --- Answer Common Q&A ---
    if (kit && kit.common_qa && Array.isArray(kit.common_qa)) {
        const allInputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
        kit.common_qa.forEach(qa => {
            const questionSnippet = qa.question.toLowerCase().substring(0, 20);
            const matchingInput = allInputs.find(input => {
                const container = input.closest('.field') || input.closest('li') || input.parentElement;
                const label = container?.querySelector('label')?.textContent?.toLowerCase() || input.placeholder?.toLowerCase() || '';
                return label.includes(questionSnippet) || questionSnippet.includes(label.substring(0, 10));
            });
            if (matchingInput) {
                filled |= setInputValue(matchingInput, qa.answer);
            }
        });
    }

    console.log('[OpenClaw] Greenhouse fill complete. Filled:', !!filled);
    return !!filled;
}

function fillLever(profile, kit) {
    let filled = false;

    const fullName = document.querySelector('input[name="name"]');
    if (fullName && profile.full_name) filled |= setInputValue(fullName, profile.full_name);

    const email = document.querySelector('input[name="email"]');
    if (email && profile.email) filled |= setInputValue(email, profile.email);

    const phone = document.querySelector('input[name="phone"]');
    if (phone && profile.phone) filled |= setInputValue(phone, profile.phone);

    // Cover letter / Additional Info
    const comments = document.querySelector('textarea[name="comments"]') || document.querySelector('textarea');
    if (comments && kit && kit.cover_letter) filled |= setInputValue(comments, kit.cover_letter);

    return !!filled;
}

function fillAshby(profile, kit) {
    let filled = false;

    // Ashby fields often use data-testid attributes
    const firstNameEl = document.querySelector('input[data-testid="input-firstName"]') || document.querySelector('input[name="firstName"]');
    const lastNameEl = document.querySelector('input[data-testid="input-lastName"]') || document.querySelector('input[name="lastName"]');
    const emailEl = document.querySelector('input[data-testid="input-email"]') || document.querySelector('input[name="email"]');
    const phoneEl = document.querySelector('input[data-testid="input-phone"]') || document.querySelector('input[name="phone"]');

    if (profile.full_name) {
        const parts = profile.full_name.trim().split(' ');
        if (firstNameEl) filled |= setInputValue(firstNameEl, parts[0]);
        if (lastNameEl && parts.length > 1) filled |= setInputValue(lastNameEl, parts.slice(1).join(' '));
    }
    if (emailEl && profile.email) filled |= setInputValue(emailEl, profile.email);
    if (phoneEl && profile.phone) filled |= setInputValue(phoneEl, profile.phone);

    const coverLetterBox = document.querySelector('textarea');
    if (coverLetterBox && kit && kit.cover_letter) filled |= setInputValue(coverLetterBox, kit.cover_letter);

    return !!filled;
}
