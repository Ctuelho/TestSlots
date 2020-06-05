const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
  @property(cc.Node)
  machine = null;

  @property({ type: cc.AudioClip })
  audioClick = null;

  private block = false;

  private result = null;

  start(): void {
    this.machine.getComponent('Machine').createMachine();
  }

  update(): void {
    if (this.block && this.result != null) {
      this.informStop();
      this.result = null;
    }
  }

  click(): void {
    cc.audioEngine.playEffect(this.audioClick, false);

    if (this.machine.getComponent('Machine').spinning === false) {
      this.block = false;
      this.machine.getComponent('Machine').spin();
      this.requestResult();
    } else if (!this.block) {
      this.block = true;
      this.machine.getComponent('Machine').lock();
    }
  }

  async requestResult(): Promise<void> {
    this.result = null;
    this.result = await this.getAnswer();
  }

  getAnswer(): Promise<Array<Array<Array<number>>>> {
    let slotResult = [];
    let probability = Math.ceil(Math.random() * 100);
    if(probability <= 7) {
      slotResult = this.matchAllRows();
    } else if (probability <= 17) {
      slotResult = this.matchTwoRows();
    } else if (probability <= 50) {
      slotResult = this.matchOneRow();
    }

    return new Promise<Array<Array<Array<number>>>>(resolve => {
      setTimeout(() => {
        resolve(slotResult);
      }, 1000 + 500 * Math.random());
    });
  }

  matchOneRow() : Array<Array<Array<number>>> {
    const rows = 3; //the number of rows displayed per result
    const tiles = 30; //the number of possible tiles textures

    //decide which row will be matched
    let row = Math.floor(Math.random() * rows);

    //decide wich tile will be displayed
    let tile = Math.floor(Math.random() * tiles);

    //fill the result
    let result = [];
    let machine = this.machine.getComponent('Machine');
    for(let i = 0; i < machine._numberOfReels; i += 1) {
      result.push([]);
      for(let j = 0; j < rows; j += 1){
        if(j == row){
          //set the tile and the glow on for this row
          result[i][j] = [tile, 1];
        }
        else {
          //set a random tile and turn off the glow
          result[i][j] = [-1, 0];
        }
      }
    }
    return result;
  }

  matchTwoRows() : Array<Array<Array<number>>> {
    const rows = 3; //the number of rows displayed per result
    const tiles = 30; //the number of possible tiles textures
    
    //decide which rows will not be matched
    let possibleRows = Array.from(Array(rows).keys());
    let row1 = possibleRows[Math.floor(Math.random() * possibleRows.length)];
    possibleRows.splice(possibleRows.indexOf(row1), 1);
    let row2 = possibleRows[Math.floor(Math.random() * possibleRows.length)];

    //decide wich tiles will be displayed
    let possibleTiles = Array.from(Array(tiles).keys());
    let tile1 = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];
    possibleTiles.splice(possibleTiles.indexOf(tile1), 1);
    let tile2 = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];

    //fill the result
    let result = [];
    let machine = this.machine.getComponent('Machine');
    for (let i = 0; i < machine._numberOfReels; i += 1) {
      result.push([]);
      for (let j = 0; j < rows; j += 1){
        if (j == row1) {
          //set the tile and the glow on for this row
          result[i][j] = [tile1, 1];
        }
        else if (j == row2) {
          //set the tile and the glow on for this row
          result[i][j] = [tile2, 1];
        }
        else {
          //set a random tile and turn off the glow
          result[i][j] = [-1, 0];
        }
      }
    }
    return result;
  }

  matchAllRows() : Array<Array<Array<number>>> {
    const rows = 3; //the number of rows displayed per result
    const tiles = 30; //the number of possible tiles textures

    //decide which tiles will be displayed
    let possibleTiles = Array.from(Array(tiles).keys());
    let tile1 = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];
    possibleTiles.splice(possibleTiles.indexOf(tile1), 1);
    let tile2 = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];
    possibleTiles.splice(possibleTiles.indexOf(tile2), 1);
    let tile3 = possibleTiles[Math.floor(Math.random() * possibleTiles.length)];

    //fill the result
    let result = [];
    let machine = this.machine.getComponent('Machine');
    for (let i = 0; i < machine._numberOfReels; i += 1) {
      result.push([]);
      for (let j = 0; j < rows; j += 1){
        if (j == 0) {
          //set the tile and the glow on for this row
          result[i][j] = [tile1, 1];
        }
        else if (j == 1) {
          //set the tile and the glow on for this row
          result[i][j] = [tile2, 1];
        }
        else {
          //set the tile and the glow on for this row
          result[i][j] = [tile3, 1];
        }
      }
    }
    return result;
  }

  informStop(): void {
    const resultRelayed = this.result;
    this.machine.getComponent('Machine').stop(resultRelayed);
  }
}
