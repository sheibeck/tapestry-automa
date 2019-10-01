import runtime from 'serviceworker-webpack-plugin/lib/runtime';
//initialize sentry so we can see any errors
import * as Sentry from '@sentry/browser';

//-------------------------------
// IMPORTS
//-------------------------------
import * as asset from "./assets.js"
import * as dom from "./elems.js";
import * as templates from "./templates.js";
import * as decision from "./decision.js";
import * as gamestate from "./gamestate.js";
import * as dice from "./dice";
import { cardData } from "./data";
import * as helper from "./helper";

if ('serviceWorker' in navigator) {
    const registration = runtime.register();
}

Sentry.init({
    dsn: 'https://4ab621601e4c4b5da68ad015be899b4d@sentry.io/1731084',
    environment: process.env.NODE_ENV,
});

//-------------------------------
//PRIVATE METHODS
//-------------------------------

//a modal for handling game messages
let modalMessage;
export function gameMessage(message) {
    modalMessage = $("#modalGameMessage");
    $(".modal-body", modalMessage).html(message);
    modalMessage.modal({backdrop: 'static', keyboard: false});
}

function updateAutomaStateUI() {
    dom.setElementHtml(dom.progress, gamestate.proxyAutomaState.hand.length);
    dom.setElementHtml(dom.discard, gamestate.proxyAutomaState.discard.length);
    dom.setElementHtml(dom.currentCards, gamestate.proxyAutomaState.currentCards.length > 0 ? `${gamestate.proxyAutomaState.currentCards[0]}|${gamestate.proxyAutomaState.currentCards[1]}` : "&mdash;");
}

function clearTurnResult() {
    dom.setElementHtml(dom.resultAutoma2, "<div class='col text-center'>&mdash;</div>");
    dom.setElementHtml(dom.resultAutoma1,"");
    dom.setElementHtml(dom.resultShadowEmpire,"");
    dom.showElement(dom.toppleResult, false);
    dom.showElement(dom.incomeResult, false);
    dom.showElement(dom.conquerTieBreakerResult, false);
    dom.setElementHtml(dom.currentCards, "&mdash;");
}


// add cards to hand
function addToHand(numCards) { 
    console.log(`Adding ${numCards} to decision deck.`)   
    for(let i = 0; i < numCards; i++) {
        let card = gamestate.proxyAutomaState.deck.pop();
        gamestate.proxyAutomaState.hand.push(card);
    };
}

/// put the discard pile back into the 
function createNewHandFromDiscard() {

    //discard our current cards
    while(gamestate.proxyAutomaState.currentCards.length > 0) {
        let card = gamestate.proxyAutomaState.currentCards.pop();
        gamestate.proxyAutomaState.discard.push(card);
    };

    while(gamestate.proxyAutomaState.discard.length > 0) {
        let card = gamestate.proxyAutomaState.discard.pop();
        gamestate.proxyAutomaState.hand.push(card);
    };
}

//is it time for the automa to take an income turn?
function checkForEarlyIncomeTurn() {     
    // get the left card so we can see if it has the income symbol
    let leftcard = getCardDetails(gamestate.proxyAutomaState.currentCards[0]);

    //If the decision deck is now empty and the track card has an income icon, the
    // bots take their income turn and you skip the last step of this procedure.
    if (gamestate.proxyAutomaState.hand.length === 0 && leftcard.income) {               
        console.log("  TAKE EARLY INCOME");
        gamestate.proxyAutomaState.isIncomeTurn = true;
        dom.disableElement(dom.btnTakeTurn, true);
        dom.disableElement(dom.btnConfirmTakeIncome, false);
                        
        gameMessage("The Automa takes an <strong>Early Income Turn</strong>. Click the <strong>Income Turn</strong> button to start the next era.");    

        return true;
    }
}

function discardPlayedCards() {
    //move the current cards into the discard pile
    while(gamestate.proxyAutomaState.currentCards.length > 0)
    {
        let card = gamestate.proxyAutomaState.currentCards.pop();
        gamestate.proxyAutomaState.discard.push(card);

        //update the game overview so we can see exactly which
        //cards were play in which order for each era
        switch(gamestate.proxyAutomaState.era) {
            case 2:
                gamestate.proxyAutomaState.gameReview.era2.push(card);
                break;
            case 3:
                gamestate.proxyAutomaState.gameReview.era3.push(card);
                break;
            case 4:
                gamestate.proxyAutomaState.gameReview.era4.push(card);
                break;
            case 5:
                gamestate.proxyAutomaState.gameReview.era5.push(card);
                break;
        }
    };    
}

