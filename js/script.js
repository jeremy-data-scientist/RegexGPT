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
            document.getElementById('example' + (index + 1)).value = example;
        }
    });
    // Call testRegex after populating the fields to apply highlighting
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
    testRegex();
}

function testRegex() {
    const regexInput = document.getElementById('regex-input').value;
    const showCaptureGroups = document.getElementById('capture-group-toggle').checked;
    const captureGroupsOutput = document.getElementById('capture-groups-output');
    captureGroupsOutput.innerHTML = ''; // Clear previous capture groups

    try {
        const regex = new RegExp(regexInput);
        const exampleInputs = document.querySelectorAll('.example-input');

        exampleInputs.forEach((input, index) => {
            const matches = input.value.match(regex);
            input.classList.remove('match');

            if (matches) {
                if (showCaptureGroups) {
                    // Highlight capture groups
                    let highlightedText = input.value;
                    let captureGroups = [];

                    for (let i = 1; i < matches.length; i++) {
                        // Create a highlighted version of the matches
                        highlightedText = highlightedText.replace(matches[i], `<span class="highlight">${matches[i]}</span>`);
                        captureGroups.push(matches[i]);
                    }

                    // Display the highlighted text
                    input.value = highlightedText;

                    // Display capture groups in a separate box
                    const captureGroupText = document.createElement('div');
                    captureGroupText.textContent = `Example ${index + 1} capture groups: ${captureGroups.join(', ')}`;
                    captureGroupsOutput.appendChild(captureGroupText);
                } else {
                    input.classList.add('match');
                }
            }
        });
    } catch (e) {
        // Handle invalid regex pattern
        console.error('Invalid regex pattern.');
    }
}

// Combine both populateFields and updateRegex into an init function
function init() {
    populateFields();
    updateRegex(); // This will now also call testRegex
}

// Call the init function on page load
window.onload = init;