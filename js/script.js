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

// function replaceNthMatch(originalText, regex, nth, replacement) {
//     let count = 0; // Initialize counter
  
//     return originalText.replace(regex, (match) => {
//       count++; // Increment counter for each match
//       if (count === nth) {
//         // When the nth match is found, replace with the replacement text
//         return replacement(match);
//       }
//       return match; // Otherwise, return the match as is
//     });
//   }
  
//   // Example usage:
//   let text = "The quick brown fox jumps over the lazy dog";
//   let regexToMatch = /(\b\w+\b)/g; // Regex to match each word
  
//   // Replace the 4th word with a highlight span
//   let nth = 4;
//   let newText = replaceNthMatch(text, regexToMatch, nth, (match) => `<span class="highlight">${match}</span>`);
  

function testRegex(defocused_div) {
    const regexInput = document.getElementById('regex-input').value;
    const showCaptureGroups = document.getElementById('capture-group-toggle').checked;
    const captureGroupsOutput = document.getElementById('capture-groups-output');
    const currentlyFocusedElement = document.activeElement;
    captureGroupsOutput.innerHTML = '';
    const regex = new RegExp(regexInput,getMatchMode());

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
                    let captureGroups = [];

                    function highlightAllMatches(originalText, regex) {
                        return originalText.replace(regex, (match) => `<span class="highlight">${match}</span>`);
                      }

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

document.getElementById('capture-group-toggle').addEventListener('change', function() {
    // Get the current state of the checkbox
    const isChecked = this.checked;
  
// Find all radio buttons for match-mode and set their disabled property
document.querySelectorAll('input[name="match-mode"]').forEach(radio => {
    radio.disabled = !isChecked;
});

// If the capture group toggle is turned off, reset the match mode to default
if (!isChecked) {
    document.querySelector('input[name="match-mode"][value="first"]').checked = true;
}
});

// Initial call to set the correct state when the page loads
document.getElementById('capture-group-toggle').dispatchEvent(new Event('change'));

function getMatchMode() {
    const matchMode = document.querySelector('input[name="match-mode"]:checked').value;
    return matchMode === 'all' ? "g" : ""; // This will be 'first' or 'all'
  }

// Combine both populateFields and updateRegex into an init function
function init() {
    populateFields();
    updateRegex(); // This will now also call testRegex
}

// Call the init function on page load
window.onload = init;