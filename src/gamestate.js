import * as dom from "./elems.js";
import * as dice from "./dice.js";
import { formatBoardState, drawClaimLandmark } from "./templates.js";
import * as helper from "./helper.js";


export const enumFaction = {
    automa: 'automa',
    shadowempire: 'shadowempire'
}

export const enumTrack = {
    science: 'science',
    military: 'military',
    technology: 'technology',
    exploration: 'exploration',
}

export const enumAutomaCivilization = {
    explorers: "explorers",
    conquerers: "conquerers",
    scientists: "scientists",
    engineers: "engineers",
}

export const enumDecisionTrack = {
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
    cleartech: "cleartech",
    physics: "physics",
    neuroscience: "neuroscience",
    quantumphysics: "quantumphysics",
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
        9: [enumBenefit.physics],
        10: [enumBenefit.neuroscience],
        11: [enumBenefit.quantumphysics],
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
    difficulty: 1,
    automaCivilization: null,
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
            case "automaCivilization":
                highlight("data-automa-civilization", value);
                break;
            case "difficulty":
                highlight("data-automa-difficulty", value);
                dom.setElementHtml(dom.automaLevel, value);
                break;            
      }
      return true;
    }
};

//setup a proxy handler to watch some variables
export const proxyAutomaState = new Proxy(automaState, automaStateHandler);

