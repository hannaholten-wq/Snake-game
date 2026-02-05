import { SheetData, EDirection, gameBoard} from "./game.js";

export const ESpriteIndex = {UR: 0, LD: 0, RU: 1, DR: 1, DL: 2, LU: 2, RD: 3, UL: 3, RL: 4, UD: 5};

export function moveSnakeElement(aDirection, aBoardCell, aSpriteInfo){
    switch(aSpriteInfo){
        case SheetData.Head:
            return moveSnakeHead(aDirection, aBoardCell);
        case SheetData.Body:
            return moveSnakeBody(aDirection, aBoardCell);
        case SheetData.Tail:
            return moveSnakeTail(aDirection, aBoardCell);
    }
}

function moveSnakeHead(aDirection, aBoardCell){
    gameBoard[aBoardCell.row][aBoardCell.col].direction = aDirection;
    switch (aDirection) {
        case EDirection.Up:
            aBoardCell.row--;
            break;
        case EDirection.Right:
            aBoardCell.col++;
            break;
        case EDirection.Left:
            aBoardCell.col--;
            break;
        case EDirection.Down:
            aBoardCell.row++;
            break;
    }
    return aDirection;
}

function moveSnakeBody(aDirection, aBoardCell){
    let spriteIndex = ESpriteIndex.RL;
    const boardCell = aBoardCell;

    switch (aDirection) {
        case EDirection.Up:
            boardCell.row--;
            if ( gameBoard[boardCell.row][boardCell.col].direction !== aDirection) {
                switch ( gameBoard[boardCell.row][boardCell.col].direction) {
                    case EDirection.Left:
                        spriteIndex = ESpriteIndex.UL;
                        break;
                    case EDirection.Right:
                        spriteIndex = ESpriteIndex.UR;
                        break;
                }
            } else {
                spriteIndex = ESpriteIndex.UD;
            }
            break;
        case EDirection.Right:
            boardCell.col++;
            if ( gameBoard[boardCell.row][boardCell.col].direction !== aDirection) {
                switch ( gameBoard[boardCell.row][boardCell.col].direction) {
                    case EDirection.Up:
                        spriteIndex = ESpriteIndex.RU;
                        break;
                    case EDirection.Down:
                        spriteIndex = ESpriteIndex.RD;
                        break;
                }
            } else {
                spriteIndex = ESpriteIndex.RL;
            }
            break;
        case EDirection.Left:
            boardCell.col--;
            if ( gameBoard[boardCell.row][boardCell.col].direction !== aDirection) {
                switch ( gameBoard[boardCell.row][boardCell.col].direction) {
                    case EDirection.Up:
                        spriteIndex = ESpriteIndex.LU;
                        break;
                    case EDirection.Down:
                        spriteIndex = ESpriteIndex.LD;
                        break;
                }
            } else {
                spriteIndex = ESpriteIndex.RL;
            }
            break;
        case EDirection.Down:
            boardCell.row++;
            if ( gameBoard[boardCell.row][boardCell.col].direction !== aDirection) {
                switch ( gameBoard[boardCell.row][boardCell.col].direction) {
                    case EDirection.Left:
                        spriteIndex = ESpriteIndex.DR;
                        break;
                    case EDirection.Right:
                        spriteIndex = ESpriteIndex.DL;
                        break;
                }
            } else {
                spriteIndex = ESpriteIndex.UD;
            }
            break;
    }
    return spriteIndex;
}

function moveSnakeTail(aDirection, aBoardCell){
    switch (aDirection) {
        case EDirection.Up:
            aBoardCell.row--;
            break;
        case EDirection.Right:
            aBoardCell.col++;
            break;
        case EDirection.Left:
            aBoardCell.col--;
            break;
        case EDirection.Down:
            aBoardCell.row++;
            break;
    }
    return  gameBoard[aBoardCell.row][aBoardCell.col].direction;
}