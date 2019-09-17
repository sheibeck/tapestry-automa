import * as game from './libs/game';

document.getElementById('newgame').addEventListener('click', ()=>{
  game.confirmNewGame();
});

document.getElementById('newGameYes').addEventListener('click', ()=>{
  game.doConfirmNewGame();
});

document.getElementById('startgame').addEventListener('click', ()=>{
  game.startGame();
});

document.getElementById('takeincome').addEventListener('click', ()=>{
  game.confirmTakeIncome();  
});

document.getElementById('takeIncomeYes').addEventListener('click', ()=>{
  game.takeIncome();  
});

document.getElementById('taketurn').addEventListener('click', ()=>{
  game.takeTurn();  
});
