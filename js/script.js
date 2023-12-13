// Function to retrieve query string parameters and populate fields
function setupFromQueryString() {
        const params = new URLSearchParams(window.location.search);
        const regexParam = params.get('r');
        const examplesParams = [params.get('e1'), params.get('e2'), params.get('e3'), params.get('e4')];
        if (regexParam) {
        let matches = regexParam.match(/^\/(.*?)\/([a-z]*)$/);
        if (matches === null){
            if (regexParam) {
                document.getElementById('regex-input').innerText = regexParam;
            }
        } else {
            if (matches[2]!=='') {
                var checkboxes = document.querySelectorAll('.dropdown-options input[type=checkbox]');
                var modifiers = matches[2].split(''); 
                checkboxes.forEach(function(checkbox) {
                    if (modifiers.includes(checkbox.value)) {
                        checkbox.checked=true;
                        modifiers=modifiers.filter(item => item!==checkbox.value)
                    }
                });
                if(modifiers.length>0){
                    displayWarning('Warning: the modifiers ('+ modifiers.join(', ') +') are not handled and so have been ignored');
                }
            }
        // Populate regex input
        document.getElementById('regex-input').innerText = matches[1];
            
        }
    }
    
    // Populate example inputs
    examplesParams.forEach((example, index) => {
        if (example) {
            document.getElementById('example' + (index + 1)).innerText = example;
        }
    });
    }

    function numNewLines(text) {
        return (text.match(/\n/g) || []).length;
    }
    // Clean text for regex processing
    function removeHighlighting(element) {
        const elementClone = element.cloneNode(true);
        const innerSpans = elementClone.querySelectorAll('span.highlight, span.highlight-capture');
        innerSpans.forEach((innerSpan) => {
            // Replace each inner <span> with its content
            innerSpan.parentNode.replaceChild(document.createTextNode(innerSpan.textContent), innerSpan);
          });
        elementClone.innerHTML=elementClone.innerHTML.replace('<br class="highlight-br">',"\n");
        if(numNewLines(elementClone.innerHTML)=== 1){
            return(elementClone.innerHTML.replace('\n', ''));
        }
        return elementClone.innerHTML;
    }
    
    function insertTextAtCursor(text) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents(); // Delete any selected text
    
            // Create a text node and insert it at the cursor position
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
    
            // Create a new range and set its start and end
            const newRange = document.createRange();
            newRange.setStartAfter(textNode);
            newRange.setEndAfter(textNode);
    
            // Update the selection with the new range
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
    }
    // Attach events to editable content
    function attachEditableEvents() {
        document.querySelectorAll('.examples-to-check').forEach(div => {
            div.addEventListener('focus', function () {
                this.innerHTML = removeHighlighting(this);
            });
            div.addEventListener('blur', function () {
                if(numNewLines(div.innerHTML)>0 & div.innerHTML[div.innerHTML.length - 1]!=='\n'){
                    div.innerHTML=div.innerHTML+'\n';
                }
                testRegex(div,true); // Call testRegex when the div loses focus
            });
            
            div.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent the default Enter key behavior
                    // console.log(hasSingleNewline(div.innerHTML));
                    if(numNewLines(div.innerHTML)=== 0){
                        insertTextAtCursor('\n\n');
                    } else {
                        insertTextAtCursor('\n'); // Insert a newline character at the cursor
                    }
                    testRegex(div,false);
                }
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
        let catch_infinite_loop = 0;
        while (catch_infinite_loop<=500) {
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
            catch_infinite_loop+=1;
            if (!regex.global) break;
        }
    
        // Append the rest of the string after the last match
        result += encodeHtmlSpecialChars(str.slice(cursor));

        if(numNewLines(result)>0){
            result = result.replace('\n','<br class="highlight-br">');
            // result = result + '<br class="highlight-br">'
        }

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
        div.classList.remove('disabled');
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
    function displayWarning(message) {
        const warningDiv = document.getElementById('warning-message');
        warningDiv.innerText = message;
        warningDiv.style.display = 'block';
    }
    
    // Function to clear the error message
    function clearError() {
        const errorDiv = document.getElementById('error-message');
        errorDiv.innerText = '';
        errorDiv.style.display = 'none';
        // const warningDiv = document.getElementById('warning-message');
        // warningDiv.innerText = '';
        // warningDiv.style.display = 'none';
    }
    
    // Get the match mode from the radio buttons
    function getMatchMode() {
        var checkboxes = document.querySelectorAll('.dropdown-options input[type=checkbox]');
        var selected = [];
    
        checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                selected.push(checkbox.value);
            }
        });
        return (selected.join(''))
    }
    
    // Function to initialize the tool
    function init() {
        setupFromQueryString();
        attachEditableEvents();
        testRegex("all",true);
    }
    
    // Initialize the tool when the page loads
    window.addEventListener('DOMContentLoaded', init);
