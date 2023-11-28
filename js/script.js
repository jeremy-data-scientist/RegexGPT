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
        const exampleDiv = document.getElementById('highlighted-text' + (index + 1));
        if (example !== null) {
            exampleDiv.innerText = example; // Set the text content of the div
        }
    });
    // Call updateRegex which will call testRegex
    updateRegex();
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
    
    // Make sure to update the editable divs if we are in capture group mode
    if (hasCaptureGroups) {
        testRegex(); // This function will handle highlighting and displaying capture groups
    } else {
        // If we are not in capture group mode, remove any existing highlights
        const exampleDivs = document.querySelectorAll('.highlighted-text');
        exampleDivs.forEach(div => {
            // Replace the inner HTML with just text to remove any <span> elements
            div.innerHTML = div.innerText;
        });
    }
}
function testRegex() {
    const regexInput = document.getElementById('regex-input').value;
    const showCaptureGroups = document.getElementById('capture-group-toggle').checked;

    try {
        const regex = new RegExp(regexInput);
        const exampleDivs = document.querySelectorAll('.highlighted-text');

        exampleDivs.forEach((div, index) => {
            const matches = div.innerText.match(regex);
            div.classList.remove('match');

            if (matches) {
                // Clear previous content
                div.innerHTML = '';

                if (showCaptureGroups) {
                    // Highlight capture groups
                    let newText = div.innerText;
                    let captureGroups = [];

                    matches.forEach((match, groupIndex) => {
                        if (groupIndex !== 0) { // skip the entire match
                            const span = document.createElement('span');
                            span.classList.add('highlight');
                            span.textContent = match;
                            newText = newText.replace(match, span.outerHTML);
                            captureGroups.push(match);
                        }
                    });

                    // Set the new HTML
                    div.innerHTML = newText;

                    // Display capture groups in a separate box
                    const captureGroupDiv = document.getElementById('capture-group' + (index + 1));
                    captureGroupDiv.textContent = 'Capture groups: ' + captureGroups.join(', ');
                } else {
                    // Just display matches
                    div.classList.add('match');
                }
            } else {
                // If no matches, ensure any previous highlighting is cleared
                div.innerHTML = div.innerText;
            }
        });
    } catch (e) {
        // Handle invalid regex pattern
        console.error('Invalid regex pattern.');
    }
}

function editText(exampleNumber) {
    var highlightedTextDiv = document.getElementById('highlighted-text' + exampleNumber);
    var textEditInput = document.getElementById('text-edit' + exampleNumber);

    // If we're showing the editable input, hide it and show the highlighted text
    if (textEditInput.style.display === 'none') {
        highlightedTextDiv.style.display = 'none';
        textEditInput.style.display = 'block';
        textEditInput.value = highlightedTextDiv.innerText; // Transfer the text for editing
        textEditInput.focus();
    } else {
        highlightedTextDiv.style.display = 'block';
        textEditInput.style.display = 'none';
        highlightedTextDiv.innerHTML = textEditInput.value; // Transfer back the edited text
        // Call testRegex to update the highlighting
        testRegex();
    }
}

// Combine both populateFields and updateRegex into an init function
function init() {
    populateFields();
    updateRegex(); // This will now also call testRegex
}

// Call the init function on page load
window.onload = init;