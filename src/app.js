//initialize sentry so we can see any errors
import * as Sentry from '@sentry/browser';
Sentry.init({
    dsn: 'https://4ab621601e4c4b5da68ad015be899b4d@sentry.io/1731084',
    environment: process.env.NODE_ENV,
});

//-------------------------------
// IMPORTS
//-------------------------------
import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
API.configure(awsconfig);
PubSub.configure(awsconfig);
import { listAutomaCards } from './graphql/queries';
import * as asset from "./assets.js"
import * as dom from "./elems.js";
import * as templates from "./templates.js";
import * as decision from "./decision.js";
import * as gamestate from "./gamestate.js";

//-------------------------------
// LOAD CARD DATA
//-------------------------------
//get the card data from dynamodb
export let cardData = [{
        "id": "22",
        "favorite": 4,
        "military": 1,
        "science": 5,
        "exploration": 2,
        "technology": 3,
        "topple": true,
        "income": false,
        "conquertiebreaker": "n-se",
        "automatrack": "finish",
        "shadowtrack": "any"
    }, {
        "id": "18",
        "favorite": 1,
        "military": 3,
        "science": 4,
        "exploration": 2,
        "technology": 5,
        "topple": false,
        "income": false,
        "conquertiebreaker": "n-se",
        "automatrack": "landmark",
        "shadowtrack": "any"
    }, {
        "id": "16",
        "favorite": 3,
        "military": 5,
        "science": 4,
        "exploration": 2,
        "technology": 1,
        "topple": false,
        "income": true,
        "conquertiebreaker": "s-nw",
        "automatrack": "any",
        "shadowtrack": "landmark"
    }, {
        "id": "2",
        "favorite": 3,
        "military": 1,
        "science": 4,
        "exploration": 2,
        "technology": 5,
        "topple": false,
        "income": true,
        "conquertiebreaker": "e-nw",
        "automatrack": "any",
        "shadowtrack": "landmark"
    }, {
        "id": "13",
        "favorite": 4,
        "military": 3,
        "science": 1,
        "exploration": 5,
        "technology": 2,
        "topple": false,
        "income": false,
        "conquertiebreaker": "s-ne",
        "automatrack": "any",
        "shadowtrack": "landmark"
    }, {
        "id": "8",
        "favorite": 4,
        "military": 2,
        "science": 5,
        "exploration": 1,
        "technology": 3,
        "topple": false,
        "income": true,
        "conquertiebreaker": "s-ne",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "9",
        "favorite": 3,
        "military": 5,
        "science": 2,
        "exploration": 4,
        "technology": 1,
        "topple": true,
        "income": true,
        "conquertiebreaker": "se-n",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "1",
        "favorite": 1,
        "military": 2,
        "science": 5,
        "exploration": 3,
        "technology": 4,
        "topple": true,
        "income": true,
        "conquertiebreaker": "n-se",
        "automatrack": "finish",
        "shadowtrack": "any"
    }, {
        "id": "6",
        "favorite": 3,
        "military": 1,
        "science": 2,
        "exploration": 5,
        "technology": 4,
        "topple": true,
        "income": false,
        "conquertiebreaker": "n-se",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "5",
        "favorite": 5,
        "military": 2,
        "science": 4,
        "exploration": 1,
        "technology": 3,
        "topple": false,
        "income": false,
        "conquertiebreaker": "ne-s",
        "automatrack": "any",
        "shadowtrack": "landmark"
    }, {
        "id": "4",
        "favorite": 3,
        "military": 4,
        "science": 2,
        "exploration": 5,
        "technology": 1,
        "topple": false,
        "income": true,
        "conquertiebreaker": "ne-s",
        "automatrack": "landmark",
        "shadowtrack": "any"
    }, {
        "id": "19",
        "favorite": 5,
        "military": 1,
        "science": 3,
        "exploration": 4,
        "technology": 2,
        "topple": true,
        "income": true,
        "conquertiebreaker": "e-nw",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "7",
        "favorite": 1,
        "military": 4,
        "science": 5,
        "exploration": 3,
        "technology": 2,
        "topple": false,
        "income": false,
        "conquertiebreaker": "e-sw",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "11",
        "favorite": 1,
        "military": 3,
        "science": 4,
        "exploration": 2,
        "technology": 5,
        "topple": false,
        "income": false,
        "conquertiebreaker": "s-nw",
        "automatrack": "any",
        "shadowtrack": "landmark"
    }, {
        "id": "3",
        "favorite": 5,
        "military": 3,
        "science": 1,
        "exploration": 4,
        "technology": 2,
        "topple": true,
        "income": false,
        "conquertiebreaker": "n-se",
        "automatrack": "landmark",
        "shadowtrack": "finish"
    }, {
        "id": "20",
        "favorite": 5,
        "military": 4,
        "science": 3,
        "exploration": 2,
        "technology": 1,
        "topple": false,
        "income": false,
        "conquertiebreaker": "n-se",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "21",
        "favorite": 3,
        "military": 5,
        "science": 4,
        "exploration": 1,
        "technology": 2,
        "topple": true,
        "income": true,
        "conquertiebreaker": "ne-s",
        "automatrack": "any",
        "shadowtrack": "finish"
    }, {
        "id": "12",
        "favorite": 3,
        "military": 4,
        "science": 1,
        "exploration": 5,
        "technology": 2,
        "topple": true,
        "income": true,
        "conquertiebreaker": "w-se",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "17",
        "favorite": 2,
        "military": 4,
        "science": 5,
        "exploration": 1,
        "technology": 3,
        "topple": false,
        "income": true,
        "conquertiebreaker": "e-sw",
        "automatrack": "any",
        "shadowtrack": "any"
    }, {
        "id": "10",
        "favorite": 5,
        "military": 1,
        "science": 4,
        "exploration": 2,
        "technology": 3,
        "topple": true,
        "income": false,
        "conquertiebreaker": "sw-n",
        "automatrack": "landmark",
        "shadowtrack": "any"
    }, {
        "id": "15",
        "favorite": 1,
        "military": 2,
        "science": 5,
        "exploration": 4,
        "technology": 3,
        "topple": true,
        "income": false,
        "conquertiebreaker": "sw-n",
        "automatrack": "landmark",
        "shadowtrack": "landmark"
    }, {
        "id": "14",
        "favorite": 2,
        "military": 4,
        "science": 3,
        "exploration": 1,
        "technology": 5,
        "topple": true,
        "income": true,
        "conquertiebreaker": "se-n",
        "automatrack": "landmark",
        "shadowtrack": "any"
    }];


