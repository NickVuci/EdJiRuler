// utils.js
import {
    MAX_LINE_LENGTH,
    MIN_LINE_LENGTH,
    CONSTANT_LINE_LENGTH
} from './constants.js';

export const getOddPart = (n) => {
    while (n % 2 === 0 && n > 1) {
        n = n / 2;
    }
    return n;
};

export const primeFactors = (n) => {
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

export const gcd = (a, b) => {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
};

export const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
};

export const getMaxPrime = (num, den) => {
    const numFactors = primeFactors(num);
    const denFactors = primeFactors(den);
    const allPrimes = new Set([...numFactors, ...denFactors]);
    return Math.max(...allPrimes);
};

export const getLineLengthForPrime = (prime, primeLimit) => {
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

export const generateJIIntervals = (primeLimit, oddLimit) => {
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