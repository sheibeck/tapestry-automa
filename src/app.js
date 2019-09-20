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

//-------------------------------
// LOAD CARD DATA
//-------------------------------
//get the card data from dynamodb
export let cardData = null;
async function getCardData(cardNum, position) {    
    API.graphql(graphqlOperation(listAutomaCards, {limit: 100})).then((evt) => {
        cardData = evt.data.listAutomaCards.items;
    });
}
getCardData();


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
const proxyAutomaState = new Proxy(automaState, automaStateHandler);

//-------------------------------
//PRIVATE METHODS
//-------------------------------

//a modal for handling game messages
const modalMessage = $("#modalGameMessage");
function gameMessage(message) {
    $(".modal-body", modalMessage).html(message);
    modalMessage.modal('show');
}

function updateAutomaStateUI() {
    dom.setElementHtml(dom.progress, proxyAutomaState.hand.length);
    dom.setElementHtml(dom.discard, proxyAutomaState.discard.length);
    dom.setElementHtml(dom.currentCards, proxyAutomaState.currentCards.length > 0 ? `${proxyAutomaState.currentCards[0]}|${proxyAutomaState.currentCards[1]}` : "&mdash;");
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
        let card = proxyAutomaState.deck.pop();
        proxyAutomaState.hand.push(card);
    };
}

/// put the discard pile back into the 
function createNewHandFromDiscard() {

    //discard our current cards
    while(proxyAutomaState.currentCards.length > 0) {
        let card = proxyAutomaState.currentCards.pop();
        proxyAutomaState.discard.push(card);
    };

    while(proxyAutomaState.discard.length > 0) {
        let card = proxyAutomaState.discard.pop();
        proxyAutomaState.hand.push(card);
    };
}

//is it time for the automa to take an income turn?
function checkForEarlyIncomeTurn() {     
    // get the left card so we can see if it has the income symbol
    let leftcard = getCardDetails(proxyAutomaState.currentCards[0]);

    //If the decision deck is now empty and the track card has an income icon, the
    // bots take their income turn and you skip the last step of this procedure.
    if (proxyAutomaState.hand.length == 0 && leftcard.income == true) {               
        console.log("  TAKE EARLY INCOME");
        proxyAutomaState.isIncomeTurn = true;
        dom.disableElement(dom.btnTakeTurn, true);
        dom.disableElement(dom.btnConfirmTakeIncome, false);
                        
        gameMessage("The Automa takes an <strong>Early Income Turn</strong>. Score the Automa and then click the <strong>Take Automa Income</strong> button to start the next era.");    
    }
}

function discardPlayedCards() {
    //move the current cards into the discard pile        
    while(proxyAutomaState.currentCards.length > 0)
    {
        let card = proxyAutomaState.currentCards.pop();
        proxyAutomaState.discard.push(card);

        //update the game overview so we can see exactly which
        //cards were play in which order for each era
        switch(proxyAutomaState.era) {
            case 2:
                proxyAutomaState.gameReview.era2.push(card);
                break;
            case 3:
                proxyAutomaState.gameReview.era3.push(card);
                break;
            case 4:
                proxyAutomaState.gameReview.era4.push(card);
                break;
            case 5:
                proxyAutomaState.gameReview.era5.push(card);
                break;
        }
    };    
}

function drawCards(numCards) {
    for(let i = 0; i < numCards; i++) {
        let card = proxyAutomaState.hand.pop();
        proxyAutomaState.currentCards.push(card);
    };
}

