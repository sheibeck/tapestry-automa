import * as dom from "./elems.js";
import * as dice from "./dice.js";
import { formatBoardState } from "./templates.js";
import * as helper from "./helper.js";

export const enumFaction = {
    automa: 'automa',
    shadowempire: 'shadowempire'
}

export const enumTrack = {
    any: 'any',
    finish: 'finish',
    landmark: 'landmark',
}

const enumBenefit = {
    tapestrycard: "tapestrycard",
    explore: "explore",
    conquer: "conquer",
    sciencediex: "sciencediex",
    sciencedie: "sciencedie",
    cleartech: "cleartech"
}

const trackBenefits = {
    military: {
        0: [],
        1: [enumBenefit.conquer],
        2: [enumBenefit.tapestrycard],
        3: [enumBenefit.conquer],
        4: [],
        5: [enumBenefit.conquer],
        6: [enumBenefit.conquer, enumBenefit.tapestrycard],
        7: [enumBenefit.conquer],
        8: [enumBenefit.conquer],
        9: [],
        10: [],
        11: [],
        12: [enumBenefit.conquer]
    },
    science: {
        0: [],
        1: [enumBenefit.sciencediex],
        2: [enumBenefit.tapestrycard],
        3: [enumBenefit.sciencediex],
        4: [enumBenefit.tapestrycard],
        5: [enumBenefit.sciencedie],
        6: [enumBenefit.sciencedie],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [enumBenefit.sciencediex,enumBenefit.sciencediex,enumBenefit.sciencediex,enumBenefit.sciencediex,enumBenefit.sciencediex]
    },
    exploration: {
        0: [],       
        1: [],
        2: [enumBenefit.explore],
        3: [enumBenefit.explore],
        4: [enumBenefit.explore],
        5: [],
        6: [],
        7: [enumBenefit.explore],
        8: [],
        9: [enumBenefit.explore],
        10: [],
        11: [],
        12: []
    },
    technology: { 
        0: [],       
        1: [enumBenefit.cleartech],
        2: [enumBenefit.tapestrycard],
        3: [enumBenefit.cleartech],
        4: [enumBenefit.cleartech],
        5: [],
        6: [],
        7: [enumBenefit.cleartech],
        8: [],
        9: [],
        10: [],
        11: [],
        12: []
    },
}

//-------------------------------
// GAME STATE
//-------------------------------
export let automaState = { 
    era: 0,
    deck: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
    discard: [],
    hand: [],
    currentCards: [],
    gameStarted: false,
    isIncomeTurn: false,
    favorites: {
        automa: null,
        shadowempire: null,
    },
    tracks: {
        automa: {            
            military: 0,
            exploration: 0,
            technology: 0,
            science: 0,
        },
        shadowempire: {           
            military: 0,
            exploration: 0,
            technology: 0,
            science: 0,
        },
    },
    landmarks: {
        military : {
            0: { name: "Barracks", claimed: false },
            1: { name: "Tank Factory", claimed: false },
            2: { name: "Fusion Reactor", claimed: false },
        },
        science : {
            0: { name: "Apothecary", claimed: false },
            1: { name: "Academy", claimed: false},
            2: { name: "Laboratory", claimed: false },
        },
        exploration : {
            0: { name: "Lighthouse", claimed: false },
            1: { name: "Train Station", claimed: false },
            2: { name: "Launch Pad", claimed: false },
        },
        technology : {
            0: { name: "Forge", claimed: false },
            1: { name: "Rubber Works", claimed: false },
            2: { name: "Tech Hub", claimed: false },          
        }
    },
    gameReview: {
        era1: [],
        era2: [],
        era3: [],
        era4: [],
        era5: []
    }
};

//Handle the Game State
let automaStateHandler = {  
    get: function(target, name) {
        return target[name];
    },  
    set: function(target, prop, value) { 
      target[prop] = value;
      switch(prop) {
            case "era":      
                dom.setElementHtml(dom.era, value);
                break;
            case "hand":
                dom.setElementHtml(dom.progress, value.length || 0);
                break;
            case "discard":
                dom.setElementHtml(dom.discard, value.length || 0);
                break;
            case "gameStarted":
                dom.disableElement(dom.btnTakeTurn, !value);
                dom.disableElement(dom.btnConfirmTakeIncome, value);
                break;
            case "isIncomeTurn":
                dom.disableElement(dom.btnTakeTurn, value);
                dom.disableElement(dom.btnConfirmTakeIncome, !value);                
                break;          
      }
      return true;
    }
};

