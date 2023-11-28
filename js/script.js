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

// Function to populate the highlighted text divs from query string parameters
function populateFields() {
    const { regex, examples } = getQueryStringParams();
    document.getElementById('regex-input').value = regex || '';
    examples.forEach((example, index) => {
        const exampleDiv = document.getElementById('highlighted-text' + (index + 1));
        if (example !== null) {
            exampleDiv.innerText = example; // Set the text content of the div
        }
    });
    testRegex(); // Call testRegex to apply initial highlighting
}

// Function to handle the editing of text
function editText(exampleNumber) {
    const highlightedTextDiv = document.getElementById('highlighted-text' + exampleNumber);
    const textEditInput = document.getElementById('text-edit' + exampleNumber);
    const editButton = highlightedTextDiv.nextElementSibling;

    if (textEditInput.style.display === 'none') {
        // Switch to edit mode
        highlightedTextDiv.style.display = 'none';
        textEditInput.style.display = 'block';
        editButton.textContent = 'Done';
        textEditInput.value = highlightedTextDiv.textContent;
        textEditInput.focus();
    } else {
        // Switch back to highlight mode
        highlightedTextDiv.style.display = 'block';
        textEditInput.style.display = 'none';
        editButton.textContent = 'Edit';
        highlightedTextDiv.textContent = textEditInput.value;
        testRegex(); // Reapply highlighting and regex testing
    }
}

// Function to test regex against the example texts and apply highlighting
function testRegex() {
    const regexInput = document.getElementById('regex-input').value;
    const showCaptureGroups = document.getElementById('capture-group-toggle').checked;
    
    try {
        const regex = new RegExp(regexInput, 'g'); // Global flag for multiple matches
        document.querySelectorAll('.example-container').forEach(container => {
            const highlightedTextDiv = container.querySelector('.highlighted-text');
            const textEditInput = container.querySelector('.text-edit');
            const captureGroupDiv = container.querySelector('.capture-group');
            const exampleText = textEditInput.style.display === 'none' ? highlightedTextDiv.textContent : textEditInput.value;
            
            let match = regex.exec(exampleText);
            let newText = exampleText;
            let captureGroups = [];

            while (match !== null) {
                let fullMatch = match[0];
                if (showCaptureGroups && match.length > 1) {
                    // Capture groups exist
                    let groups = [];
                    for (let i = 1; i < match.length; i++) {
                        groups.push(match[i]);
                        newText = newText.replace(match[i], `<span class="highlight">${match[i]}</span>`);
                    }
                    captureGroups.push(`[${groups.join(', ')}]`);
                } else {
                    // No capture groups, just highlight the full match
                    newText = newText.replace(fullMatch, `<span class="highlight">${fullMatch}</span>`);
                }
                match = regex.exec(exampleText);
            }
            
            // Update the display based on the mode
            if (textEditInput.style.display === 'none') {
                highlightedTextDiv.innerHTML = newText; // Display with highlighting
            }
            captureGroupDiv.textContent = captureGroups.join(', '); // Display capture groups
        });
    } catch (e) {
        console.error('Invalid regex pattern.');
    }
}

function generateExamples() {
    const exampleInputs = document.getElementById('example-inputs');
    exampleInputs.innerHTML = ''; // Clear existing example containers

    // Generate new example containers
    for (let i = 1; i <= 4; i++) {
        exampleInputs.innerHTML += `
            <div class="example-container">
                <div class="highlighted-text" id="highlighted-text${i}" contenteditable="true">Example text here...</div>
                <button onclick="editText(${i})">Edit</button>
                <div class="capture-group" id="capture-group${i}"></div>
            </div>
        `;
    }
}

// Initialization function
function init() {
    generateExamples();
    //populateFields();
}

window.onload = init;