function shuffle(array) {   
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

function getCardDetails(id) {
    //get the left card details
    let card = cardData.find(item => {
        return item.id == id;
    });

    return card;
}

function displayAutomaResult(cards) {
    //clear the last result
    clearTurnResult();

    //get the left card details
    let leftcard = getCardDetails(cards[0]);
    let rightcard = getCardDetails(cards[1]);

    //update the ui
    for(let position = 0; position < proxyAutomaState.currentCards.length; position++) {
        let card = proxyAutomaState.currentCards[position];
        
        switch (position)
        {
            case 0:
                dom.setElementHtml(dom.resultAutoma1, getTrackImage(leftcard.automatrack));
                dom.setElementHtml(dom.resultShadowEmpire, getTrackImage(leftcard.shadowtrack));
                break;

            default:
                
                dom.setElementHtml(dom.resultAutoma2, "");
                let htmlOut = "";
                if (rightcard.favorite > 0) htmlOut += `<img src="${asset.IconFavorite}" alt="favorite" class="mx-2 order-${rightcard.favorite}" />`;
                if (rightcard.military > 0) htmlOut += `<img src="${asset.IconMilitary}" alt="military" class="mx-2 order-${rightcard.military}" />`;
                if (rightcard.science > 0) htmlOut += `<img src="${asset.IconScience}" alt="science" class="mx-2 order-${rightcard.science}" />`;
                if (rightcard.exploration > 0) htmlOut += `<img src="${asset.IconExploration}" alt="exploration" class="mx-2 order-${rightcard.exploration}" />`;
                if (rightcard.technology > 0) htmlOut += `<img src="${asset.IconTechnology}" alt="technology" class="mx-2 order-${rightcard.technology}" />`;
                dom.setElementHtml(dom.resultAutoma2, htmlOut);

                dom.showElement(dom.incomeResult, leftcard.income ? true : false);
                dom.showElement(dom.toppleResult, rightcard.topple ? true : false);                
                dom.showElement(dom.conquerTieBreakerResult, true);
                dom.setImageSrc(dom.conquerTieBreakerResult, `images/conquer-tiebreaker-${rightcard.conquertiebreaker}.png`);                
        }
    }    
    updateAutomaStateUI();
}

function getTrackImage(type) {
    switch (type) {
        case "any":
            return `<img src="${asset.IconSquare}" class="track-icon" /> All non-finished tracks`;
            break;
        case "finish":
                return `<img src="${asset.IconFlag}" class="track-icon" /> Non-finished, closest to end`;
            break;
        case "landmark":
            return `<img src="${asset.IconHouse}" class="track-icon" /> Non-finished tracks, closest to landmark/end`;
            break;
    }
}

//-------------------------------
//PUBLIC METHODS
//-------------------------------
export function startGame() { 
    console.log("NEW GAME");

    proxyAutomaState.gameStarted = true;
    proxyAutomaState.isIncomeTurn = false;

    //choose colors for bots
    dom.setImageSrc(dom.meepleAutoma, asset.MeepleRed);
    dom.setImageSrc(dom.meepleShadowEmpire, asset.MeepleGrey);
    
    //starting hand is cards 1 through 7
    proxyAutomaState.hand = [1,2,3,4,5,6,7];

    // reset & shuffle the deck
    proxyAutomaState.deck = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
    shuffle(proxyAutomaState.deck);   

    // clear the discard pile
    proxyAutomaState.discard = [];
    
    // clear any current cards
    proxyAutomaState.currentCards = [];

    // clear the last game review 
    proxyAutomaState.gameReview = {
        era1: [],
        era2: [],
        era3: [],
        era4: [],
        era5: []
    };

    //add one card to the automa hand to make it an even 8
    addToHand(1);    

    //shuffle the hand
    shuffle(proxyAutomaState.hand);

    //set the era - the automa takes an income action as its first turn. So, technically
    // they will "start" in era 2 after taking income.
    proxyAutomaState.era = 2;
    updateAutomaStateUI();
    clearTurnResult();

    dom.showElement(dom.viewsetup, false);
    dom.showElement(dom.viewcards, true);
        
    gameMessage("<strong>Resolve an Income Turn</strong> for the Automa.<br/><small class='text-muted'>The Automa takes an income turn on its first turn just as a player would. Then the Automa advances to Era 2.</small>");
}

export function takeAutomaTurn() {
    console.log("TAKE TURN");

    console.log(" DISCARD");
    discardPlayedCards();
    
    //if we have no cards left to draw, this is a regular income turn
    if (proxyAutomaState.hand.length == 0) {
        console.log(" NO CARDS LEFT - INCOME TURN");
        proxyAutomaState.isIncomeTurn = true;
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
        shuffle(proxyAutomaState.currentCards);
        displayAutomaResult(proxyAutomaState.currentCards);        

        //we can have an early income turn
        checkForEarlyIncomeTurn();

        console.log(proxyAutomaState);
    }
}

export function confirmTakeIncome() {
    if (proxyAutomaState.era < 5) {
        $('#modalConfirmIncome').modal("show");
    }
    else {    
        discardPlayedCards();
        clearTurnResult();
        updateAutomaStateUI();  
        dom.setElementHtml(dom.resultAutoma2, `<div class='col text-center'>It's <em>game over</em> for the Automa!</div>`);
        gameMessage("Automa has completed its game");

        dom.disableElement(elems.btnTakeTurn, true);                
        dom.disableElement(dom.btnConfirmTakeIncome, false);
    }
}

export function takeIncomeTurn() {
    console.log("TAKE INCOME");

    discardPlayedCards();
    
    //put the discard pile back into the hand and add 2 cards
    createNewHandFromDiscard();

    //add 2 cards to the automa deck
    addToHand(2);

    //shuffle the new deck
    shuffle(proxyAutomaState.hand);        

    //increase the automa to the next era
    proxyAutomaState.era++;

    clearTurnResult();
    updateAutomaStateUI();

    //reset the app state so we know we are no longer in an income turn
    proxyAutomaState.isIncomeTurn = false;

    //enable/disable buttons
    dom.disableElement(dom.btnTakeTurn, false);
    dom.disableElement(dom.btnConfirmTakeIncome, true);    
}

export function setupNewGame() {
    proxyAutomaState.gameStarted = false;
    
    dom.showElement(dom.viewsetup, true);
    dom.showElement(dom.viewcards, false);

    dom.setElementHtml(dom.era, "&mdash;");
    dom.setElementHtml(dom.progress, "&mdash;");
    dom.setElementHtml(dom.discard, "&mdash;");
    
    clearTurnResult();

    dom.disableElement(dom.btnTakeTurn, true);
    dom.disableElement(dom.btnConfirmTakeIncome, true);  
}

export function showDiscardPile() {
    let message = `<div>Here is the current state of the discard pile: <br />`;
    
    var count = 0;
    proxyAutomaState.discard.forEach(element => {
        count++; //try to organize the card pairs
        let cardDetails = getCardDetails(element); 
        if (count == 1) message += `<div class="row flex-row-reverse mt-1">`;
        message += `<div class="card small bg-light col-6 order-1"><div class="card-body">
        <h5 class="card-title m-0">Card #${cardDetails.id}</h5>`;
        for (let key in cardDetails) {
            if (cardDetails.hasOwnProperty(key) && key !== "id") {
                message += `<p class="card-text m-0">${key}: ${cardDetails[key]}</p>`;
            }
        }
        message += `</div></div>`;

        if (count==2) {
            count = 0;
            message += `</div>`
        }
    });

    message += "</div>"

    gameMessage(message);
}

export function showGameReview() {
    let message = `<div>Here is a review of the current state of the game: <br />`;    

    for (let era in proxyAutomaState.gameReview) {
        message += `<h4>${era.toUpperCase()}</h4>`;

        var count = 0;
        proxyAutomaState.gameReview[era].forEach(element => {
            count++; //try to organize the card pairs
            let cardDetails = getCardDetails(element);
            
            if (count == 1) message += `<div class="row flex-row-reverse mt-1">`;
            message += `<div class="card small bg-light col-6 order-${count}"><div class="card-body">
            <h5 class="card-title m-0">Card #${cardDetails.id}</h5>`;
            
            for (let key in cardDetails) {                
                if (cardDetails.hasOwnProperty(key) && key !== "id") {
                    message += `<p class="card-text m-0">${key}: ${cardDetails[key]}</p>`;
                };               
            }
            message += `</div></div>`;

            if (count==2) {
                count = 0;
                message += `</div>`
            }
        })
    };
    message += "</div>"

    gameMessage(message);
}