//setup a proxy handler to watch some variables
export const proxyAutomaState = new Proxy(automaState, automaStateHandler);


let automaBoardHandler = {  
    get: function(target, name) {
        return target[name];
    },  
    set: function(target, prop, value) {
      target[prop] = value;
      updateBoardInformation(enumFaction.automa);
      return true;
    }
};
export const proxyAutomaBoard = new Proxy(automaState.tracks.automa, automaBoardHandler);

let shadowBoardHandler = {  
    get: function(target, name) {
        return target[name];
    },  
    set: function(target, prop, value) {
      target[prop] = value;
      updateBoardInformation(enumFaction.shadowempire);
      return true;
    }
};
export const proxyShadowEmpireBoard = new Proxy(automaState.tracks.shadowempire, shadowBoardHandler);

function getShadowEmpireFavoriteTrack() {
    return proxyAutomaState.favorites.shadowempire;    
}


//METHODS

function getFactionLabel(faction) {
    switch(faction) {
        case enumFaction.automa:
            return `<img id="automa-meeple" src="images/meeple-red.png" alt="automa meeple" class="meeple-icon  mr-1" /> Automa`;
        case enumFaction.shadowempire:
            return `<img id="shadowempire-meeple" src="images/meeple-grey.png" alt="shadow empire meeple" class="meeple-icon mr-1" /> Shadow Empire`;
    }
}


export function setShadowEmpireInitialFavorite() {
    setShadowEmpireFavoriteTrack(dice.rollScience());
    while(getShadowEmpireFavoriteTrack().toLowerCase() == getAutomaFavoriteTrack().toLowerCase()) {
        setShadowEmpireFavoriteTrack(dice.rollScience());
    }
}

export function setShadowEmpireFavoriteTrack(fav) {
    proxyAutomaState.favorites.shadowempire = fav;
    updateBoardInformation(enumFaction.shadowempire);
    app.gameMessage(`The Shadow Empire's favorite track is now: <div class="d-flex justify-content-center font-weight-bold">${helper.getTrackIcon(fav)} ${helper.snakeToCamel(fav)}</div>`);
}

export function getFavoriteTrack(faction) {
    if (faction.toLowerCase() == "automa") {
        return getAutomaFavoriteTrack();
    } else {
        return getShadowEmpireFavoriteTrack();
    }
}

function getAutomaFavoriteTrack() {
    return proxyAutomaState.favorites.automa;
}

export function setAutomaFavoriteTrack(fav) {
    proxyAutomaState.favorites.automa = fav;
    updateBoardInformation(enumFaction.automa);
    app.gameMessage("The Automa's favorite track is now: " + fav);
}

export function advanceOnTrack(faction, track) {
    let trackPosition = 0;
    switch(faction) {
        case enumFaction.automa:
            proxyAutomaBoard[track]++;
            trackPosition = proxyAutomaBoard[track];
            break;

        case enumFaction.shadowempire:
            proxyShadowEmpireBoard[track]++;  
            trackPosition = proxyShadowEmpireBoard[track];           
            break;
    }
         
    let message = `<div class="text-center">${getFactionLabel(faction)} advances 1 space on the</div> <div class="font-weight-bold text-center">${helper.getTrackIcon(track)} ${track.toUpperCase()} track.</div>`;

    if (faction === enumFaction.automa) {
        message += gainTrackBenefit(track, trackPosition);
    }

    return message;
}

