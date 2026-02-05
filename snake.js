"use strict";
//-----------------------------------------------------------------------------------------
//----------- Import modules, js files  ---------------------------------------------------
//-----------------------------------------------------------------------------------------
import { TSprite } from "./lib/libSprite.js";
import { TPoint } from "./lib/lib2D.js";
import { cvs, imgSheet, SheetData, EDirection, gameBoard, gameBoardSize, EBoardCellInfoType, gameProps, TBoardCell, gameStatus, EGameStatus , snakeSelfCollision, gainSpeed} from "./game.js";
import { moveSnakeElement, ESpriteIndex } from "./snake_lib.js";
import { TBait } from "./bait.js";
//-----------------------------------------------------------------------------------------
//----------- Classes ---------------------------------------------------------------------
//-----------------------------------------------------------------------------------------


let snakeGrow = false;

//Klasse med objekt for slangens hode, som oppretter slangens hode på brettet basert på en gitt celle.

export function TSnakeHead(aBoardCell) {
  const boardCell = aBoardCell;
  const spa = SheetData.Head; //SnakeSheet.Body or SnakeSheet.Tail
  const pos = new TPoint(boardCell.col * spa.width, boardCell.row * spa.height);
  const sp = new TSprite(cvs, imgSheet, spa, pos);

  let boardCellInfo = gameBoard[boardCell.row][boardCell.col];
  let direction = boardCellInfo.direction;
  let newDirection = direction;
  boardCellInfo.infoType = EBoardCellInfoType.Snake;
  let timer = 100;                                                             //Nedtellingen fra 100
  let score = 0;


  
//Setter en funksjon kalt draw, som setter slangens hode-retning også tegner det.
  this.draw = function () {
    sp.setIndex(direction);
    sp.draw();
  };

  //Setter en funksjon for retningen til slangens hode som endrer seg basert på hvilken nåværende retningen det har, 
//og om den nye retningen er 90 grader ifht den gjeldende retningen.
  this.setDirection = function (aDirection) {
    if ((direction === EDirection.Right || direction === EDirection.Left) && (aDirection === EDirection.Up || aDirection === EDirection.Down)) {
      newDirection = aDirection;
    } else if ((direction === EDirection.Up || direction === EDirection.Down) && (aDirection === EDirection.Right || aDirection === EDirection.Left)) {
      newDirection = aDirection;
    }
  };


//Denne funksjonen oppdaterer slangens posisjon og retning, og sjekker for kollisjoner, 
//oppdaterer brettinformasjonen, og håndterer om slangen spiser eplene, og setter countdown til 100 vha timer fra tidligere.
//legger også til den nye scoren.
  
    this.update = function () {
    if(timer <= 0){
      gameProps.numberSec.setValue(0);
    }else{
        gameProps.numberSec.setValue(timer);
        timer --;
    }
      direction = moveSnakeElement(newDirection, boardCell, spa);

    if(!this.checkCollision()){    
      boardCellInfo = gameBoard[boardCell.row][boardCell.col];

      if(boardCellInfo.infoType === EBoardCellInfoType.Bait){
        console.log("Bait eaten!");
        score = score += timer;
        gameProps.numberScore.setValue(score)
        timer = 100;                 
        gameProps.bait.update();
        gainSpeed(); 
        
        snakeGrow = true; 
        const lastBody = gameProps.snake [gameProps.snake.length - 2];
        gameProps.newBodypart = lastBody.createBody();

      }else if(boardCellInfo.infoType === EBoardCellInfoType.Snake){
        console.log("Slangen har truffet seg selv");
         snakeSelfCollision();
      }
      boardCellInfo.infoType = EBoardCellInfoType.Snake;
    }

    pos.x = boardCell.col * spa.width;
    pos.y = boardCell.row * spa.height;
    sp.updateDestination(pos.x, pos.y);

    if(this.checkCollision()){
      gameProps.numberDefeat.setValue(score);
    }
  };


//Denne funksjonen sjekker om slangens hode har kollidert med kantene på spillbrettet. 
//Om slangens hode har kollidert, returnerer funksjonen "true", men har det ikke det returnerer den "false".
//dette gjelder om boardcellen inneholder halen til slangen også (altså den kolliderer.)
  this.checkCollision = function () {
    return boardCell.row < 0 || boardCell.row >= gameBoardSize.rows || boardCell.col < 0 || boardCell.col >= gameBoardSize.cols;
  
  };
} // End of class TSnakeHead

//Denne funksjonen oppretter kroppsdeler til slangen på brettet. 
//Den tar inn posisjonen til en celle, og retningen og indeksen til sprite-en som skal brukes for å tegne kroppsdelen.
export function TSnakeBody(aBoardCell, aDirection, aSpriteIndex) {
  const boardCell = aBoardCell;
  const spa = SheetData.Body;
  const pos = new TPoint(boardCell.col * spa.width, boardCell.row * spa.height);
  const sp = new TSprite(cvs, imgSheet, spa, pos);
  let direction = gameBoard[boardCell.row][boardCell.col].direction;
  let spriteIndex = ESpriteIndex.RL;
  if (aDirection !== undefined && aSpriteIndex !== undefined) {
    direction = aDirection;
    spriteIndex = aSpriteIndex;
  }


//Funksjon som tegner inn kroppsdelen(e), basert på indeksene. 
  this.draw = function () {
    sp.setIndex(spriteIndex);
    sp.draw();
  };

//Funbksjon som oppdaterer posisjonen til kroppsdelen til slangen basert på retningen den beveger seg i. 
//Så oppdateres posisjonen til kroppsdelen på brettet.
  this.update = function () {
    spriteIndex = moveSnakeElement(direction, boardCell, spa);
    direction = gameBoard[boardCell.row][boardCell.col].direction;
    pos.x = boardCell.col * spa.width;
    pos.y = boardCell.row * spa.height;
    sp.updateDestination(pos.x, pos.y);
  };

  //Funksjon som oppretter en ny kroppsdel til slangen basert på posisjon, retning og sprite-indeks.
  this.createBody = function () {
    return new TSnakeBody(new TBoardCell(boardCell.col, boardCell.row), direction, spriteIndex);
  };
} // End of class TSnakeBody


//Funksjon som oppretter slangens hale på brettet basert på en gitt celle. 
export function TSnakeTail(aBoardCell) {
  const boardCell = aBoardCell;
  const spi = SheetData.Tail;
  const pos = new TPoint(boardCell.col * spi.width, boardCell.row * spi.height);
  const sp = new TSprite(cvs, imgSheet, spi, pos);
  let direction = gameBoard[boardCell.row][boardCell.col].direction;

  this.draw = function () {
    sp.setIndex(direction);
    sp.draw();
  };


//Funksjon som oppdaterer posisjonen til slangens hale og brettinformasjonen etter hvor slangen beveger seg på brettet.
  this.update = function () {

    if (!snakeGrow){ 
    gameBoard[boardCell.row][boardCell.col].infoType = EBoardCellInfoType.Empty;
    direction = moveSnakeElement(direction, boardCell, spi);
    pos.x = boardCell.col * spi.width;
    pos.y = boardCell.row * spi.height;
    sp.updateDestination(pos.x, pos.y);
  }else{
    snakeGrow = false; 
  }
  };
} // End of class TSnakeTail


