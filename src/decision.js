import * as gamestate from "./gamestate";


export function advanceTracks() { 
    
    let message = "";
    
    //advance the automa
    message += getTrackAdvance(gamestate.enumFaction.automa);    
    message += getTrackAdvance(gamestate.enumFaction.shadowempire);

    app.gameMessage(message);
}

function getTrackAdvance(faction) {
    let decision = gamestate.getDecisionPair(false);
    let track = null;
    switch (faction) {
        case gamestate.enumFaction.automa:
            track = decision.leftcard.automatrack;
            break;
        case gamestate.enumFaction.shadowempire:
            track = decision.leftcard.shadowtrack;
            break;            
    }

    switch(track) {
        case gamestate.enumTrack.any:
            return allNonFinishedTracks(faction, decision);
            break;

        case gamestate.enumTrack.finish:
            return nonFinishedClosestToEnd(faction, decision);
            break;

        case gamestate.enumTrack.landmark:
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

export function nonFinishedClosestToLandmarkOrEnd(faction, decision) {
    let tiebreaker = getTrackTieBreaker(faction, decision);
    
    //get the faction board state we're looking for
    let ft = gamestate.automaState.tracks[faction];

    //filter out any tracks that have reached the end
    var availableTracks = Object.keys(ft).reduce((p, c) => {    
        if (ft[c] < 12) p[c] = ft[c];
        return p;
      }, {});

    //of the remaining tracks, fine the shortest distance between 
    // the nearest available landmark or the end of the track.

    //return the first false landmark
    let chosenTrack = null;
    let lowestDistance = 99;
    for(let t in availableTracks) { 
        //iterate over a track that we aren't at the end of       
        let landMarkTrack = gamestate.automaState.landmarks[t];
        let closestLandMark = 12; //end of the track
        let cm = 0; //clost
        for ( cm = 0; cm < Object.keys(landMarkTrack).length; cm++) {
            if (landMarkTrack[cm].claimed === false) {                
                break;
            }
            else 
            {
                cm++;
            }
        }

        //if we got to the end of the landmarks and they were all claimed
        //then this track is the same as being at the end       
        switch (cm) {
            case 0:
                closestLandMark = 4;
                break;
            case 1:
                closestLandMark = 7;
                break;
            case 2:
                closestLandMark = 10;
                break;
        }        

        // get the lowest distance for this track and see if we beat any other tracks
        // f[t] == the current position on this track
        let currentDistance =  Math.min(12-ft[t], closestLandMark-ft[t]);    
        if ( ( currentDistance == lowestDistance && tiebreaker[t] < tiebreaker[chosenTrack]) || (currentDistance < lowestDistance ) )
        {
            lowestDistance = currentDistance;
            chosenTrack = t;
        }
    }

    return gamestate.advanceOnTrack(faction, chosenTrack);

    console.log(availableTracks);
}

function nonFinishedClosestToEnd(faction, decision) {
    let tiebreaker = getTrackTieBreaker(faction, decision);
    
    let obj = null;
    
    if (faction == gamestate.enumFaction.automa)
        obj = gamestate.automaState.tracks.automa;
    else 
        obj = gamestate.automaState.tracks.shadowempire;

    const max = Object.keys(obj).filter(x => {
             return obj[x] == Math.max.apply(null, Object.values(obj));    
            });

    let track = null;
    for(var propertyName in tiebreaker) {
        //convert the favorite track to a real track name
        track = tiebreaker[propertyName] === "favorite" ? gamestate.getFavoriteTrack(faction) : tiebreaker[propertyName];

        if (Object.keys(max).find(key => max[key] === track) && !gamestate.isTrackComplete(faction, track))
        {
            return gamestate.advanceOnTrack(faction, track);
            break;
        }
    }
}

function getTrackTieBreaker(faction, decision) {    
    const tracks = {science: decision.rightcard.science, military: decision.rightcard.military, exploration: decision.rightcard.exploration, technology: decision.rightcard.technology, favorite: decision.rightcard.favorite };
    let sortedTrack;

    switch(faction) {
        case gamestate.enumFaction.automa:
            sortedTrack = Object.keys(tracks).sort(function(a,b){return tracks[a]-tracks[b]});            
            break;
        case gamestate.enumFaction.shadowempire:
            sortedTrack = Object.keys(tracks).sort(function(a,b){return tracks[b]-tracks[a]});                        
            break;
    }

    console.log(sortedTrack); 
    return sortedTrack;
}