function gainTrackBenefit(track, position) {
    let benefits = trackBenefits[track][position];
    let message = `<div class="small text-center mb-4"><em>Benefits:</em> N/A`;

    let benefitText = "";
    for(let b = 0; b < benefits.length; b++) {
        switch(benefits[b]) {            
            case enumBenefit.tapestrycard:
                benefitText += "<div>The Automa gains 1 Tapestry card</div>";
                break;
            
            case enumBenefit.explore:
                benefitText +=  "<div>The Automa <strong>Explores</strong>.</div>";
                break;

            case enumBenefit.conquer:
                benefitText +=  "<div>The Automa <strong>Conquers</strong>.</div>";
                break;

            case enumBenefit.sciencediex:                
                let rollSciX = dice.rollScience();
                proxyAutomaBoard[rollSciX.toLowerCase]++;
                benefitText +=  `<div>The Automa advances 1 space on the ${helper.getTrackIcon(rollSciX)} <strong>${rollSciX.toUpperCase()}</strong> track with no benefit.</div>`;
                break;

            case enumBenefit.sciencedie:
                let rollSci = dice.rollScience();
                proxyAutomaBoard[rollSci.toLowerCase()]++;
                let rollPosition = proxyAutomaBoard[roll.toLowerCase()];
                let sciMessage = `<div>The Automa advances 1 space on the ${helper.getTrackIcon(rollSciX)} <strong> ${rollSci.toUpperCase()}</strong> track</div>`;
                gainTrackBenefit(rollSci.toLowerCase(), rollPosition);
                benefitText += sciMessage;
                break;

            case enumBenefit.cleartech:
                benefitText +=  "<div>The Automa <strong>clears the Technology cards</strong>.</div>";
                break;
            
        }
    }
    if (benefitText.length > 0) {
        message = message.replace("N/A", benefitText);
    }

    //check for landmark claim
    if (position == 4 || position == 7 || position == 10) {
        let tier = "I";
        switch(position) {
            case 4: tier = "II"; break;
            case 7: tier = "III"; ; break;
            case 12: tier = "IV"; break;
        }
        message += `<div>The Automa gains the Tier ${tier} ${helper.snakeToCamel(track)} landmark if it's available.</div>`;
    }

    message += "</div>";
    return message;
}

export function getDecisionPair(incomeTurnDecision) {
    let leftCard = null;
    let rightCard = null;

    if (!incomeTurnDecision) {
        //get the card pair
        leftCard = app.getCardDetails(proxyAutomaState.currentCards[0]);     
        rightCard = app.getCardDetails(proxyAutomaState.currentCards[1]);
    }
    else {
        //if the automa needs a tie breaker during an income turn,
        // use the latest tiebreaker card from the income turn
        // and draw the top card of the progress deck
        leftCard = app.getCardDetails(proxyAutomaState.currentCards[1]);
        rightCard = app.getCardDetails(proxyAutomaState.deck[0]);

        //then shuffle the progress deck
        app.shuffle(gamestate.proxyAutomaState.deck);

        console.log("Income turn decision pair:");        
        console.log(leftCard);
        console.log(rightCard);
    }

    return {
        leftcard: leftCard,
        rightcard: rightCard,
    }
}

export function isTrackComplete(faction, track) {
    return proxyAutomaState.tracks[faction][track] === 12; 
}

function updateBoardInformation(faction) {
    console.log(proxyAutomaState.tracks);
    switch (faction)
    {
        case enumFaction.automa:
            dom.setElementHtml(dom.automaBoard, formatBoardState(proxyAutomaState.tracks.automa, proxyAutomaState.favorites.automa));
            break;
        
        case enumFaction.shadowempire:
            dom.setElementHtml(dom.shadowBoard, formatBoardState(proxyAutomaState.tracks.shadowempire, proxyAutomaState.favorites.shadowempire));
            break;
    }
}

export function claimLandMark(landmark, target) {
    let track = landmark.split('|')[0];
    let building = landmark.split('|')[1];

    //toggle the claim
    proxyAutomaState.landmarks[track][building].claimed = !proxyAutomaState.landmarks[track][building].claimed;

    if (target) {            
        target.innerHTML = `${proxyAutomaState.landmarks[track][building].claimed ? "Un-" : ""}Claim ${proxyAutomaState.landmarks[track][building].name}`;
    }

    console.log(`${proxyAutomaState.landmarks[track][building].claimed ? "" : "Un-"}Claim Landmark: ${proxyAutomaState.landmarks[track][building].name}`);
}