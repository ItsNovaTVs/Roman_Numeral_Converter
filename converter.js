const romanMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
};

// Function to parse a Roman string containing stacked combining macrons (\u0304)
function parseRomanWithMacrons(s) {
    let tokens = [];
    let i = 0;
    const cleaned = s.trim();

    while (i < cleaned.length) {
        let char = cleaned[i].toUpperCase();
        
        if (romanMap[char] !== undefined) {
            let baseValue = romanMap[char];
            let macronCount = 0;
            let j = i + 1;

            // Count consecutive combining macrons following this character
            while (j < cleaned.length && cleaned[j] === '\u0304') {
                macronCount++;
                j++;
            }

            // Enforce max 4 macrons rule
            if (macronCount > 4) {
                return { error: "A symbol cannot have more than 4 macrons." };
            }

            // Enforce 'I' cannot take macrons rule
            if (baseValue === 1 && macronCount > 0) {
                return { error: "The letter 'I' cannot have macrons." };
            }

            // Calculate value: base * (1000 ^ macronCount)
            let finalVal = baseValue * Math.pow(1000, macronCount);
            tokens.push({ val: finalVal });
            i = j; // Jump past the base character and its macrons
        } else {
            if (!/\s/.test(cleaned[i])) {
                return { error: `Invalid character detected: ${cleaned[i]}` };
            }
            i++;
        }
    }

    let total = 0;
    for (let idx = 0; idx < tokens.length; idx++) {
        let current = tokens[idx].val;
        let next = tokens[idx + 1] ? tokens[idx + 1].val : 0;

        if (next > current) {
            total -= current;
        } else {
            total += current;
        }
    }

    return { total };
}

document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById("romanInput");
    const convertBtn = document.getElementById("convertBtn");
    const macronBtn = document.getElementById("macronBtn");
    const outputValue = document.getElementById("outputValue");

    // Add Macron button behavior
    macronBtn.addEventListener("click", () => {
        const cursorPosition = inputField.selectionStart;
        const val = inputField.value;

        // Find the base letter just before the cursor or within the macron chain
        // We scan backwards slightly to find the valid Roman letter if cursor is sitting amidst macrons
        let baseLetterIdx = -1;
        for (let i = cursorPosition - 1; i >= 0; i--) {
            let char = val[i].toUpperCase();
            if (romanMap[char] !== undefined) {
                baseLetterIdx = i;
                break;
            } else if (val[i] !== '\u0304') {
                // Hit a different character entirely, stop searching back
                break;
            }
        }

        if (baseLetterIdx === -1) {
            outputValue.textContent = "Place your cursor on or right after a letter (V, X, L, C, D, M) to add a macron.";
            return;
        }

        let targetChar = val[baseLetterIdx];

        // Block macrons on 'I' or 'i'
        if (targetChar.toUpperCase() === 'I') {
            outputValue.textContent = "Error: 'I' cannot take macrons.";
            return;
        }

        // Count how many macrons are already attached to this specific base letter
        let macronCount = 0;
        let k = baseLetterIdx + 1;
        while (k < val.length && val[k] === '\u0304') {
            macronCount++;
            k++;
        }

        if (macronCount < 4) {
            // Insert the combining macron right after the existing macrons of this letter
            let insertPos = baseLetterIdx + 1 + macronCount;
            inputField.value = val.slice(0, insertPos) + '\u0304' + val.slice(insertPos);
            
            // Keep the cursor positioned neatly after the newly added macron
            inputField.setSelectionRange(insertPos + 1, insertPos + 1);
            inputField.focus();
            outputValue.textContent = "-"; // clear previous messages
        } else {
            outputValue.textContent = "Error: Maximum of 4 macrons allowed.";
        }
    });

    function handleConversion() {
        const rawValue = inputField.value;

        if (!rawValue) {
            outputValue.textContent = "Please enter a Roman numeral.";
            return;
        }

        const resultObj = parseRomanWithMacrons(rawValue);

        if (resultObj.error) {
            outputValue.textContent = resultObj.error;
        } else {
            outputValue.textContent = resultObj.total.toLocaleString();
        }
    }

    convertBtn.addEventListener("click", handleConversion);
    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleConversion();
        }
    });
});