const science = 'science';
const technology = 'technology';
const military = 'military';
const exploration = 'exploration';

const scienceDie = [
    science,
    technology,
    military,
    exploration,
    science,
    technology,
    military,
    exploration,
    science,
    technology,
    military,
    exploration,
]

export function rollScience() {
    return scienceDie[Math.floor(Math.random() * scienceDie.length)];
}
