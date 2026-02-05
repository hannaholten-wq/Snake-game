"use strict";
import { TSprite } from "./lib/libSprite.js";
import { TPoint } from "./lib/lib2D.js";
import { cvs, imgSheet, SheetData, EDirection, gameBoard, gameBoardSize, EBoardCellInfoType, TBoardCell, gainSpeed } from "./game.js";
import { gameProps } from "./game.js";

export function TBait(aBoardCell) {
    let boardCell = aBoardCell;
    const spa = SheetData.Bait;
    const pos = new TPoint(boardCell.col * spa.width, boardCell.row * spa.height);
    const sp = new TSprite(cvs, imgSheet, spa, pos);

    gameBoard[boardCell.row][boardCell.col].infoType = EBoardCellInfoType.Bait;

    this.draw = function () {
        sp.draw();
    }

//funksjon som oppdaterer posisjonen til eplet på skjærmen, og flytter det til en ny, 
//tilfeldig posisjon på brettet (om slangen har spist eplet).
    this.update = function() {
        gameBoard[boardCell.row][boardCell.col].infoType = EBoardCellInfoType.Empty;
     
    let randomCol;
    let randomRow;

    do{ 
       randomCol = Math.floor(Math.random() * gameBoardSize.cols);
       randomRow = Math.floor(Math.random() * gameBoardSize.rows);
    }while (gameBoard[randomRow][randomCol].infoType !== EBoardCellInfoType.Empty);

    // Oppdater boardCell med ny posisjon
       boardCell = new TBoardCell(randomCol, randomRow); console.log(boardCell);
       gameBoard[boardCell.row][boardCell.col].infoType = EBoardCellInfoType.Bait;

    //grafikken oppdateres
       pos.x = boardCell.col * spa.width;
       pos.y = boardCell.row * spa.height;
       sp.updateDestination(pos.x, pos.y);

   }
}



