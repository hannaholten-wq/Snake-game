"use strict"; 

import { TBait } from "./bait.js"; // Importerer TBait-klassen fra bait.js-filen
import { TSnakeHead, TSnakeBody, TSnakeTail } from "./snake.js"; // Importerer TSnakeHead, TSnakeBody, og TSnakeTail-klassene fra snake.js-filen
import { TSprite, TSpriteButton , TSpriteNumber } from "../lib/libSprite.js";
import { TSinesWave } from "../lib/lib2D.js";

//-----------------------------------------------------------------------------------------
//----------- variables and object --------------------------------------------------------
//-----------------------------------------------------------------------------------------

//her har vi koordinantene:)
//endret home-spritens verdier for de var like som home.
export const SheetData = {
  Head: { x: 0, y: 0, width: 38, height: 38, count: 4 },
  Body: { x: 0, y: 38, width: 38, height: 38, count: 6 },
  Tail: { x: 0, y: 76, width: 38, height: 38, count: 4 },
  Bait: { x: 0, y: 114, width: 38, height: 38, count: 1 },
  Play: { x: 0, y: 155, width: 202, height: 202, count: 10 },
  Retry: { x: 614, y: 995, width: 169, height: 167, count: 1 },
  Resume: { x: 0, y: 357, width: 202, height: 202, count: 2 },
  Home: { x: 65, y: 995, width: 169, height: 167, count: 1 },
  Number: { x: 0, y: 560, width: 81, height: 86, count: 10 },
  GameOver: { x: 0, y: 647, width: 856, height: 580, count: 1 },
};


//gameprops:)
//refererer til slangen, eplene, alle knapper, navn på bilder/sprites osv.
const GameProps = {
  snake: null,
  bait: null,
  resumeBtn: null,
  play: null,
  gameOver: null,
  home: null,
  retry: null,
  numberSec: [],  
  numberScore: [], 
  numberDefeat: [],
  newBodypart: null,     

};

//Eksporterte variabler:)
//inkluderer objekter og grupper for spillbrettets størrelse og faste verdier for celler, retninger og spillstatus.
//Let variabler for gamestatus når spillet begynner, canvas og bilde-spritesheeten.
//export const sprites = SheetData;
export const gameBoardSize = { cols: 24, rows: 18 };
export const EDirection = { Up: 0, Right: 1, Left: 2, Down: 3 };
export const EBoardCellInfoType = { Empty: 0, Snake: 1, Bait: 2 };
export const EGameStatus = { New: 0, Running: 1, Pause: 2, GameOver: 3 }; 
export const gameProps = GameProps; 
export let cvs = null;                     
export let ctx = null;                     
export let gameBoard = null;               
export let gameStatus = EGameStatus.New;   
export let imgSheet = null;                

//Variabler:)
//slangens hastighet og spillets oppdateringsmekanikk
let snakeSpeed = 4;

let hndUpdateGame = null; 



//kolonner og rader for cellene
export function TBoardCell(aCol, aRow) {
  this.col = aCol;
  this.row = aRow;
}

//starter med en tom celle med retning mot høyre:)
export function TBoardCellInfo() {
  this.direction = EDirection.Right;
  this.infoType = EBoardCellInfoType.Empty; 
}


//---------------------------- Classes ----------------------------------------------------

//Lager klasser, og bestemmer at det er fungerende knapper som kan trykkes på, eller tall.
export function TGameSprites() { 
  this.resumeBtn = new TSpriteButton(cvs, imgSheet, SheetData.Resume, { x: 360, y: 230 }, buttonClick);
  this.retry = new TSpriteButton(cvs, imgSheet, SheetData.Retry, { x: 644, y: 386 }, buttonClick);
  this.numberSec = new TSpriteNumber(cvs, imgSheet, SheetData.Number, { x: 145, y: 25 });
  this.gameOver = new TSprite(cvs, imgSheet, SheetData.GameOver, { x: 30, y: 40 },);
  this.home = new TSpriteButton(cvs, imgSheet, SheetData.Home, { x: 94, y: 386 }, buttonClick);
  this.play = new TSpriteButton(cvs, imgSheet, SheetData.Play, { x: 360, y: 230 }, buttonClick);
  this.numberScore = new TSpriteNumber(cvs, imgSheet, SheetData.Number, { x: 750, y: 25 });
  this.numberDefeat = new TSpriteNumber(cvs, imgSheet, SheetData.Number, {x: 689, y: 249});

  //setter ned opacity(gjennomsiktighet) på tallene til 50
  this.numberSec.setAlpha(50); 
  this.numberScore.setAlpha(50); 
}
//-----------------------------------------------------------------------------------------
//----------- functions -------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

