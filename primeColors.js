// primeColors.js

// Utility Functions
const hashPrimeToColor = (prime) => {
    // Simple hash function to generate a color from a prime number
    const hash = prime * 2654435761 % 2**32;
    let r = (hash & 0xFF0000) >> 16;
    let g = (hash & 0x00FF00) >> 8;
    let b = hash & 0x0000FF;

    // Calculate brightness (using the luminance formula)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // If the color is too close to white, darken it
    const brightnessThreshold = 200; // Adjust this value as needed
    if (brightness > brightnessThreshold) {
        const darkenFactor = 0.7; // Adjust this value as needed
        r = Math.floor(r * darkenFactor);
        g = Math.floor(g * darkenFactor);
        b = Math.floor(b * darkenFactor);
    }

    return `rgb(${r}, ${g}, ${b})`;
};

export const getColorForPrime = (prime) => hashPrimeToColor(prime);