function drawCards(numCards) {
    for(let i = 0; i < numCards; i++) {
        let card = gamestate.proxyAutomaState.hand.pop();
        gamestate.proxyAutomaState.currentCards.push(card);
    };
}

export function shuffle(array) {   
    var currentIndex = array.length, temporaryValue, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    
    return array;     
}

export function getCardDetails(id) {
    //get the left card details
    let card = cardData.find(item => {
        return item.id == id;
    });

    return card;
}

function displayAutomaResult(cards) {    
    //clear the last result
    clearTurnResult();
   
    dom.setElementHtml(dom.resultAutoma1, getTrackImage(cards.leftcard.automatrack));
    dom.setElementHtml(dom.resultShadowEmpire, getTrackImage(cards.leftcard.shadowtrack));

    dom.setElementHtml(dom.resultAutoma2, "");
    let htmlOut = "";
    htmlOut += `<img src="${asset.IconFavorite}" alt="favorite" class="mx-2 order-${cards.rightcard.favorite}" />`;
    htmlOut += `<img src="${asset.IconMilitary}" alt="military" class="mx-2 order-${cards.rightcard.military}" />`;
    htmlOut += `<img src="${asset.IconScience}" alt="science" class="mx-2 order-${cards.rightcard.science}" />`;
    htmlOut += `<img src="${asset.IconExploration}" alt="exploration" class="mx-2 order-${cards.rightcard.exploration}" />`;
    htmlOut += `<img src="${asset.IconTechnology}" alt="technology" class="mx-2 order-${cards.rightcard.technology}" />`;
    dom.setElementHtml(dom.resultAutoma2, htmlOut);

    dom.showElement(dom.incomeResult, cards.leftcard.income ? true : false);
    dom.showElement(dom.toppleResult, cards.rightcard.topple ? true : false);                
    dom.showElement(dom.conquerTieBreakerResult, true);
    dom.setImageSrc(dom.conquerTieBreakerResult, `images/conquer-tiebreaker-${cards.rightcard.conquertiebreaker}.png`);                
  
    updateAutomaStateUI();
}

//-------------------------------
//PUBLIC METHODS
//-------------------------------

export function getTrackImage(type, hideText) {
    switch (type) {
        case "any":
            return `<img src="${asset.IconSquare}" class="track-icon" />${hideText ? "" : " All non-finished tracks"}`;
            break;
        case "finish":
                return `<img src="${asset.IconFlag}" class="track-icon" />${hideText ? "" : " Non-finished, closest to end"}`;
            break;
        case "landmark":
            return `<img src="${asset.IconHouse}" class="track-icon" />${hideText ? "" : " Non-finished tracks, closest to landmark/end"}`;
            break;
    }
}

export function startGame() { 
    if (!gamestate.getAutomaFavoriteTrack()) {
        gameMessage("Please choose an Automa civilization!");
        return;
    }

    console.log("NEW GAME");

    gamestate.proxyAutomaState.gameStarted = true;
    gamestate.proxyAutomaState.isIncomeTurn = true;

    //choose colors for bots
    dom.setImageSrc(dom.meepleAutoma, asset.MeepleRed);
    dom.setImageSrc(dom.meepleShadowEmpire, asset.MeepleGrey);
    
    //starting hand is cards 1 through 7
    gamestate.proxyAutomaState.hand = [1,2,3,4,5,6,7];

    // reset & shuffle the deck
    gamestate.proxyAutomaState.deck = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
    shuffle(gamestate.proxyAutomaState.deck);   

    // clear the discard pile
    gamestate.proxyAutomaState.discard = [];
    
    // clear any current cards
    gamestate.proxyAutomaState.currentCards = [];
    
    // reset the tracks
    gamestate.proxyAutomaBoard.military = 0;
    gamestate.proxyAutomaBoard.exploration = 0;
    gamestate.proxyAutomaBoard.technology = 0;
    gamestate.proxyAutomaBoard.science = 0;
     
    gamestate.proxyShadowEmpireBoard.military = 0;
    gamestate.proxyShadowEmpireBoard.exploration = 0;
    gamestate.proxyShadowEmpireBoard.technology = 0;
    gamestate.proxyShadowEmpireBoard.science = 0;   

    gamestate.proxyAutomaState.landmarks = {
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
    }

    // clear the last game review 
    gamestate.proxyAutomaState.gameReview = {
        era1: [],
        era2: [],
        era3: [],
        era4: [],
        era5: []
    };

    //add one card to the automa hand to make it an even 8
    addToHand(1);    

    //shuffle the hand
    shuffle(gamestate.proxyAutomaState.hand);

    //set the era - the automa takes an income action as its first turn. So, technically
    // they will "start" in era 2 after taking income.
    gamestate.proxyAutomaState.era = 1;    
    gamestate.setShadowEmpireInitialFavorite();
    updateAutomaStateUI();
    clearTurnResult();

    dom.disableElement(dom.btnClaimLandmark, false);

    dom.showElement(dom.viewsetup, false);
    dom.showElement(dom.viewcards, true);        
}