//Funksjon som oppretter spillvinduet ved å sette opp spillets objekter og initialisere varibalene før spillets start.
function loadGame() {
  cvs = document.getElementById("cvs");
  cvs.width = gameBoardSize.cols * SheetData.Head.width;
  cvs.height = gameBoardSize.rows * SheetData.Head.height; 
  ctx = cvs.getContext("2d");

  gameProps.play = new TGameSprites().play;
  gameProps.resumeBtn = new TGameSprites().resumeBtn;
  gameProps.gameOver = new TGameSprites().gameOver;
  gameProps.home = new TGameSprites().home;
  gameProps.retry = new TGameSprites().retry;
  gameProps.numberSec = new TGameSprites().numberSec;
  gameProps.numberScore = new TGameSprites().numberScore;
  gameProps.numberDefeat = new TGameSprites().numberDefeat;
  gameProps.numberSec.setValue(100);

  gameStatus = EGameStatus.New;

//starter animasjonssyklusen for å utvikle spillet
  requestAnimationFrame(drawGame);
  console.log("Game canvas is rendering!");
}
//-----------------------------------------------------------------------------------------

//Funksjon som starter et nytt spill, ved å endre GameStatus til New, og stopper evt tidligere oppdateringer. 
function newGame() {
  gameStatus = EGameStatus.New;


  if (hndUpdateGame) {
    clearInterval(hndUpdateGame);
  }


  snakeSpeed = 4;
  hndUpdateGame = setInterval(updateGame, 500 / snakeSpeed);


//En array/tabell for spillets brett, og fyller det med tomme kolonner og rader (celler).
  gameBoard = [];
  for (let i = 0; i < gameBoardSize.rows; i++) {
    const row = [];
    for (let j = 0; j < gameBoardSize.cols; j++) {
      row.push(new TBoardCellInfo());
    }
    gameBoard.push(row);
  }

//Oppretter slangens hode, kropp og hale på spillbrettet, og legger de til i gameProps-tabellen. 
//Oppretter også eplet på en bestemt pos på brettet. 
  gameProps.snake = [];
  let newSnakeElement = new TSnakeHead(new TBoardCell(2, 10));
  gameProps.snake.push(newSnakeElement);
  newSnakeElement = new TSnakeBody(new TBoardCell(1, 10));
  gameProps.snake.push(newSnakeElement);
  newSnakeElement = new TSnakeTail(new TBoardCell(0, 10));
  gameProps.snake.push(newSnakeElement);

  gameProps.bait = new TBait(new TBoardCell(5, 10));

  console.log("Game update sequence is running!");
}







//Funksjon som tegner spillobjektene på brettet, både om spillet er i running eller pause. 
function drawGame() {

  ctx.clearRect(0, 0, cvs.width, cvs.height);
  if (gameStatus === EGameStatus.Running || gameStatus === EGameStatus.Pause) {
    for (let i = 0; i < gameProps.snake.length; i++) {
      gameProps.snake[i].draw();
    }
  }

//Switch som sjekker gamestatus, case er de mulige gamestatusene vi har.
//Switch er mer oversiktlig enn mange if-setninger.
//det under hver gamestatus, er det som blir tegnet når spillet er i den gamestatusen.
  switch (gameStatus) {

    case EGameStatus.GameOver:
      gameProps.gameOver.draw();
      gameProps.home.draw();
      gameProps.retry.draw();
      gameProps.numberDefeat.draw();
      break;

    case EGameStatus.New:
      gameProps.play.draw();
      break;

    case EGameStatus.Running:
      gameProps.numberSec.draw();
      gameProps.numberScore.draw();
      for (let i = 0; i < gameProps.snake.length; i++) {
        gameProps.snake[i].draw();
      }
      if (gameProps.bait) {
        gameProps.bait.draw();
      }
      break;

    case EGameStatus.Pause:
      
      for (let i = 0; i < gameProps.snake.length; i++) {
        gameProps.snake[i].draw();
      }
      if (gameProps.bait) {
        gameProps.bait.draw();
      }
      gameProps.resumeBtn.draw();
      gameProps.numberSec.draw();
      gameProps.numberScore.draw();
      
      break;

  }
  requestAnimationFrame(drawGame);
}


//-----------------------------------------------------------------------------------------

//Funksjon som oppdaterer spillet, og sjekker om slangen har kollidert.
//Om slangen har kollidert med enten seg selv eller kantene av brettet, avsluttes spillet.
function updateGame() {
  for (let i = 0; i < gameProps.snake.length; i++) {
    const snakeElement = gameProps.snake[i];
    if (snakeElement === gameProps.snake[0]) {
      if (gameProps.snake[0].checkCollision()) {
        gameStatus = EGameStatus.GameOver;
        break;
      }
    }
    snakeElement.update();
  }
  if(gameProps.newBodypart){
    gameProps.snake.splice(gameProps.snake.length - 1 , 0, gameProps.newBodypart);
    gameProps.newBodypart = null; 
  }
}


