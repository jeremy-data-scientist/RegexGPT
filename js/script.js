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


// Clean text for regex processing
function removeHighlighting(element) {
    const elementClone = element.cloneNode(true);
    const innerSpans = elementClone.querySelectorAll('span.highlight, span.highlight-capture');
    innerSpans.forEach((innerSpan) => {
        // Replace each inner <span> with its content
        innerSpan.parentNode.replaceChild(document.createTextNode(innerSpan.textContent), innerSpan);
      });
    return elementClone.innerHTML;
}

// Attach events to editable content
function attachEditableEvents() {
    document.querySelectorAll('.examples-to-check').forEach(div => {
        div.addEventListener('focus', function () {
            this.innerHTML = removeHighlighting(this);
        });
        div.addEventListener('blur', function () {
            testRegex(div,true); // Call testRegex when the div loses focus
        });
    });

}

// Clear example inputs
function clearExamples(div, disable_divs = true, remove_highlighting = true) {
    div.classList.remove('match');
    if (disable_divs) {
        div.classList.add('disabled');
    }
    if(remove_highlighting){
        div.innerHTML = removeHighlighting(div);
    }
}

function encodeHtmlSpecialChars(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightText(str, regex) {
    let result = '';
    let cursor = 0;
    regex.lastIndex = 0;
    while (true) {
        const matches = regex.exec(str);
        if (!matches) break;

        const fullMatch = matches[0];
        const fullMatchStart = matches.index;
        const fullMatchEnd = fullMatchStart + fullMatch.length;

        // Append the part of the string before the full match
        result += encodeHtmlSpecialChars(str.slice(cursor, fullMatchStart)) + '<span class="highlight">';

        let localCursor = 0;
        for (let i = 1; i < matches.length; i++) {
            const group = matches[i];
            if (group !== undefined) {
                const groupStart = fullMatch.indexOf(group, localCursor);
                const groupEnd = groupStart + group.length;

                // Append the part of the full match before the group and the group itself with surrounding '--'
                result += encodeHtmlSpecialChars(fullMatch.slice(localCursor, groupStart)) + '<span class="highlight-capture">' + encodeHtmlSpecialChars(group) + '</span>';
                localCursor = groupEnd;
            }
        }

        // Append the rest of the full match after the last group
        result += encodeHtmlSpecialChars(fullMatch.slice(localCursor)) + '</span>';

        // Update the cursor to the end of the full match
        cursor = fullMatchEnd;
    }

    // Append the rest of the string after the last match
    result += encodeHtmlSpecialChars(str.slice(cursor));

    return result;
}


// Test regex against examples
function testRegex(current_div,perform_highlighting) {
    const regexInputDiv = document.getElementById('regex-input');
    const regexToUse = regexInputDiv.innerHTML;
    const showCaptureGroups = true;
    
    if(current_div==="all"){
        exampleDivs = document.querySelectorAll('.examples-to-check');
    } else {
        console.log(current_div);
        exampleDivs = [document.getElementById(current_div.id)];
    }

if (regexToUse === "" || regexToUse === null) {
    exampleDivs.forEach((item) => {clearExamples(item, true, true)});
    regexInputDiv.classList.add('missing');
    return null;
}

let regex = null;
try {
    regex = new RegExp(regexToUse, getMatchMode());
    regexInputDiv.classList.remove('error');
    clearError();
} catch (e) {
    console.log(e);
    console.log(exampleDivs);
    exampleDivs.forEach((item) => {clearExamples(item, true, true)});
    regexInputDiv.classList.add('error');
    displayError(e);
    return null;
}
regexInputDiv.classList.remove('missing');
exampleDivs.forEach((div) => {
    //console.log("oh no");
    //div.classList.remove('disabled');
    textToCheck = removeHighlighting(div);
    try {
        const any_match = regex.test(textToCheck);

        if (!any_match) {
            clearExamples(div, false, current_div==="all");
            return null;
        }
        div.classList.add('match');
        if (showCaptureGroups && perform_highlighting) {
            let highlightedText = highlightText(textToCheck,regex);
            div.innerHTML = highlightedText;
        }
    } catch (e) {
        console.log(e);
        clearExamples(div, false, false);
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
    // const matchMode = document.querySelector('input[name="match-mode"]:checked').value;
    // return matchMode === 'all' ? "g" : "";
    return ("g")
}

// Function to initialize the tool
function init() {
    setupFromQueryString();
    attachEditableEvents();
    testRegex("all",true);
}

// Initialize the tool when the page loads
window.addEventListener('DOMContentLoaded', init);
