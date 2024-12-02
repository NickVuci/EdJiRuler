// Constants
const primeColors = {
    3: 'green',
    5: 'blue',
    7: 'orange',
    11: 'purple',
    13: 'brown',
    17: 'pink',
    19: 'cyan',
    23: 'magenta',
    // Add more primes and colors as needed
};

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

const getColorForPrime = (prime) => primeColors[prime] || 'gray';

const getLineLengthForPrime = (prime, primeLimit) => {
    const maxLineLength = 400; // Maximum line length in pixels
    const minLineLength = 25; // Minimum line length in pixels
    const constantLineLength = 100; // Constant line length for primes 1 and 2

    if (prime === 1 || prime === 2) {
        return constantLineLength;
    }

    const primes = Array.from(new Set(Object.keys(primeColors).map(Number)));
    primes.push(primeLimit);
    const uniquePrimes = [...new Set(primes)].sort((a, b) => a - b);

    const primeIndex = uniquePrimes.indexOf(prime);
    const totalPrimes = uniquePrimes.length;

    // Invert the relationship: smaller primes get shorter lines, larger primes get longer lines
    return minLineLength + ((maxLineLength - minLineLength) * (primeIndex / (totalPrimes - 1)));
};

const generateJIIntervals = (primeLimit, oddLimit) => {
    const intervals = [];
    const limit = oddLimit * 2; // To ensure ratios up to 2:1
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
    // Sort intervals by cents
    intervals.sort((a, b) => a.cents - b.cents);
    return intervals;
};

const createInterval = (container, position, labelContent, isJI = false, color = 'black', lineLength = 98) => {
    const intervalLine = document.createElement('div');
    intervalLine.className = 'interval' + (isJI ? ' ji' : ' edo');
    intervalLine.style.top = position + 'px';

    // Define constant length and color for intervals 1/1 and 1/2
    const constantLineLength = 100; // Example constant length
    const constantColor = 'black'; // Example constant color

    // Check if the interval is 1/1 or 1/2
    if (labelContent.startsWith('1/1') || labelContent.startsWith('2/1')) {
        lineLength = constantLineLength;
        color = constantColor;
    }

    if (isJI) {
        intervalLine.style.backgroundColor = color;
        intervalLine.style.width = lineLength + 'px';
    }

    if (!isJI) {
        // For EDO intervals, position line to extend to the left
        intervalLine.style.right = '150px';
        intervalLine.style.width = '50px'; // Adjust this value to make the EDO line shorter
    } else {
        // For JI intervals, position line to extend to the right
        intervalLine.style.left = '152px';
    }

    container.appendChild(intervalLine);

    const intervalLabel = document.createElement('div');
    intervalLabel.className = 'label' + (isJI ? ' ji' : ' edo');
    intervalLabel.style.top = position + 'px';
    intervalLabel.innerHTML = labelContent;

    if (isJI) {
        intervalLabel.style.color = color;
        // Position label at the end of the line
        const labelLeftPosition = 152 + lineLength + 5; // 5px padding
        intervalLabel.style.left = labelLeftPosition + 'px';
    } else {
        // For EDO labels, position to the left of the line
        intervalLabel.style.right = '200px'; // Adjust as needed
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
    rulerContainer.innerHTML = '<div id="ruler"></div>'; // Reset ruler
    const ruler = document.getElementById('ruler');
    ruler.style.height = rulerHeight + 'px';

    // Draw EDO intervals, including 0 and edo
    for (let i = 0; i <= edo; i++) {
        const cents = i * (1200 / edo);
        const position = (cents / 1200) * ruler.offsetHeight;
        createInterval(rulerContainer, position, `${i}\\${edo} ${cents.toFixed(1)}¢`, false);
    }

    // Draw JI intervals
    const intervals = generateJIIntervals(primeLimit, oddLimit);
    intervals.forEach(interval => {
        const cents = interval.cents;
        const position = (cents / 1200) * ruler.offsetHeight;
        const color = getColorForPrime(interval.maxPrime);
        const lineLength = getLineLengthForPrime(interval.maxPrime, primeLimit);
        createInterval(rulerContainer, position, `${interval.ratio} ${cents.toFixed(1)}¢`, true, color, lineLength);
    });
};