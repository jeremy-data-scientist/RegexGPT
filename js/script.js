// Function to retrieve query string parameters and populate fields
function setupFromQueryString() {
    const params = new URLSearchParams(window.location.search);
    const regexParam = params.get('r');
    const examplesParams = [params.get('e1'), params.get('e2'), params.get('e3'), params.get('e4')];

    // Populate regex input
    if (regexParam) {
        document.getElementById('regex-input').innerText = regexParam;
    }

    // Populate example inputs
    examplesParams.forEach((example, index) => {
        if (example) {
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

function highlightText(str, regex) {
    return str.replace(regex, function(...args) {
        const match = args[0];
        const groups = args.slice(1, -2); // Capture groups are all arguments except the first and the last two
        let result = '';
        let lastIndex = 0;

        regex.lastIndex = 0; // Reset lastIndex to ensure exec starts from the beginning
        const matches = regex.exec(str);

        if (matches) {
            for (let i = 1; i < matches.length; i++) {
                const group = matches[i];
                const groupIndex = matches.index + match.indexOf(group, lastIndex);
                result += match.substring(lastIndex, groupIndex) + '<span class="highlight">' + group + '</span>';
                lastIndex = groupIndex + group.length;
            }

            result += match.substring(lastIndex); // Append the rest of the string after the last capture group
        }

        return result;
    });
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
    //regex = new RegExp(regexToUse, getMatchMode());
    try {
        const matches = textToCheck.match(regex) || [];
        console.log(textToCheck);
        console.log(regex);
        const any_match = regex.test(textToCheck);
        const captureGroupDiv = document.getElementById(`${div.id}-output`);

        if (!any_match) {
            clearExamples(div, false);
            return null;
        }

        div.classList.add('match');
        if (showCaptureGroups && (defocused_div === true || div === defocused_div)) {
            let highlightedText = highlightText(textToCheck,regex);//, ((_, captureGroup) => `<span class="highlight">${captureGroup}</span>`));
            div.innerHTML = highlightedText;
            captureGroupDiv.textContent = '';
            captureGroupDiv.textContent = `${matches.join(', ')}`;
        }
    } catch (e) {
        clearExamples(div, false);
    }
});
}

// Function to display an error message
function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
}

// Function to clear the error message
function clearError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerText = '';
    errorDiv.style.display = 'none';
}

// Get the match mode from the radio buttons
function getMatchMode() {
    const matchMode = document.querySelector('input[name="match-mode"]:checked').value;
    return matchMode === 'all' ? "g" : "";
}

// Function to initialize the tool
function init() {
    setupFromQueryString();
    attachEditableEvents();
    updateRegex();
}

// Initialize the tool when the page loads
window.addEventListener('DOMContentLoaded', init);
