//initialize sentry so we can see any errors
import * as Sentry from '@sentry/browser';
Sentry.init({
    dsn: 'https://4ab621601e4c4b5da68ad015be899b4d@sentry.io/1731084',
    environment: process.env.NODE_ENV,
});

import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
API.configure(awsconfig);
PubSub.configure(awsconfig);
import { listAutomaCards } from './graphql/queries';

import IconFavorite from "./assets/images/favorite.png";
import IconMilitary from "./assets/images/military.png";
import IconExploration from "./assets/images/exploration.png";
import IconScience from "./assets/images/science.png";
import IconTechnology from "./assets/images/technology.png";
import IconIncome from "./assets/images/income.png";
import IconTopple from "./assets/images/topple.png";
import IconLeftArrow from "./assets/images/left-arrow.png";
import IconRightArrow from "./assets/images/right-arrow.png";
import IconFlag from "./assets/images/flag.png";
import IconHouse from "./assets/images/house.png";
import IconSquare from "./assets/images/square.png";
import IconBanner from "./assets/images/banner.png";

//conquer tie-breakers
import IconConquerTieBreakerENW from "./assets/images/conquer-tiebreaker-e-nw.png";
import IconConquerTieBreakerESW from "./assets/images/conquer-tiebreaker-e-sw.png";
import IconConquerTieBreakerNES from "./assets/images/conquer-tiebreaker-ne-s.png";
import IconConquerTieBreakerNSE from "./assets/images/conquer-tiebreaker-n-se.png";
import IconConquerTieBreakerNWS from "./assets/images/conquer-tiebreaker-nw-s.png";
import IconConquerTieBreakerSEN from "./assets/images/conquer-tiebreaker-se-n.png";
import IconConquerTieBreakerSNE from "./assets/images/conquer-tiebreaker-s-ne.png";
import IconConquerTieBreakerSNW from "./assets/images/conquer-tiebreaker-s-nw.png";
import IconConquerTieBreakerSWN from "./assets/images/conquer-tiebreaker-sw-n.png";
import IconConquerTieBreakerWSE from "./assets/images/conquer-tiebreaker-w-se.png";

//meeples
import MeepleBlue from "./assets/images/meeple-blue.png";
import MeepleYellow from "./assets/images/meeple-yellow.png";
import MeepleGreen from "./assets/images/meeple-green.png";
import MeepleRed from "./assets/images/meeple-red.png";
import MeepleGrey from "./assets/images/meeple-grey.png";


//vars
const viewcards = document.getElementById("view-cards");
const viewsetup = document.getElementById("view-setup");
const resultAutoma1 = document.getElementById("automaResult1");
const resultAutoma2 = document.getElementById("automaResult2");
const resultShadowEmpire = document.getElementById("shadowEmpireResult");
const incomeResult = document.getElementById("income");
const toppleResult = document.getElementById("topple");
const conquerTieBreakerResult = document.getElementById("conquer-tiebreaker");
const meepleAutoma = document.getElementById("automa-meeple");
const meepleShadowEmpire = document.getElementById("shadowempire-meeple");
const currentCards = document.getElementById("currentcards");
const progress = document.getElementById("progress");
const era = document.getElementById("era");
const discard = document.getElementById("discard");

//game state
let automaState = { 
    era: 0,
    deck: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
    discard: [],
    hand: [],
    currentCards: [],
    gamestarted: false,
};

//get the card data from dynamodb
export let cardData = null;
async function getCardData(cardNum, position) {
    console.log("Get Card Data");
    API.graphql(graphqlOperation(listAutomaCards, {limit: 100})).then((evt) => {
        cardData = evt.data.listAutomaCards.items;
    });
}
getCardData();

//events
document.getElementById('newgame').addEventListener('click', ()=>{
  confirmNewGame();
});

document.getElementById('newGameYes').addEventListener('click', ()=>{
  doConfirmNewGame();
});

document.getElementById('startgame').addEventListener('click', ()=>{
  startGame();
});

document.getElementById('takeincome').addEventListener('click', ()=>{
  confirmTakeIncome();  
});

