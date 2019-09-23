const science = 'Science';
const technology = 'Technology';
const military = 'Military';
const exploration = 'Exploration';

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
