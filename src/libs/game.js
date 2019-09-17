import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './../aws-exports';
API.configure(awsconfig);
PubSub.configure(awsconfig);
import { getAutomaCard } from './../graphql/queries';

import IconFavorite from "./../assets/images/military.png";
import IconMilitary from "./../assets/images/military.png";
import IconExploration from "./../assets/images/exploration.png";
import IconScience from "./../assets/images/science.png";
import IconTechnology from "./../assets/images/technology.png";
import IconIncome from "./../assets/images/income.png";
import IconTopple from "./../assets/images/topple.png";



export const viewcards = document.getElementById("view-cards");
export const viewsetup = document.getElementById("view-setup");

const resultAutoma1 = document.getElementById("automaResult1");
const resultAutoma2 = document.getElementById("automaResult2");
const resultShadowEmpire1 = document.getElementById("shadowEmpireResult1");
const resultShadowEmpire2 = document.getElementById("shadowEmpireResult2");

export let automaState = { 
    era: 0,
    deck: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
    discard: [],
    hand: [],
};

export let automaStateHandler = {  
    get: function(target, name) {
        return target[name];
    },  
    set: function(target, prop, value) { 
      target[prop] = value;
      switch(prop) {
            case "era":      
                document.getElementById("era").innerHTML = value;
                break;
            case "hand":
                document.getElementById("progress").innerHTML = value.length || 0;
                break;
            case "discard":
                document.getElementById("discard").innerHTML = value.length || 0;
                break;
      }
      return true;
    }
  };
let proxyAutomaState = new Proxy(automaState, automaStateHandler);

function updateAutomaStateUI() {
    document.getElementById("progress").innerHTML = proxyAutomaState.hand.length;
    document.getElementById("discard").innerHTML = proxyAutomaState.discard.length;
}

function clearTurnResult() {
    resultAutoma2.innerHTML = "<div class='col text-center'>Click <strong>Take Automa Turn</strong>.</div>";
    resultShadowEmpire2.innerHTML = "<div class='col text-center'>Click <strong>Take Automa Turn</strong>.</div>";
}

export function startGame() {
    //starting hand is cards 1 through 7
    proxyAutomaState.hand = [1,2,3,4,5,6,7];

    // reset & shuffle the deck
    proxyAutomaState.deck = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
    shuffle(proxyAutomaState.deck);   

    // clear the discard pile
    proxyAutomaState.discard = [];

    //add one card to the automa hand to make it an even 8
    addToHand(1);    

    //shuffle the hand
    shuffle(proxyAutomaState.hand);

    //set the era
    proxyAutomaState.era = 1;

    updateAutomaStateUI();
    clearTurnResult();

    this.viewsetup.style.display = "none";
    this.viewcards.style.display = "";

    console.log("New Game");
    console.log(proxyAutomaState);    
}

// add cards to hand
export function addToHand(numCards) {    
    for(var i = 0; i < numCards; i++) {
        let card = proxyAutomaState.deck.pop();
        proxyAutomaState.hand.push(card);
    };
}

/// put the discard pile back into the 
export function createNewHandFromDiscard() {         
    while(proxyAutomaState.discard.length > 0) {
        let card = proxyAutomaState.discard.pop();
        proxyAutomaState.hand.push(card);
    };
}

//is it time for the automa to take an income turn?
export function isIncomeTurn() {
    var takeIncome = proxyAutomaState.hand.length === 0;

    if (takeIncome) {
        gameMessage("The Automa takes an Income Action. Score the Automa and then click the <strong>Take Automa Income</strong> button to start the next era.");
    }

    return takeIncome;
}

export function takeTurn() {
    if (!isIncomeTurn()) {
        
        //create a temporary hand that we can shuffle, lay down on the table, then stick them in the discard pile
        let tempHand = [];
        for(var i = 0; i < 2; i++) {
            let card = proxyAutomaState.hand.pop();
            tempHand.push(card);           
        };

        //shuffle the two drawn cards so we lay them down randomly
        shuffle(tempHand);

        //now add the cards into the dicard pile
        for(var i = 0; i < 2; i++) {
            let card = tempHand.pop();
            proxyAutomaState.discard.push(card);
            displayAutomaResult(card, i+1);
        };

        updateAutomaStateUI();

        console.log("Take Turn");
        console.log(proxyAutomaState);    
    }
}

export function confirmTakeIncome() {
    $('#modalConfirmIncome').modal("show");
}

export function takeIncome() {
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
export function gameMessage(message) {
    $(".modal-body", modalMessage).html(message);
    modalMessage.modal('show');
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

export function confirmNewGame() {
    $('#modalConfirmNewGame').modal("show");
}

export function doConfirmNewGame() {
    this.viewsetup.style.display = "";
    this.viewcards.style.display = "none";
}

async function displayAutomaResult(cardNum, position) {
    console.log("Drew card: " + cardNum);

    //TODO: Use the full 1-22
    if (parseInt(cardNum) > 8) cardNum = '1';
        
    API.graphql(graphqlOperation(getAutomaCard, { id: cardNum })).then((evt) => {

        let card = evt.data.getAutomaCard;

        if (position == 1) {
            resultAutoma1.innerHTML = `Furthest track with an available building`;
            resultShadowEmpire1.innerHTML = `Any track where it has not reached the end`;
        }

        if (position == 2) {             
            resultAutoma2.innerHTML = "";
            let htmlOut = "";
            if (card.favorite > 0) htmlOut += `<img src="${IconFavorite}" alt="favorite" class="order-${card.favorite}" />`;
            if (card.military > 0) htmlOut += `<img src="${IconMilitary}" alt="military" class="order-${card.military}" />`;
            if (card.science > 0) htmlOut += `<img src="${IconScience}" alt="science" class="order-${card.science}" />`;
            if (card.exploration > 0) htmlOut += `<img src="${IconExploration}" alt="exploration" class="order-${card.exploration}" />`;
            if (card.technology > 0) htmlOut += `<img src="${IconTechnology}" alt="technology" class="order-${card.technology}" />`;
            resultAutoma2.innerHTML = htmlOut;
            
            resultShadowEmpire2.innerHTML = "";
            //flexbox reverse so we get the opposite order of the automa
            htmlOut = `<div class="d-flex flex-row-reverse justify-content-between">`;
            if (card.favorite > 0) htmlOut += `<img src="${IconFavorite}" alt="favorite" class="order-${card.favorite}" />`;
            if (card.military > 0) htmlOut += `<img src="${IconMilitary}" alt="military" class="order-${card.military}" />`;
            if (card.science > 0) htmlOut += `<img src="${IconScience}" alt="science" class="order-${card.science}" />`;
            if (card.exploration > 0) htmlOut += `<img src="${IconExploration}" alt="exploration" class="order-${card.exploration}" />`;
            if (card.technology > 0) htmlOut += `<img src="${IconTechnology}" alt="technology" class="order-${card.technology}" />`;
            htmlOut += `</div>`;
            resultShadowEmpire2.innerHTML = htmlOut;
        }
    });
}

