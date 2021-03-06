import Aux from '../SlotEnum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Reel extends cc.Component {
  @property({ type: cc.Node })
  public reelAnchor = null;

  @property({ type: cc.Enum(Aux.Direction) })
  public spinDirection = Aux.Direction.Down;

  @property({ type: [cc.Node], visible: false })
  private tiles = [];

  @property({ type: cc.Prefab })
  public _tilePrefab = null;

  @property({ type: cc.Prefab })
  get tilePrefab(): cc.Prefab {
    return this._tilePrefab;
  }

  set tilePrefab(newPrefab: cc.Prefab) {
    this._tilePrefab = newPrefab;
    this.reelAnchor.removeAllChildren();
    this.tiles = [];

    if (newPrefab !== null) {
      this.createReel();
      this.shuffle();
    }
  }

  private tilesTextures: Array<cc.SpriteFrame>;
    
  private result: Array<Array<number>> = [];

  //tiles to be excluded of random selection
  private exclude: Array<number> = [];

  //timer to start the glow
  private glowDelay: number = 0;

  public stopSpinning = false;

  setTilesTextures(newTilesTextures: Array<cc.SpriteFrame>) : void {
    this.tilesTextures = newTilesTextures;
    this.shuffle();
  }

  createReel(): void {
    let newTile: cc.Node;
    for (let i = 0; i < 5; i += 1) {
      newTile = cc.instantiate(this.tilePrefab);
      this.reelAnchor.addChild(newTile);
      this.tiles[i] = newTile;
    }
  }

  //randomize the tiles
  shuffle(): void {
    for (let i = 0; i < this.tiles.length; i += 1) {
      this.tiles[i].getComponent('Tile').setRandom(this.tilesTextures);
    }
  }

  //called when the stop button was pressed and has a result ready
  readyStop(newResult: Array<Array<number>>, newGlowDelay : number = 0): void {
    const check = this.spinDirection === Aux.Direction.Down || newResult == null;
    this.result = check ? newResult : newResult.reverse();
    this.stopSpinning = true;
    this.glowDelay = newGlowDelay;
    this.exclude = null;
    if(newResult != null){
      this.exclude = [];
      for(let i = 0; i < this.result.length; i += 1){
        this.exclude.push(this.result[i][0]);
      }
    }
  }

  //changes the tile, called at the end of each animation sequence
  changeCallback(element: cc.Node = null): void {
    const el = element;
    const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;
    if (el.position.y * dirModifier > 288) {
      el.position = cc.v2(0, -288 * dirModifier);

      let pop = null;
      if (this.result != null && this.result.length > 0) {
        pop = this.result.pop();
      }
      let tile = el.getComponent('Tile');
      if (pop != null && pop[0] >= 0) {
        tile.setTile(this.tilesTextures[pop[0]]);
        //enable the glow
        if(pop[1]){
          setTimeout(() => {
            tile.setGlow(true);
          }, (this.glowDelay * 1000));
        }
      } else {
        //if pop is null or pop[0] <= -1 set a random tile
        tile.setRandom(this.tilesTextures, this.exclude);
        tile.setGlow(false);
      }
    }
  }

  checkEndCallback(element: cc.Node = null): void {
    const el = element;
    if (this.stopSpinning) {
      this.getComponent(cc.AudioSource).play();
      this.doStop(el);
    } else {
      this.doSpinning(el);
    }
  }

  doSpin(windUp: number): void {
    this.stopSpinning = false;

    this.reelAnchor.children.forEach(element => {
      const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;

      const delay = cc.tween(element).delay(windUp);
      const start = cc.tween(element).by(0.25, { position: cc.v2(0, 144 * dirModifier) }, { easing: 'backIn' });
      const doChange = cc.tween().call(() => this.changeCallback(element));
      const callSpinning = cc.tween(element).call(() => this.doSpinning(element, 5));

      delay
        .then(start)
        .then(doChange)
        .then(callSpinning)
        .start();
    });
  }

  doSpinning(element: cc.Node = null, times = 1): void {
    const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;

    const move = cc.tween().by(0.04, { position: cc.v2(0, 144 * dirModifier) });
    const doChange = cc.tween().call(() => this.changeCallback(element));
    const repeat = cc.tween(element).repeat(times, move.then(doChange));
    const checkEnd = cc.tween().call(() => this.checkEndCallback(element));

    repeat.then(checkEnd).start();
  }

  doStop(element: cc.Node = null): void {
    const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;

    const move = cc.tween(element).by(0.04, { position: cc.v2(0, 144 * dirModifier) });
    const doChange = cc.tween().call(() => this.changeCallback(element));
    const end = cc.tween().by(0.2, { position: cc.v2(0, 144 * dirModifier) }, { easing: 'bounceOut' });

    move
      .then(doChange)
      .then(move)
      .then(doChange)
      .then(end)
      .then(doChange)
      .start();
  }
}