export function takeAutomaTurn() {
    console.log("TAKE TURN");

    console.log(" DISCARD");
    discardPlayedCards();
    
    //if we have no cards left to draw, this is a regular income turn
    if (gamestate.proxyAutomaState.hand.length == 0) {
        console.log(" NO CARDS LEFT - INCOME TURN");
        gamestate.proxyAutomaState.isIncomeTurn = true;
        clearTurnResult();
        updateAutomaStateUI();

        gameMessage("The Automa takes an <strong>Income Turn</strong>. Click the <strong>Income Turn</strong> button to start the next era."); 
        dom.disableElement(dom.btnTakeTurn, true);
        dom.disableElement(dom.btnConfirmTakeIncome, false);
    }
    else {
        console.log(" DRAW 2 CARDS");
        drawCards(2);        

        //shuffle the two drawn cards so we lay them down randomly
        shuffle(gamestate.proxyAutomaState.currentCards);
        displayAutomaResult(gamestate.getDecisionPair(false));

        console.log(gamestate.proxyAutomaState);

        //we can have an early income turn
        if (!checkForEarlyIncomeTurn()) {
            decision.advanceTracks();    
        }        
    }

}

export function confirmTakeIncome() {
    $('#modalConfirmIncome').modal("show");
}

export function takeIncomeTurn() {
    console.log("TAKE INCOME");

    //era 1 is income
    if (gamestate.proxyAutomaState.era === 1) 
    {
        gamestate.proxyAutomaState.era++;
        gameMessage(`<div class="text-center">${gamestate.getFactionLabel(gamestate.enumFaction.automa)} <strong>Gains 1 Tapestry card</strong>.</div>`);

    }
    else {
        //check for a new favorite track
        checkForNewFavorite();
    }

    //reset the app state so we know we are no longer in an income turn
    gamestate.proxyAutomaState.isIncomeTurn = false;

    //enable/disable buttons
    dom.disableElement(dom.btnTakeTurn, false);
    dom.disableElement(dom.btnConfirmTakeIncome, true);
}


export function continueIncomeTurn() {
    let message = "";
    message += `<div class="text-center">The Automa's favorite is :</div> <div class="d-flex justify-content-center font-weight-bold mt-2">${helper.getTrackIcon(gamestate.getAutomaFavoriteTrack())} ${gamestate.getAutomaFavoriteTrack().toUpperCase()}</div>`;
    message += `<div class="text-center mt-3">The Shadow Empires's favorite is :</div> <div class="d-flex justify-content-center font-weight-bold mt-2">${helper.getTrackIcon(gamestate.getShadowEmpireFavoriteTrack())} ${gamestate.getShadowEmpireFavoriteTrack().toUpperCase()}</div>`;
 
    //gain civilization bonus
    message += gainIncomeTurnAdvancement();

    //discard after income turn advancement because the advancement uses
    // the current set of cards displaying
    discardPlayedCards();

    //check for any civ bonuses and do it.
    message += gainIncomeTurnCivilizationBonus();
    
    //put the discard pile back into the hand and add 2 cards
    createNewHandFromDiscard();
    //add 2 cards to the automa deck
    var numCardsToAdd = 2;
    var automaDifficulty = gamestate.getAutomaDifficulty();
    if ( automaDifficulty === 4) {
        numCardsToAdd += 2;
    }
    addToHand(numCardsToAdd);

    //shuffle the new deck
    shuffle(gamestate.proxyAutomaState.hand); 

    if (gamestate.proxyAutomaState.era >= 5) {
        discardPlayedCards();
        
        dom.setElementHtml(dom.resultAutoma2, `<div class='col text-center'>It's <em>game over</em> for the Automa!</div>`);
        dom.disableElement(dom.btnTakeTurn, true);                
        dom.disableElement(dom.btnConfirmTakeIncome, true);
    }
    else {
        //increase the automa to the next era
        gamestate.proxyAutomaState.era++;  
        clearTurnResult();   
    }
    
    updateAutomaStateUI();  

    message += `<hr/> <h5 class="text-center">Scoring and Income</h5> <div class="text-center">${gamestate.getFactionLabel(gamestate.enumFaction.automa)} <strong>scores points</strong>.</div><div class="text-center">${gamestate.getFactionLabel(gamestate.enumFaction.automa)} <strong>Gains 1 Tapestry card</strong>.</div>`;
    gameMessage(message);   
}