//-----------------------------------------------------------------------------------------

//Funksjon som sier at om slangen treffer seg selv så er det gameover.
export function snakeSelfCollision(){
  gameStatus = EGameStatus.GameOver;
}


//-----------------------------------------------------------------------------------------

//Funksjon som oppdaterer spillet med slangens nye, økte hastighet, og stopper det gamle intervallet.
//høyere fart betyr at intervallene mellom hastighetsskiftene/opdateringene blir kortere.
export function gainSpeed() {
  snakeSpeed += 1;
  clearInterval(hndUpdateGame);
//Lag en if test og skjekk hva scoren er, 
  const newInterval = 1000 / snakeSpeed;
  hndUpdateGame = setInterval(updateGame, newInterval);
}
//-----------------------------------------------------------------------------------------
//----------- Events ----------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

//Funksjon som initialiserer spillet ved å laste in sprites/bilder.
//Har også en "event listener" som følger med på tastetrykk. 
export function init() {
  console.log("Initializing the game");
  imgSheet = new Image();
  imgSheet.addEventListener("load", imgSheetLoad);
  imgSheet.addEventListener("error", imgSheetError);
  imgSheet.src = "./media/spriteSheet.png";

  document.addEventListener("keydown", keydown);
}
//-----------------------------------------------------------------------------------------

//Melding i konsollen for å indikere om spritesheeten er lastet inn, og sjekker spillet initialisering.
function imgSheetLoad() {
  console.log("Sprite Sheet is loaded, game is ready to start!");
  loadGame();
}
//-----------------------------------------------------------------------------------------

//Melding i konsollen for det motsatte --> altså om det evt har oppstått feil ved initialisering av spillet og innlastningen av spritesheeten.
//(i tillegg er det lagt til en event-target som gjør det lettere å finne kilden til feilen).
function imgSheetError(aEvent) {
  console.log("Error loading Sprite Sheet!", aEvent.target.src);
}
//-----------------------------------------------------------------------------------------

// Funksjon for å finne posisjonen til musen
function getMousePos(event) {
  let mouseX = event.clientX; // x-koordinat til musen
  let mouseY = event.clientY; // y-koordinat til musen
  return{x: mouseX, y: mouseY}
}


//buttonclick funksjon som gjør at knappene våre (home, retry, pause og play), funker og kjøre gamestausene de skal.
function buttonClick(event) {

  if(gameStatus === EGameStatus.Pause){
    gameStatus= EGameStatus.Running;
    snakeSpeed = 3;
    hndUpdateGame = setInterval(updateGame, 500/snakeSpeed);
  }

  switch (gameStatus) {
      case EGameStatus.New:
      newGame();
      gameStatus = EGameStatus.Running;
      break;

    case EGameStatus.GameOver:
      let mousePos = getMousePos(event) 
      console.log(mousePos)

      if ((mousePos.x >= 96 && mousePos.x <= 265) && (mousePos.y >= 389 && mousePos.y <= 556)) {
        gameStatus = EGameStatus.New;
        if (hndUpdateGame) {
          clearInterval(hndUpdateGame);
        }
        
    } else if ((mousePos.x >= 645 && mousePos.x <= 814) && (mousePos.y >= 389 && mousePos.y <= 556)) {
        newGame() //RETRY
        gameStatus = EGameStatus.Running;
    } 
      break;
    
  }
}


//Funskjon med Switch-cases som gjør slik at spillet reagerer med tastetrykk.
//Endrer deretter slangens retning, og spillets gamestatus (mellom running og pause) basert pp piltastene og mellomromstasten.
function keydown(aEvent) { //Tastene for og bevege slangen
  const snakeHead = gameProps.snake[0];
  switch (aEvent.key) {
    case "ArrowLeft":
      snakeHead.setDirection(EDirection.Left);
      break;
    case "ArrowRight":
      snakeHead.setDirection(EDirection.Right);
      break;
    case "ArrowUp":
      snakeHead.setDirection(EDirection.Up);
      break;
    case "ArrowDown":
      snakeHead.setDirection(EDirection.Down);
      break;
    case " ":

      if (gameStatus === EGameStatus.Pause) {
        gameStatus = EGameStatus.Running;
        snakeSpeed = 4;
        hndUpdateGame = setInterval(updateGame, 500 / snakeSpeed)


      } else if (gameStatus === EGameStatus.New) {
        gameStatus = EGameStatus.Pause;
        snakeSpeed = 0;
        clearInterval(hndUpdateGame);

      } else if (gameStatus === EGameStatus.Running) {
        gameStatus = EGameStatus.Pause;
        snakeSpeed = 0;
        clearInterval(hndUpdateGame);

      }

      break;
  }
}
