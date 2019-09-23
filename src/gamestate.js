import * as dom from "./elems.js";
import * as dice from "./dice.js";

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
    tracks: {
        automa: {
            favorite: null,
            military: 0,
            exploration: 0,
            technology: 0,
            scient: 0,
        },
        shadowempire: {
            favorite: null,
            military: 0,
            exploration: 0,
            technology: 0,
            scient: 0,
        },
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

function getShadowEmpireFavoriteTrack() {
    return proxyAutomaState.tracks.shadowempire.favorite;    
}

export function setShadowEmpireInitialFavorite() {
    setShadowEmpireFavoriteTrack(dice.rollScience());
    while(getShadowEmpireFavoriteTrack().toLowerCase() == getAutomaFavoriteTrack().toLowerCase()) {
        setShadowEmpireFavoriteTrack(dice.rollScience());
    }
}

export function setShadowEmpireFavoriteTrack(fav) {
    proxyAutomaState.tracks.shadowempire.favorite = fav;
    app.gameMessage(`The Shadow Empire's favorite track is now: <strong>${fav}</strong>`);
}

export function getFavoriteTrack(faction) {
    if (faction.toLowerCase() == "automa") {
        return getAutomaFavoriteTrack();
    } else {
        return getShadowEmpireFavoriteTrack();
    }
}

function getAutomaFavoriteTrack() {
    return proxyAutomaState.tracks.automa.favorite;
}

export function setAutomaFavoriteTrack(fav) {
    proxyAutomaState.tracks.automa.favorite = fav;
    app.gameMessage("The Automa's favorite track is now: " + fav);
}

export function advanceOnTrack(faction, track) {
    eval("proxyAutomaState.tracks." + faction.toLowerCase() + "." + track.toLowerCase() + "++");    
    return `<div>${faction} advances one space on the <strong>${track.toUpperCase()}</strong> track.</div>`;
}

export function getDecisionPair() {
     //get the card pair
     let leftCard = app.getCardDetails(proxyAutomaState.currentCards[0]);     
     let rightCard = app.getCardDetails(proxyAutomaState.currentCards[1]);

     return {
         leftcard: leftCard,
         rightcard: rightCard,
     }
}

export function isTrackComplete(faction, track) {
    return eval("proxyAutomaState.tracks." + faction.toLowerCase() + "." + track.toLowerCase()) === 12; 
}