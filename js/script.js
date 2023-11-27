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
    const exampleInputs = document.getElementById('example-inputs');
    examples.forEach((example, index) => {
        const inputGroup = document.createElement('div');
        const exampleInput = document.createElement('input');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.disabled = false;
        exampleInput.type = 'text';
        exampleInput.value = example || '';
        exampleInput.oninput = testRegex;
        exampleInput.dataset.index = index;
        inputGroup.appendChild(exampleInput);
        inputGroup.appendChild(checkbox);
        exampleInputs.appendChild(inputGroup);
    });
}

document.getElementById('example-inputs').addEventListener('click', function (event) {
    if (event.target.type === 'checkbox') {
      // Check if the clicked element is a checkbox
        event.preventDefault(); // Prevent checkbox change
    }
  });
  
// Function to test regex
function testRegex() {
    const regexInput = document.getElementById('regex-input').value;
    const exampleInputs = document.querySelectorAll('#example-inputs input[type="text"]');
    try {
        const regex = new RegExp(regexInput);
        exampleInputs.forEach((input) => {
            const checkbox = input.nextSibling;
            const matches = regex.test(input.value);
            checkbox.checked = matches;
        });
    } catch (e) {
        // Handle invalid regex pattern
        exampleInputs.forEach((input) => {
            const checkbox = input.nextSibling;
            checkbox.checked = false;
        });
    }
}

// Populate fields when the page loads
window.onload = populateFields;