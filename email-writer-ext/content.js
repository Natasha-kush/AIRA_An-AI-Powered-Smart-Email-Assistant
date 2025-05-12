console.log("Email Writer Extension - Content Script Loaded");

function createPromptInput() {
    const input = document.createElement('input');
    input.className = 'ai-prompt-input';
    input.placeholder = 'Write a prompt to compose an email...';
    input.style.marginRight = '8px';
    input.style.marginLeft = '8px';
    input.style.padding = '4px 8px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ccc';
    input.style.fontSize = '14px';
    input.style.flex = '1';
    return input;
}

function createPromptButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-compose-button';
    button.innerHTML = 'Generate';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Compose email from prompt');
    return button;
}

function createToneDropdown() {
    const select = document.createElement('select');
    select.className = 'ai-tone-selector';
    select.style.marginRight = '8px';
    select.style.padding = '4px';
    select.style.borderRadius = '4px';
    select.style.fontSize = '14px';

    const tones = [
        { emoji: '🚫', label: 'None', value: 'none' },
        { emoji: '😊', label: 'Friendly', value: 'friendly' },
        { emoji: '😎', label: 'Casual', value: 'casual' },
        { emoji: '💼', label: 'Professional', value: 'professional' },
        { emoji: '❤️', label: 'Warm', value: 'warm' },
        { emoji: '🙃', label: 'Playful', value: 'playful' },
        { emoji: '🧊', label: 'Formal', value: 'formal' },
        { emoji: '😐', label: 'Neutral', value: 'neutral' },
        { emoji: '🚀', label: 'Persuasive', value: 'persuasive' },
        { emoji: '❗', label: 'Direct', value: 'direct' },
        { emoji: '🤝', label: 'Cooperative', value: 'cooperative' },
        { emoji: '🙏', label: 'Polite', value: 'polite' },
    ];

    tones.forEach(tone => {
        const option = document.createElement('option');
        option.value = tone.value;
        option.textContent = `${tone.emoji} ${tone.label}`;
        select.appendChild(option);
    });

    return select;
}

function createLanguageDropdown() {
    const select = document.createElement('select');
    select.className = 'ai-language-selector';
    select.style.marginRight = '8px';
    select.style.padding = '4px';
    select.style.borderRadius = '4px';
    select.style.fontSize = '14px';

    const languages = [
        { emoji: '🌐', label: 'Auto Detect', value: 'auto' },
        { emoji: '🇺🇸', label: 'English', value: 'en' },
        { emoji: '🇮🇳', label: 'Hindi', value: 'hi' },
        { emoji: '🇪🇸', label: 'Spanish', value: 'es' },
        { emoji: '🇫🇷', label: 'French', value: 'fr' },
        { emoji: '🇩🇪', label: 'German', value: 'de' },
        { emoji: '🇯🇵', label: 'Japanese', value: 'ja' },
        { emoji: '🇨🇳', label: 'Chinese', value: 'zh' }
    ];

    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.value;
        option.textContent = `${lang.emoji} ${lang.label}`;
        select.appendChild(option);
    });

    return select;
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const existingTone = document.querySelector('.ai-tone-selector');
    if (existingTone) existingTone.remove();

    const existingLang = document.querySelector('.ai-language-selector');
    if (existingLang) existingLang.remove();

    const existingPromptInput = document.querySelector('.ai-prompt-input');
    if (existingPromptInput) existingPromptInput.remove();

    const existingPromptButton = document.querySelector('.ai-compose-button');
    if (existingPromptButton) existingPromptButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button, tone & language dropdowns");
    const button = createAIButton();
    const toneDropdown = createToneDropdown();
    const languageDropdown = createLanguageDropdown();
    const promptInput = createPromptInput();
    const promptButton = createPromptButton();

    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const selectedTone = toneDropdown.value;
            const selectedLanguage = languageDropdown.value;

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: selectedTone,
                    language: selectedLanguage
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    promptButton.addEventListener('click', async () => {
        try {
            const prompt = promptInput.value.trim();
            if (!prompt) return alert("Please enter a prompt to generate email.");

            promptButton.innerHTML = 'Writing...';
            promptButton.disabled = true;

            const selectedTone = toneDropdown.value;
            const selectedLanguage = languageDropdown.value;

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    tone: selectedTone,
                    language: selectedLanguage
                })
            });

            if (!response.ok) {
                console.error('API Request Failed:', response);
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate email from prompt');
        } finally {
            promptButton.innerHTML = 'Generate';
            promptButton.disabled = false;
        }
    });

    toolbar.insertBefore(languageDropdown, toolbar.firstChild);
    toolbar.insertBefore(toneDropdown, toolbar.firstChild);
    toolbar.insertBefore(promptInput, toolbar.firstChild);
    toolbar.insertBefore(promptButton, toolbar.firstChild);
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 200);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