document.getElementById('takeIncomeYes').addEventListener('click', ()=>{
  takeIncome();  
});

document.getElementById('taketurn').addEventListener('click', ()=>{
  takeTurn();  
});

//methods
let automaStateHandler = {  
    get: function(target, name) {
        return target[name];
    },  
    set: function(target, prop, value) { 
      target[prop] = value;
      switch(prop) {
            case "era":      
                era.innerHTML = value;
                break;
            case "hand":
                progress.innerHTML = value.length || 0;
                break;
            case "discard":
                discard.innerHTML = value.length || 0;
                break;
            case "gamestarted":
                document.getElementById('taketurn').disabled = !value;
                document.getElementById('takeincome').disabled = !value;
                break;
      }
      return true;
    }
};

let proxyAutomaState = new Proxy(automaState, automaStateHandler);

function updateAutomaStateUI() {
    document.getElementById("progress").innerHTML = proxyAutomaState.hand.length;
    document.getElementById("discard").innerHTML = proxyAutomaState.discard.length;
    currentCards.innerHTML = proxyAutomaState.currentCards.length > 0 ? `${proxyAutomaState.currentCards[0]}|${proxyAutomaState.currentCards[1]}` : "&mdash;";
}

function clearTurnResult() {
    resultAutoma2.innerHTML = "<div class='col text-center'>Click <strong>Take Automa Turn</strong>.</div>";
    resultAutoma1.innerHTML = "";
    resultShadowEmpire.innerHTML = "";
    toppleResult.style.display = "none";
    incomeResult.style.display = "none";
    conquerTieBreakerResult.style.display = "none";
    currentCards.innerHTML = "&mdash;";
}

const meeples = [
    MeepleBlue,
    MeepleRed,
    MeepleYellow,
    MeepleGreen,
    MeepleGrey,
  ];
      
function colorPicker() {    
    return meeples.splice(parseInt(Math.random() * meeples.length), 1)[0];
}