function checkForNewFavorite() {
    if (gamestate.isTrackComplete(gamestate.enumFaction.automa, gamestate.getFavoriteTrack(gamestate.enumFaction.automa)))
    {
        setNewFavorite(gamestate.enumFaction.automa);
    }

    if (gamestate.isTrackComplete(gamestate.enumFaction.shadowempire, gamestate.getFavoriteTrack(gamestate.enumFaction.shadowempire)))
    {
        setNewFavorite(gamestate.enumFaction.shadowempire);
    }

    $('#modalNewFavorite').modal('show');
}

export function setNewFavorite(faction) {
    //choose a new favorite track;
    let newFavorite = decision.nonFinishedClosestToLandmarkOrEnd(faction, gamestate.getDecisionPair(true), true);    

    switch(faction) {
        case gamestate.enumFaction.automa:
            if (gamestate.getAutomaFavoriteTrack() !== newFavorite) {
                gamestate.setAutomaFavoriteTrack(newFavorite);
            }
            break;

        case gamestate.enumFaction.shadowempire:
            if (gamestate.getShadowEmpireFavoriteTrack() !== newFavorite) {
                gamestate.setShadowEmpireFavoriteTrack(newFavorite);
            }
            break;
    }
}

export function setupNewGame() {
    gamestate.proxyAutomaState.gameStarted = false;

    let roll = dice.rollScience();
    let civ = null;
    switch(roll) {       
        case gamestate.enumTrack.science:
            civ = gamestate.enumAutomaCivilization.conquerers;           
            break;
        case gamestate.enumTrack.military:
            civ = gamestate.enumAutomaCivilization.conquerers;           
            break;
        case gamestate.enumTrack.exploration:
            civ = gamestate.enumAutomaCivilization.explorers;           
            break;
        case gamestate.enumTrack.technology:
            civ = gamestate.enumAutomaCivilization.engineers;           
            break; 
    }
    gamestate.setAutomaCivilization(civ);
    
    dom.showElement(dom.viewsetup, true);
    dom.showElement(dom.viewcards, false);

    dom.setElementHtml(dom.era, "&mdash;");
    dom.setElementHtml(dom.progress, "&mdash;");
    dom.setElementHtml(dom.discard, "&mdash;");
    
    clearTurnResult();

    dom.disableElement(dom.btnTakeTurn, true);
    dom.disableElement(dom.btnConfirmTakeIncome, true);  
    dom.disableElement(dom.btnClaimLandmark, true);

    //if there is a saved game, show the resume button
    dom.showElement(dom.btnResumeGame, gamestate.isSavedGameAvailable());
}

export function showDiscardPile() {
    let message = `<div>Here is the current state of the discard pile: <br />`;
           
    for (let count = 0; count < gamestate.proxyAutomaState.discard.length; count++) {

        //get the card pair
        let leftCard = getCardDetails(gamestate.proxyAutomaState.discard[count]);
        count++; 
        let rightCard = getCardDetails(gamestate.proxyAutomaState.discard[count]);

        message += templates.formatCardLogPair(leftCard, rightCard);
    };
    message += "</div>"
    gameMessage(message);
}

