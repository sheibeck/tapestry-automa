export function snakeToCamel(str) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
    return str.replace(
        /([-_][a-z])/g,
        (group) => group.toUpperCase()
                    .replace('-', ' ')
                    .replace('_', ' ')
    );
}

export function getTrackColor(track) {
    switch(track) {
        case "military":
            return "danger";
        case "science":
            return "success";
        case "exploration":
            return "primary";
        case "technology":
            return "warning";
    }
}

export function getTrackIcon(track) {
    return `<img src="images/${track}.png" class="track-icon" alt="${track} icon" />`;    
}