//-------------------------------
//PRIVATE METHODS
//-------------------------------

//a modal for handling game messages
const modalMessage = $("#modalGameMessage");
export function gameMessage(message) {
    $(".modal-body", modalMessage).html(message);
    modalMessage.modal('show');
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
                        
        gameMessage("The Automa takes an <strong>Early Income Turn</strong>. Score the Automa and then click the <strong>Take Automa Income</strong> button to start the next era.");    

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

        gameMessage("The Automa takes an <strong>Income Turn</strong>. Score the Automa and then click the <strong>Take Automa Income</strong> button to start the next era."); 
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
    if (gamestate.proxyAutomaState.era < 5) {
        $('#modalConfirmIncome').modal("show");
    }
    else {    
        discardPlayedCards();
        clearTurnResult();
        updateAutomaStateUI();  
        dom.setElementHtml(dom.resultAutoma2, `<div class='col text-center'>It's <em>game over</em> for the Automa!</div>`);
        gameMessage("Automa has completed its game");

        dom.disableElement(dom.btnTakeTurn, true);                
        dom.disableElement(dom.btnConfirmTakeIncome, false);
    }
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
        discardPlayedCards();
        
        //put the discard pile back into the hand and add 2 cards
        createNewHandFromDiscard();

        //add 2 cards to the automa deck
        addToHand(2);

        //shuffle the new deck
        shuffle(gamestate.proxyAutomaState.hand);        

        //increase the automa to the next era
        gamestate.proxyAutomaState.era++;

        clearTurnResult();
        updateAutomaStateUI();        

        //check for a new favorite track
        checkForNewFavorite();
    }

    //reset the app state so we know we are no longer in an income turn
    gamestate.proxyAutomaState.isIncomeTurn = false;

    //enable/disable buttons
    dom.disableElement(dom.btnTakeTurn, false);
    dom.disableElement(dom.btnConfirmTakeIncome, true);
}

function checkForNewFavorite() {
    if (gamestate.isTrackComplete(gamestate.enumFaction.automa, gamestate.getFavoriteTrack(gamestate.enumFaction.automa)))
    {
        setNewFavorite(faction);
    }

    if (gamestate.isTrackComplete(gamestate.enumFaction.shadowempire, gamestate.getFavoriteTrack(gamestate.enumFaction.shadowempire)))
    {
        setNewFavorite(faction);
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
    
    dom.showElement(dom.viewsetup, true);
    dom.showElement(dom.viewcards, false);

    dom.setElementHtml(dom.era, "&mdash;");
    dom.setElementHtml(dom.progress, "&mdash;");
    dom.setElementHtml(dom.discard, "&mdash;");
    
    clearTurnResult();

    dom.disableElement(dom.btnTakeTurn, true);
    dom.disableElement(dom.btnConfirmTakeIncome, true);  
    dom.disableElement(dom.btnClaimLandmark, true);
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
