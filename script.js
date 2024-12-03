import { getColorForPrime } from './primeColors.js';

// Constants
const MAX_LINE_LENGTH = 400; // Maximum line length in pixels
const MIN_LINE_LENGTH = 25; // Minimum line length in pixels
const CONSTANT_LINE_LENGTH = 100; // Constant line length for primes 1 and 2
const JI_LINE_LEFT_POSITION = 152; // Left position for JI intervals
const EDO_LINE_RIGHT_POSITION = 150; // Right position for EDO intervals
const EDO_LABEL_RIGHT_OFFSET = 200; // Right offset for EDO labels
const LABEL_PADDING = 5; // Padding for labels
const DEFAULT_COLOR = 'black';
const EDO_CLASS = 'edo';
const JI_CLASS = 'ji';

// Utility Functions
const getOddPart = (n) => {
    while (n % 2 === 0 && n > 1) {
        n = n / 2;
    }
    return n;
};

const primeFactors = (n) => {
    const factors = [];
    let divisor = 2;
    while (n >= 2) {
        if (n % divisor === 0) {
            factors.push(divisor);
            n = n / divisor;
        } else {
            divisor++;
        }
    }
    return factors;
};

const gcd = (a, b) => {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
};

const getMaxPrime = (num, den) => {
    const numFactors = primeFactors(num);
    const denFactors = primeFactors(den);
    const allPrimes = new Set([...numFactors, ...denFactors]);
    return Math.max(...allPrimes);
};

const getLineLengthForPrime = (prime, primeLimit) => {
    if (prime === 1 || prime === 2) {
        return CONSTANT_LINE_LENGTH;
    }

    const primes = [];
    for (let i = 2; i <= primeLimit; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }

    if (!primes.includes(prime)) {
        primes.push(prime);
    }

    primes.sort((a, b) => a - b);

    const primeIndex = primes.indexOf(prime);
    const totalPrimes = primes.length;

    return MIN_LINE_LENGTH + ((MAX_LINE_LENGTH - MIN_LINE_LENGTH) * (primeIndex / (totalPrimes - 1)));
};

const generateJIIntervals = (primeLimit, oddLimit) => {
    const intervals = [];
    const limit = oddLimit * 2;
    for (let numerator = 1; numerator <= limit; numerator++) {
        for (let denominator = 1; denominator <= limit; denominator++) {
            if (numerator >= denominator && gcd(numerator, denominator) === 1) {
                const ratioValue = numerator / denominator;
                if (ratioValue <= 2) {
                    const maxPrime = getMaxPrime(numerator, denominator);
                    const oddNum = getOddPart(numerator);
                    const oddDen = getOddPart(denominator);
                    const maxOddPart = Math.max(oddNum, oddDen);
                    if (maxPrime <= primeLimit && maxOddPart <= oddLimit) {
                        const cents = 1200 * Math.log2(ratioValue);
                        intervals.push({
                            ratio: `${numerator}/${denominator}`,
                            cents: cents,
                            maxPrime: maxPrime
                        });
                    }
                }
            }
        }
    }
    intervals.sort((a, b) => a.cents - b.cents);
    return intervals;
};

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

// Utility function to check if a number is prime
const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
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