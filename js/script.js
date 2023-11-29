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
    document.getElementById('regex-input').innerHTML = regex || '';
    examples.forEach((example, index) => {
        if (example !== null) {
            document.getElementById('example' + (index + 1)).innerText = example;
        }
    });
}

function updateRegex() {
    const regexInput = document.getElementById('regex-input').innerHTML;
    // Automatically check the 'Show capture groups' checkbox if the regex contains capture groups
    const hasCaptureGroups = /\(.*?\)/.test(regexInput);
    if(hasCaptureGroups){
        document.getElementById('capture-group-toggle').checked = hasCaptureGroups;
        document.getElementById('capture-group-toggle').dispatchEvent(new Event('change'));   // Initial call to set the correct state when the page loads
    }
    testRegex();
}


function cleanTextForRegex(element) {
    function decodeHtmlEntities(html) {
        var textArea = document.createElement('textarea');
        textArea.innerHTML = html;
        return textArea.value;
    }
    // Remove span tags with the class 'highlight'
    const temp=element.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
    return(decodeHtmlEntities(temp));
}

function attachEditableEvents() {
    document.querySelectorAll('.examples-to-check').forEach(div => {
        div.addEventListener('focus', function() {
            this.innerHTML = cleanTextForRegex(this);
        });
        div.addEventListener('blur', function() {
            testRegex(div); // Call testRegex when the div loses focus
        });
    });
    document.getElementById('example-inputs').addEventListener('click', function (event) {
        if (event.target.type === 'checkbox') {
        // Check if the clicked element is a checkbox
            event.preventDefault(); // Prevent checkbox change
        }
    });

    document.getElementById('capture-group-toggle').addEventListener('change', function() {
        // Get the current state of the checkbox
        const isChecked = this.checked;
        testRegex(isChecked);
      
        // Find all radio buttons for match-mode and set their disabled property
        document.querySelectorAll('input[name="match-mode"]').forEach(radio => {
            radio.disabled = !isChecked;
        });
    });

    // Find all radio buttons for match-mode and set their disabled property
    document.querySelectorAll('input[name="match-mode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Get the current state of the checkbox
            const isChecked = this.checked;
            testRegex(document.getElementById('capture-group-toggle').checked);
        });
    });
}


function testRegex(defocused_div) {
    const regexInputDiv = document.getElementById('regex-input');
    const regexToUse = cleanTextForRegex(regexInputDiv);
    const showCaptureGroups = document.getElementById('capture-group-toggle').checked;
    const captureGroupsOutput = document.getElementById('capture-groups-output');
    const currentlyFocusedElement = document.activeElement;
    captureGroupsOutput.innerHTML = '';
    const regex = new RegExp(regexToUse,getMatchMode());
    const exampleDivs = document.querySelectorAll('.examples-to-check');
    if(regexToUse==="" || regexToUse===null){
        exampleDivs.forEach((div) => {
            div.classList.remove('match');
            div.classList.add('disabled');
        })
        regexInputDiv.classList.add('missing');
        return(null)
    }
    regexInputDiv.classList.remove('missing');
    exampleDivs.forEach((div, index) => {
            div.classList.remove('disabled');
            textToCheck = cleanTextForRegex(div);
            try {
                const matches = textToCheck.match(regex) || [];

                if (matches.length===0) {
                    div.classList.remove('match');
                    return(null);
                } 

                div.classList.add('match');

                if(showCaptureGroups && (defocused_div===true || div === defocused_div)){

                    // Highlight capture groups
                    let captureGroups = [];

                    function highlightAllMatches(originalText, regex) {
                        return originalText.replace(regex, (match) => `<span class="highlight">${match}</span>`);
                        }

                    let highlightedText = highlightAllMatches(textToCheck, regex);

                    div.innerHTML = highlightedText;

                    const captureGroupDiv = document.createElement('div');
                    captureGroupDiv.textContent = `Example ${index + 1} capture groups: ${matches.join(', ')}`;
                    captureGroupsOutput.appendChild(captureGroupDiv);
                }
            } catch (e) {
                div.classList.remove('match');
                console.error(e);/*'Invalid regex pattern. '*/
            }
        });
}

function getMatchMode() {
    const matchMode = document.querySelector('input[name="match-mode"]:checked').value;
    return matchMode === 'all' ? "g" : ""; // This will be 'first' or 'all'
  }

// Combine both populateFields and updateRegex into an init function
function init() {
    populateFields();
    // Call this function to initialize the event listeners
    attachEditableEvents();
    updateRegex();
}

// Call the init function on page load
window.onload = init;