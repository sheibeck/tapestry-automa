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

//roll science until you roll something in the matches
// matches an array of items possibilities
export function rollScienceDecision(matches) {
    let roll = rollScience();
    while(matches.indexOf(roll) === -1) {
        roll = rollScience();
    }
    return roll;
}
