// Function to get query string parameters
function getQueryStringParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        regex: params.get('r'),
        examples: [
            params.get('e1'),
            params.get('e2'),
            params.get('e3'),
            params.get('e4')
        ]
    };
}

// Function to populate form fields from query string parameters
function populateFields() {
    const { regex, examples } = getQueryStringParams();
    document.getElementById('regex-input').value = regex || '';
    examples.forEach((example, index) => {
        if (example !== null) {
            document.getElementById('example' + (index + 1)).innerText = example;
        }
    });
    testRegex();
}

document.getElementById('example-inputs').addEventListener('click', function (event) {
    if (event.target.type === 'checkbox') {
      // Check if the clicked element is a checkbox
        event.preventDefault(); // Prevent checkbox change
    }
  });

function updateRegex() {
    const regexInput = document.getElementById('regex-input').value;
    // Automatically check the 'Show capture groups' checkbox if the regex contains capture groups
    const hasCaptureGroups = /\(.*?\)/.test(regexInput);
    document.getElementById('capture-group-toggle').checked = hasCaptureGroups;
    testRegex(true);
}

function cleanHighlight(element) {
    // Remove span tags with the class 'highlight'
    element.innerHTML = element.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
}

function attachEditableEvents() {
    document.querySelectorAll('.editable-content').forEach(div => {
        div.addEventListener('focus', function() {
            cleanHighlight(this);
        });
        div.addEventListener('blur', function() {
            testRegex(div); // Call testRegex when the div loses focus
        });
    });
}

// Call this function to initialize the event listeners
attachEditableEvents();

function testRegex(defocused_div) {
    const regexInput = document.getElementById('regex-input').value;
    const showCaptureGroups = document.getElementById('capture-group-toggle').checked;
    const captureGroupsOutput = document.getElementById('capture-groups-output');
    const currentlyFocusedElement = document.activeElement;
    captureGroupsOutput.innerHTML = '';

    
        const regex = new RegExp(regexInput,"g");
        const exampleDivs = document.querySelectorAll('.editable-content');
        exampleDivs.forEach((div, index) => {
            textToCheck = div.innerHTML;/*.replace(/<span class="highlight">|<\/span>/g, '');*/
            console.log(textToCheck)
            try {
            const any_match = regex.test(textToCheck);
            if (any_match) {
                div.classList.add('match');
            } else {
                div.classList.remove('match');
            }
            if(showCaptureGroups && div === defocused_div){
                const matches = textToCheck.match(regex) || [];
                console.log(matches)

                if (matches) {
                    // Highlight capture groups
                    let newText = textToCheck;
                    let captureGroups = [];

                    for (let i = 1; i < matches.length; i++) {
                        captureGroups.push(matches[i]);
                        // Use a function to replace only non-highlighted matches
                        newText = newText.replace(new RegExp(matches[i], 'g'), (match, offset, fullString) => {
                            // Check if the match is already part of a "highlight" span
                            const spanOpeningTag = fullString.lastIndexOf('<span', offset);
                            const spanClosingTag = fullString.lastIndexOf('</span>', offset);
                            
                            // If the closing tag of a span precedes the match or there is no opening tag before the match,
                            // then this match is not inside a span and should be highlighted.
                            if (spanOpeningTag === -1 || spanClosingTag > spanOpeningTag) {
                                return `<span class="highlight">${match}</span>`;
                            }
                    
                            // If the match is inside an existing "highlight" span, return the match unaltered
                            return match;
                        });
                    }

                    div.innerHTML = newText;

                    const captureGroupDiv = document.createElement('div');
                    captureGroupDiv.textContent = `Example ${index + 1} capture groups: ${captureGroups.join(', ')}`;
                    captureGroupsOutput.appendChild(captureGroupDiv);
                }
            }
        } catch (e) {
            div.classList.remove('match');
            console.error(e);/*'Invalid regex pattern. '*/
        }
        });
}


// Combine both populateFields and updateRegex into an init function
function init() {
    populateFields();
    updateRegex(); // This will now also call testRegex
}

// Call the init function on page load
window.onload = init;