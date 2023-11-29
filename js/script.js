// Function to retrieve query string parameters
function getQueryStringParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        regex: params.get('r'),
        examples: [params.get('e1'), params.get('e2'), params.get('e3'), params.get('e4')]
    };
}

// Populate form fields from query string parameters
function populateFields() {
    const { regex, examples } = getQueryStringParams();
    document.getElementById('regex-input').innerHTML = regex || '';
    examples.forEach((example, index) => {
        if (example !== null) {
            document.getElementById('example' + (index + 1)).innerText = example;
        }
    });
}

// Update regex input and test regex
function updateRegex() {
    document.getElementById('capture-group-toggle').dispatchEvent(new Event('change'));
    testRegex(true);
}

// Clean text for regex processing
function cleanTextForRegex(element) {
    function decodeHtmlEntities(html) {
        var textArea = document.createElement('textarea');
        textArea.innerHTML = html;
        return textArea.value;
    }
    const temp = element.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
    return decodeHtmlEntities(temp);
}

// Attach events to editable content
function attachEditableEvents() {
    document.querySelectorAll('.examples-to-check').forEach(div => {
        div.addEventListener('focus', function () {
            this.innerHTML = cleanTextForRegex(this);
        });
        div.addEventListener('blur', function () {
            testRegex(div); // Call testRegex when the div loses focus
        });
    });

    document.getElementById('capture-group-toggle').addEventListener('change', function (event) {
        regexInput = document.getElementById('regex-input').innerHTML;
        hasCaptureGroups = /\(.*?\)/.test(regexInput);
        if (hasCaptureGroups) {
            event.preventDefault();
            document.getElementById('capture-group-toggle').checked = true;
            this.disabled = true;
        } else {
            this.disabled = false;
        }
        const isChecked = this.checked;
        testRegex(isChecked);
        document.querySelectorAll('input[name="match-mode"]').forEach(radio => {
            radio.disabled = !isChecked;
        });
    });

    document.querySelectorAll('input[name="match-mode"]').forEach(radio => {
        radio.addEventListener('change', function () {
            testRegex(document.getElementById('capture-group-toggle').checked);
        });
    });
}

// Clear example inputs
function clearExamples(div, disable_divs = true) {
    div.classList.remove('match');
    if (disable_divs) {
        div.classList.add('disabled');
    }
    div.innerHTML = cleanTextForRegex(div);
    document.getElementById(`${div.id}-output`).textContent = "";
}

// Test regex against examples
function testRegex(defocused_div) {
    const regexInputDiv = document.getElementById('regex-input');
    const regexToUse = cleanTextForRegex(regexInputDiv);
    const showCaptureGroups = document.getElementById('capture-group-toggle').checked;
    const exampleDivs = document.querySelectorAll('.examples-to-check');

    if (regexToUse === "" || regexToUse === null) {
        exampleDivs.forEach(clearExamples);
        regexInputDiv.classList.add('missing');
        return null;
    }

    let regex = null;
    try {
        regex = new RegExp(regexToUse, getMatchMode());
        regexInputDiv.classList.remove('error');
    } catch (e) {
        exampleDivs.forEach(clearExamples);
        regexInputDiv.classList.add('error');
        return null;
    }

    regexInputDiv.classList.remove('missing');
    exampleDivs.forEach((div) => {
        div.classList.remove('disabled');
        textToCheck = cleanTextForRegex(div);
        try {
            const matches = textToCheck.match(regex) || [];
            const captureGroupDiv = document.getElementById(`${div.id}-output`);

            if (matches.length === 0) {
                clearExamples(div, false);
                return null;
            }

            div.classList.add('match');
            if (showCaptureGroups && (defocused_div === true || div === defocused_div)) {
                let highlightedText = textToCheck.replace(regex, (match) => `<span class="highlight">${match}</span>`);
                div.innerHTML = highlightedText;
                captureGroupDiv.textContent = '';
                if (getMatchMode() === "g") {
                    captureGroupDiv.textContent = `${matches.join(', ')}`;
                }
            }
        } catch (e) {
            clearExamples(div, false);
        }
    });
}

// Get the match mode from the radio buttons
function getMatchMode() {
    const matchMode = document.querySelector('input[name="match-mode"]:checked').value;
    return matchMode === 'all' ? "g" : "";
}

// Initialize the tool
function init() {
    populateFields();
    attachEditableEvents();
    updateRegex();
}

// Call the init function on page load
window.onload = init;