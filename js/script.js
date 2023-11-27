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
    const exampleInputs = document.querySelectorAll('.example-input');
    try {
        const regex = new RegExp(regexInput);
        exampleInputs.forEach((input) => {
            const matches = regex.test(input.value);
            if (matches) {
                input.classList.add('match');
            } else {
                input.classList.remove('match');
            }
        });
    } catch (e) {
        // Handle invalid regex pattern
        exampleInputs.forEach((input) => {
            input.classList.remove('match');
        });
    }
}


// Populate fields when the page loads
window.onload = populateFields;