export function showGameReview() {
    let message = `<div>Here is a review of the current state of the game: <br />`;    

    for (let era in gamestate.proxyAutomaState.gameReview) {
        message += `<h4>${era.toUpperCase()}</h4>`;        
        for (let count = 0; count < gamestate.proxyAutomaState.gameReview[era].length; count++) {

            //get the card pair
            let leftCard = getCardDetails(gamestate.proxyAutomaState.gameReview[era][count]);
            count++; 
            let rightCard = getCardDetails(gamestate.proxyAutomaState.gameReview[era][count]);

            message += templates.formatCardLogPair(leftCard, rightCard);
        };
    };
    message += "</div>"

    gameMessage(message);
}

function gainIncomeTurnAdvancement() {
    let message = "";   
    if (gamestate.getAutomaDifficulty() > 2) {
        message += "<h5 class='text-center'>Income Turn Advancement</h5>";
        for(let faction in gamestate.enumFaction) {
            for(let track in gamestate.enumTrack) {
                //use the current decision card pair
                message += gamestate.advanceOnTrack(1, faction, track, gamestate.getDecisionPair(true));            
            }
        }
    }

    return message ? `<hr /> ${message}` : "";
}

//gain any bonuses based on the civilization of the automa
function gainIncomeTurnCivilizationBonus() {    
    let message = "";
    if (gamestate.getAutomaDifficulty() > 1) {
        message += "<h5 class='text-center'>Civilization Bonus</h5>";
        switch(gamestate.getAutomaCivilization()) {       
            case gamestate.enumAutomaCivilization.conquerers:
                
                break;
            case gamestate.enumAutomaCivilization.scientists:
                switch(gamestate.getEra()) {
                    case 3:
                    case 4:
                    case 5:
                        let roll = dice.rollScience();
                        message += gamestate.advanceOnTrack(1, gamestate.enumFaction.automa, roll, gamestate.getDecisionPair(true), false, true);
                }
                break;
            case gamestate.enumAutomaCivilization.explorers:
                switch(gamestate.getEra()) {
                    case 2:
                    case 4:
                        message += gamestate.advanceOnTrack(1, gamestate.enumFaction.automa, gamestate.enumTrack.exploration, gamestate.getDecisionPair(true));
                        break;
                    case 3:
                    case 5:
                        message += gamestate.advanceOnTrack(1, gamestate.enumFaction.automa, gamestate.enumTrack.exploration, gamestate.getDecisionPair(true));                 
                        break;
                }
                break;
            case gamestate.enumAutomaCivilization.engineers:
            
                break;
        }
    }

    return message ? `<hr /> ${message}` : "";
}


export function saveGame() {    
    localStorage.setItem('tapestryBotSaveGame', JSON.stringify(gamestate.automaState)); 
    dom.showElement(dom.btnResumeGame, true);   
    
    helper.showUserMessage("Game Saved.");
}

export function resumeGame() {
    let restoredGameState = JSON.parse(localStorage.getItem('tapestryBotSaveGame'));

    //choose colors for bots
    dom.setImageSrc(dom.meepleAutoma, asset.MeepleRed);
    dom.setImageSrc(dom.meepleShadowEmpire, asset.MeepleGrey);

    //restore the old game over the current game state
    for(let propertyName in restoredGameState) {        
        gamestate.proxyAutomaState[propertyName] = restoredGameState[propertyName];
    }
    for(let propertyName in restoredGameState.tracks.automa) {
        gamestate.proxyAutomaBoard[propertyName] = restoredGameState.tracks.automa[propertyName];        
    }
    for(let propertyName in restoredGameState.tracks.shadowempire) {
        gamestate.proxyShadowEmpireBoard[propertyName] = restoredGameState.tracks.shadowempire[propertyName];        
    }

    updateAutomaStateUI();
    if (!gamestate.proxyAutomaState.isIncomeTurn) {
        displayAutomaResult(gamestate.getDecisionPair(false));
    }

    dom.disableElement(dom.btnClaimLandmark, false);
    dom.disableElement(dom.btnTakeTurn, gamestate.proxyAutomaState.isIncomeTurn);
    dom.disableElement(dom.btnConfirmTakeIncome, !gamestate.proxyAutomaState.isIncomeTurn);
    
    dom.showElement(dom.viewsetup, false);
    dom.showElement(dom.viewcards, true);

    helper.showUserMessage("Game Restored.");
}

if(!navigator.onLine){
    document.body.innerHTML = '<h2>Tapestry Bot requires an internet connection.</h2>'
} else {
    //INITIALIZE
    dom.initEvents();
    setupNewGame();

    var x = 1;
}