export let automaBoardHandler = {  
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

export let shadowBoardHandler = {  
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

export function getShadowEmpireFavoriteTrack() {
    return proxyAutomaState.favorites.shadowempire;    
}


//METHODS
export function getFactionLabel(faction) {
    switch(faction) {
        case enumFaction.automa:
            return `<img id="automa-meeple" src="images/meeple-red.png" alt="automa meeple" class="meeple-icon  mr-1" /> Automa`;
        case enumFaction.shadowempire:
            return `<img id="shadowempire-meeple" src="images/meeple-grey.png" alt="shadow empire meeple" class="meeple-icon mr-1" /> Shadow Empire`;
    }
}


export function setShadowEmpireInitialFavorite() {
    var roll = dice.rollScience();
    setShadowEmpireFavoriteTrack();
    while(roll == getAutomaFavoriteTrack().toLowerCase()) {
        roll = dice.rollScience();
    }
    setShadowEmpireFavoriteTrack(roll);
    app.gameMessage(`<div class="text-center">${getFactionLabel(enumFaction.shadowempire)}'s favorite track is now:</div> <div class="d-flex justify-content-center font-weight-bold mt-2">${helper.getTrackIcon(roll)} ${helper.snakeToCamel(roll)}</div>`);
}

export function setShadowEmpireFavoriteTrack(fav) {
    proxyAutomaState.favorites.shadowempire = fav;
    updateBoardInformation(enumFaction.shadowempire);    
}

export function getFavoriteTrack(faction) {
    if (faction.toLowerCase() == "automa") {
        return getAutomaFavoriteTrack();
    } else {
        return getShadowEmpireFavoriteTrack();
    }
}

export function getAutomaFavoriteTrack() {
    return proxyAutomaState.favorites.automa;
}

export function setAutomaFavoriteTrack(fav) {
    proxyAutomaState.favorites.automa = fav;
    updateBoardInformation(enumFaction.automa);    
}

export function advanceOnTrack(distance, faction, track, decision, nobenefit, scienceDie) {
    if (!isTrackComplete(faction, track)) {
        let trackPosition = 0;
        switch(faction) {
            case enumFaction.automa:            
                proxyAutomaBoard[track] += distance;
                trackPosition = proxyAutomaBoard[track];
                break;

            case enumFaction.shadowempire:
                proxyShadowEmpireBoard[track] += distance;
                trackPosition = proxyShadowEmpireBoard[track];           
                break;
        }

        let message = "";
        message += `<div class="text-center mt-4">${getFactionLabel(faction)} ${decision === -1 ? "regresses" : "advances"} 1 space on the</div> <div class="font-weight-bold text-center">${helper.getTrackIcon(track)} ${track.toUpperCase()} track${scienceDie ? " (Science Die)" : ""}.</div>`;

        if (faction === enumFaction.automa && nobenefit !== true) {           
            message += gainTrackBenefit(track, trackPosition, decision, faction);     
        }

        let setLandmarkClaim = checkForLandmarkClaim(trackPosition, track);
        if (setLandmarkClaim.length > 0) {
            message += `<div class="text-center mt-1 mb-4">${setLandmarkClaim}</div>`;
        }
    
        return message;
    }
    else {
        return `<div class="text-center">${getFactionLabel(faction)} has completed the <span class="font-weight-bold text-center">${helper.getTrackIcon(track)} ${track.toUpperCase()}</span> and does not advance.</div>`
    }
}

function gainTrackBenefit(track, position, decision, faction) {
    let benefits = trackBenefits[track][position];
    let benefitText = "";
    for(let b = 0; b < benefits.length; b++) {
        switch(benefits[b]) {            
            case enumBenefit.tapestrycard:
                benefitText += `<div class="text-center mt-1">&bull; The Automa gains 1 Tapestry card</div>`;                
                break;
            
            case enumBenefit.explore:
                benefitText +=  `<div class="text-center mt-1">&bull; The Automa <strong>Explores</strong>. <br/> <img src="images/conquer-tiebreaker-${decision.rightcard.conquertiebreaker}.png" alt="tiebreaker" /></div>`;
                break;

            case enumBenefit.conquer:
                let topple = decision.rightcard.topple ? " and Topples" : "";
                benefitText +=  `<div class="text-center mt-1">&bull; The Automa <strong>Conquers${topple}</strong>. <br/> <img src="images/conquer-tiebreaker-${decision.rightcard.conquertiebreaker}.png" alt="tiebreaker" /> ${decision.rightcard.topple ? '<img id="topple" src="images/topple.png" alt="topple" />' : ''}</div>`;
                break;

            case enumBenefit.sciencediex:
                let rollSciX = dice.rollScience();
                benefitText += advanceOnTrack(1, faction, rollSciX, decision, true, true);               
                break;

            case enumBenefit.sciencedie:
                let rollSci = dice.rollScience();
                benefitText += advanceOnTrack(1, faction, rollSci, decision, false, true);                
                break;

            case enumBenefit.cleartech:
                benefitText +=  `<div class="text-center mt-1">&bull; The Automa <strong>clears the Technology cards</strong>.</div>`;
                break;
            
            case enumBenefit.physics:
                let rollPhyics = dice.rollScienceDecision([enumDecisionTrack.military, enumDecisionTrack.technology, enumDecisionTrack.exploration]);
                benefitText += advanceOnTrack(1, faction, rollPhyics, decision, true, true);
                break;

            case enumBenefit.neuroscience:
                let rollNeuroScience = dice.rollScienceDecision([enumDecisionTrack.military, enumDecisionTrack.technology]);
                benefitText += advanceOnTrack(-1, faction, rollNeuroScience, decision, true, true);
                break;

            case enumBenefit.quantumphysics:
                for(let i = 0; i < 2; i++) {
                    let rollNeuroScience = dice.rollScienceDecision([enumDecisionTrack.military, enumDecisionTrack.technology, enumDecisionTrack.exploration]);
                    benefitText += advanceOnTrack(-1, faction, rollNeuroScience, decision, true, true);
                }
                break;
        }
    }       
    return benefitText;
}

function checkForLandmarkClaim(position, track) {
    let message = "";
    let landMarkPosition = 0;
    let isLandMarkPosition = false;
    let tier = "I";
    switch(position) {        
        case 4: landMarkPosition=0; isLandMarkPosition=true; tier = "II"; break;
        case 7: landMarkPosition=1; isLandMarkPosition=true; tier = "III"; break;
        case 10: landMarkPosition=2; isLandMarkPosition=true; tier = "IV"; break;
    } 
    //if this landmark has no yet been claimed, show a message to remind the user to go claim it
    if (isLandMarkPosition && !automaState.landmarks[track][landMarkPosition].claimed)
    {
        //check for landmark claim                 
        message += `<div><i class="fas fa-home mr-1"></i>The Automa claims the <b>Tier ${tier} ${helper.getTrackIcon(track)} ${track.toUpperCase()}</b> landmark.</div>`;
        automaState.landmarks[track][landMarkPosition].claimed = true;
    }
    return message;
}

export function getDecisionPair(incomeTurnDecision) {
    let leftCard = null;
    let rightCard = null;

    if (!incomeTurnDecision) {
        //get the card pair        
        leftCard = app.getCardDetails(proxyAutomaState.currentCards[0]);     
        rightCard = app.getCardDetails(proxyAutomaState.currentCards[1]);

        //fetch the last decision pair from the discard pile if we check
        //the decision pair and had already discarded it.
        if (proxyAutomaState.currentCards.length === 0) {
            leftCard = app.getCardDetails(proxyAutomaState.discard[1]);
            rightCard = app.getCardDetails(proxyAutomaState.discard[0]);
        }
    }
    else {
        //if the automa needs a tie breaker during an income turn,
        // use the latest tiebreaker card from the income turn
        // and draw the top card of the progress deck
        if (!proxyAutomaState.currentCards) {
            leftCard = app.getCardDetails(proxyAutomaState.discard[0])
        } else {
            leftCard = app.getCardDetails(proxyAutomaState.currentCards[0]);
        }
        rightCard = app.getCardDetails(proxyAutomaState.deck[0]);

        //then shuffle the progress deck
        app.shuffle(proxyAutomaState.deck);

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
    switch(faction) {
        case enumFaction.automa:
            return proxyAutomaBoard[track] === 12;
            break;
        case enumFaction.shadowempire:
            return proxyShadowEmpireBoard[track] === 12;
            break;
    }    
}

function updateBoardInformation(faction) {    
    switch (faction)
    {
        case enumFaction.automa:
            let automaBoardState = formatBoardState(proxyAutomaBoard, proxyAutomaState.favorites.automa);
            dom.setElementHtml(dom.automaBoard, automaBoardState);
            break;
        
        case enumFaction.shadowempire:
            let seBoardState = formatBoardState(proxyShadowEmpireBoard, proxyAutomaState.favorites.shadowempire)
            dom.setElementHtml(dom.shadowBoard, seBoardState);
            break;
    }
}

export function claimLandMark(landmark, target) {
    let track = landmark.split('|')[0];
    let building = landmark.split('|')[1];

    //toggle the claim
    proxyAutomaState.landmarks[track][building].claimed = !proxyAutomaState.landmarks[track][building].claimed;

    if (target) {        
        let modalHtml = drawClaimLandmark();
        let elemLandMarks = $('.modal-body', '#modalClaimLandmark');
        elemLandMarks.html(modalHtml);
    }

    console.log(`${proxyAutomaState.landmarks[track][building].claimed ? "" : "Un-"}Claim Landmark: ${proxyAutomaState.landmarks[track][building].name}`);
}

export function setAutomaCivilization(civilization) {
    let favorite = null;
    switch(civilization) {
        case enumAutomaCivilization.conquerers:
            favorite = enumTrack.military;
            break;
        case enumAutomaCivilization.scientists:
            favorite = enumTrack.science;
            break;
        case enumAutomaCivilization.explorers:
            favorite = enumTrack.exploration;
            break;
        case enumAutomaCivilization.engineers:
            favorite = enumTrack.technology;
            break;
    }

    setAutomaFavoriteTrack(favorite);
    proxyAutomaState.automaCivilization = civilization;
    console.log("Automa favorite track is: " + favorite);
}

export function getAutomaCivilization() {
    return proxyAutomaState.automaCivilization;
}

export function setAutomaDifficulty(level) {
    proxyAutomaState.difficulty = level;
    console.log("Automa difficulty is level " + level);
}

export function getAutomaDifficulty() {
    return parseInt(proxyAutomaState.difficulty);
}

function highlight(attribute, value) {
    let nodeList = document.querySelectorAll(`[${attribute}]`);
    for(let i=0; i < nodeList.length; i++) {
        let elem = nodeList[i];
        if (elem.getAttribute(attribute) === value) {
            elem.classList.add("selected-game-option");
        }
        else {
            elem.classList.remove("selected-game-option");
        }
    }
}

export function getEra() {
    return proxyAutomaState.era;
}

export function isSavedGameAvailable() {
    return localStorage.getItem('tapestryBotSaveGame') !== null && localStorage.getItem('tapestryBotSaveGame').length > 0;
}