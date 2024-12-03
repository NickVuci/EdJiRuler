import { getColorForPrime } from './primeColors.js';
import {
    getOddPart,
    primeFactors,
    gcd,
    isPrime,
    getMaxPrime,
    getLineLengthForPrime,
    generateJIIntervals
} from './utils.js';
import {
    MAX_LINE_LENGTH,
    MIN_LINE_LENGTH,
    CONSTANT_LINE_LENGTH,
    DEFAULT_COLOR, 
    JI_LINE_LEFT_POSITION,
    EDO_LINE_RIGHT_POSITION,
    EDO_LABEL_RIGHT_OFFSET,
    LABEL_PADDING,
    EDO_CLASS,
    JI_CLASS
} from './constants.js';

const createInterval = (container, position, labelContent, isJI = false, color = DEFAULT_COLOR, lineLength = 98) => {
    const intervalLine = document.createElement('div');
    intervalLine.className = 'interval' + (isJI ? ` ${JI_CLASS}` : ` ${EDO_CLASS}`);
    intervalLine.style.top = `${position}px`;

    if (labelContent.startsWith('1/1') || labelContent.startsWith('2/1')) {
        lineLength = CONSTANT_LINE_LENGTH;
        color = DEFAULT_COLOR;
    }

    if (isJI) {
        intervalLine.style.backgroundColor = color;
        intervalLine.style.width = `${lineLength}px`;
        intervalLine.style.left = `${JI_LINE_LEFT_POSITION}px`;
    } else {
        intervalLine.style.backgroundColor = DEFAULT_COLOR;
        intervalLine.style.width = '50px';
        intervalLine.style.right = `${EDO_LINE_RIGHT_POSITION}px`;
    }

    container.appendChild(intervalLine);

    const intervalLabel = document.createElement('div');
    intervalLabel.className = 'label' + (isJI ? ` ${JI_CLASS}` : ` ${EDO_CLASS}`);
    intervalLabel.style.top = `${position}px`;
    intervalLabel.innerHTML = labelContent;

    if (isJI) {
        intervalLabel.style.color = color;
        intervalLabel.style.left = `${JI_LINE_LEFT_POSITION + lineLength + LABEL_PADDING}px`;
    } else {
        intervalLabel.style.right = `${EDO_LABEL_RIGHT_OFFSET}px`;
        intervalLabel.style.textAlign = 'right';
    }

    container.appendChild(intervalLabel);
};

const drawRuler = () => {
    const edo = parseInt(document.getElementById('edoInput').value);
    const primeLimit = parseInt(document.getElementById('primeLimitInput').value);
    const oddLimit = parseInt(document.getElementById('oddLimitInput').value);
    const rulerHeight = parseInt(document.getElementById('rulerHeightInput').value);
    const rulerContainer = document.getElementById('rulerContainer');
    rulerContainer.innerHTML = '<div id="ruler"></div>';
    const ruler = document.getElementById('ruler');
    ruler.style.height = `${rulerHeight}px`;

    for (let i = 0; i <= edo; i++) {
        const cents = i * (1200 / edo);
        const position = (cents / 1200) * ruler.offsetHeight;
        createInterval(rulerContainer, position, `${i}\\${edo} ${cents.toFixed(1)}¢`, false);
    }

    const intervals = generateJIIntervals(primeLimit, oddLimit);
    intervals.forEach(interval => {
        const cents = interval.cents;
        const position = (cents / 1200) * ruler.offsetHeight;
        const color = getColorForPrime(interval.maxPrime);
        const lineLength = getLineLengthForPrime(interval.maxPrime, primeLimit);
        createInterval(rulerContainer, position, `${interval.ratio} ${cents.toFixed(1)}¢`, true, color, lineLength);
    });
};

// Generic function to set up input validation and keydown handlers
const setupInputField = (inputId, validateFn, step = 1) => {
    const input = document.getElementById(inputId);
    input.setAttribute('step', step);
    input.addEventListener('input', function(event) {
        let value = parseInt(event.target.value);
        const previousValue = parseInt(event.target.getAttribute('data-previous-value')) || value;
        const newValue = validateFn(value, previousValue);
        event.target.value = newValue;
        event.target.setAttribute('data-previous-value', newValue);
    });

    input.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            let value = parseInt(event.target.value);
            value = event.key === 'ArrowUp' ? value + step : value - step;
            value = validateFn(value, value - step);
            event.target.value = value;
            event.target.setAttribute('data-previous-value', value);
        }
    });
};

// Validation functions
const validateOddLimit = (value) => {
    return value % 2 === 0 ? value + 1 : value;
};

const validatePrimeLimit = (value, previousValue) => {
    if (value > previousValue) {
        while (!isPrime(value)) value += 1;
    } else {
        while (!isPrime(value) && value > 2) value -= 1;
    }
    return value;
};

// Setup input fields using the generic function
setupInputField('oddLimitInput', validateOddLimit, 2);
setupInputField('primeLimitInput', validatePrimeLimit);

window.drawRuler = drawRuler;

// Call drawRuler when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', drawRuler);