function startGame() {  
    proxyAutomaState.gamestarted = true;

    //choose colors for bots
    meepleAutoma.src = colorPicker();
    meepleShadowEmpire.src = colorPicker();

    //starting hand is cards 1 through 7
    proxyAutomaState.hand = [1,2,3,4,5,6,7];

    // reset & shuffle the deck
    proxyAutomaState.deck = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
    shuffle(proxyAutomaState.deck);   

    // clear the discard pile
    proxyAutomaState.discard = [];
    // clear any current cards
    proxyAutomaState.currentCards = [];

    //add one card to the automa hand to make it an even 8
    addToHand(1);    

    //shuffle the hand
    shuffle(proxyAutomaState.hand);

    //set the era
    proxyAutomaState.era = 1;

    updateAutomaStateUI();
    clearTurnResult();

    viewsetup.style.display = "none";
    viewcards.style.display = "";

    console.log("New Game");
    console.log(proxyAutomaState);    
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
function isIncomeTurn() {
    //if there are no cards left in the deck when we try to draw 
    // OR if there are 2 cards left to draw but one of the current set shows Take Income
    // then this is an income turn;
    let leftcard = cardData.find(item => {
        return item.id == proxyAutomaState.currentCards[0];
    });
    var takeIncome = proxyAutomaState.hand.length === 0 || (proxyAutomaState.hand.length === 2 && leftcard.income);

    if (takeIncome) {
        gameMessage("The Automa takes an Income Action. Score the Automa and then click the <strong>Take Automa Income</strong> button to start the next era.");
    }

    return takeIncome;
}

function takeTurn() {
    if (!isIncomeTurn()) {
        
        //move the current cards into the discard pile        
        while(proxyAutomaState.currentCards.length > 0)
        {
            let card = proxyAutomaState.currentCards.pop();
            proxyAutomaState.discard.push(card);
        };

        //play 2 new cards
        const cardsToPlay = 2;
        for(let i = 0; i < cardsToPlay; i++) {
            let card = proxyAutomaState.hand.pop();
            proxyAutomaState.currentCards.push(card);
        };

        //shuffle the two drawn cards so we lay them down randomly
        shuffle(proxyAutomaState.currentCards);
        displayAutomaResult(proxyAutomaState.currentCards);

        updateAutomaStateUI();

        console.log("Take Turn");
        console.log(proxyAutomaState);    
    }
}

function confirmTakeIncome() {
    if (proxyAutomaState.era < 5) {
        $('#modalConfirmIncome').modal("show");
    }
    else {
        gameMessage("Automa has completed it's game");
    }
}

function takeIncome() {
    //increase the automa to the next era
    proxyAutomaState.era++;

    //discard the remaining cards if any exist. The automa can sometimes
    //take an income action before its hand is fully empty
    while (proxyAutomaState.hand.length > 0) {
        let card = proxyAutomaState.hand.pop();
        proxyAutomaState.discard.push(card);
    }    
    
    //put the discard pile back into the hand and add 2 cards
    createNewHandFromDiscard();

    //add 2 cards to the automa deck
    addToHand(2);

    //shuffle the new deck
    shuffle(proxyAutomaState.hand);        

    updateAutomaStateUI();

    clearTurnResult();
    
    console.log("Take Income");
    console.log(proxyAutomaState);       
}

let modalMessage = $("#modalGameMessage")
function gameMessage(message) {
    $(".modal-body", modalMessage).html(message);
    modalMessage.modal('show');
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

function confirmNewGame() {
    $('#modalConfirmNewGame').modal("show");
}

function doConfirmNewGame() {
    proxyAutomaState.gamestarted = false;
    viewsetup.style.display = "";
    viewcards.style.display = "none";
    era.innerHTML = "&mdash;";
    progress.innerHTML = "&mdash;";
    discard.innerHTML = "&mdash;";
    clearTurnResult();
}

async function displayAutomaResult(cards) {
    console.log("Display Automa Result");   

    //get the left card details
    let leftcard = cardData.find(item => {
        return item.id == cards[0];
    });

    //get the right card details
    let rightcard = cardData.find(item => {
        return item.id == cards[1];
    });

    //update the ui
    for(let position = 0; position < proxyAutomaState.currentCards.length; position++) {
        let card = proxyAutomaState.currentCards[position];
        
        switch (position)
        {
            case 0:
                resultAutoma1.innerHTML = getTrackImage(leftcard.automatrack);
                resultShadowEmpire.innerHTML = getTrackImage(leftcard.shadowtrack);
                break;

            default:
                
                resultAutoma2.innerHTML = "";
                let htmlOut = "";
                if (rightcard.favorite > 0) htmlOut += `<img src="${IconFavorite}" alt="favorite" class="mx-2 order-${rightcard.favorite}" />`;
                if (rightcard.military > 0) htmlOut += `<img src="${IconMilitary}" alt="military" class="mx-2 order-${rightcard.military}" />`;
                if (rightcard.science > 0) htmlOut += `<img src="${IconScience}" alt="science" class="mx-2 order-${rightcard.science}" />`;
                if (rightcard.exploration > 0) htmlOut += `<img src="${IconExploration}" alt="exploration" class="mx-2 order-${rightcard.exploration}" />`;
                if (rightcard.technology > 0) htmlOut += `<img src="${IconTechnology}" alt="technology" class="mx-2 order-${rightcard.technology}" />`;
                resultAutoma2.innerHTML = htmlOut;                           

                incomeResult.style.display = leftcard.income ? "" : "none";
                toppleResult.style.display = rightcard.topple ? "" : "none";
                conquerTieBreakerResult.style.display = "";
                conquerTieBreakerResult.src = `images/conquer-tiebreaker-${rightcard.conquertiebreaker}.png`;
        }
    }    

    function getTrackImage(type) {
        switch (type) {
            case "any":
                return `<img src="${IconSquare}" class="track-icon" /> All non-finished tracks`;
                break;
            case "finish":
                    return `<img src="${IconFlag}" class="track-icon" /> Non-finished, closest to end`;
                break;
            case "landmark":
                return `<img src="${IconHouse}" class="track-icon" /> Non-finished tracks, closest to landmark/end`;
                break;
        }
    }
}
