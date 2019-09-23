import * as gamestate from "./gamestate";

const enumTrack = {
    any: 'any',
    finish: 'finish',
    landmark: 'landmark',
}

const enumFaction = {
    automa: 'Automa',
    shadowEmpire: 'ShadowEmpire'
}

export function advanceTracks() { 
    let message = getTrackAdvance(enumFaction.automa);
    message += getTrackAdvance(enumFaction.shadowEmpire);

    app.gameMessage(message);
}

function getTrackAdvance(faction) {
    let decision = gamestate.getDecisionPair();   
    let track = null;
    switch (faction) {
        case enumFaction.automa:
            track = decision.leftcard.automatrack;
            break;
        case enumFaction.shadowEmpire:
            track = decision.leftcard.shadowtrack;
            break;            
    }

    switch(track) {
        case enumTrack.any:
            return allNonFinishedTracks(faction, decision);
            break;

        case enumTrack.finish:
            return nonFinishedClosestToEnd(faction, decision);
            break;

        case enumTrack.landmark:
            return nonFinishedClosestToLandmarkOrEnd(faction, decision);
            break;
    }
}

function allNonFinishedTracks(faction, decision) {    
    let tiebreaker = getTrackTieBreaker(faction, decision);
    let track = null;
    for(var propertyName in tiebreaker) {
        //convert the favorite track to a real track name
        track = tiebreaker[propertyName] === "favorite" ? gamestate.getFavoriteTrack(faction) : tiebreaker[propertyName];

        if (!gamestate.isTrackComplete(faction, track))
        {
            return gamestate.advanceOnTrack(faction, track);
            break;
        }        
    }
}

function nonFinishedClosestToLandmarkOrEnd(faction, decision) {

}

function nonFinishedClosestToEnd(faction, decision) {

}

function getTrackTieBreaker(faction, decision) {    
    const tracks = {science: decision.rightcard.science, military: decision.rightcard.military, exploration: decision.rightcard.exploration, technology: decision.rightcard.technology, favorite: decision.rightcard.favorite };
    let sortedTrack;

    switch(faction) {
        case enumFaction.automa:
            sortedTrack = Object.keys(tracks).sort(function(a,b){return tracks[a]-tracks[b]});            
            break;
        case enumFaction.shadowEmpire:
            sortedTrack = Object.keys(tracks).sort(function(a,b){return tracks[b]-tracks[a]});                        
            break;
    }

    console.log(sortedTrack); 
    return sortedTrack;
}