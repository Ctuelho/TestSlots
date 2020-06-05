import Aux from '../SlotEnum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Machine extends cc.Component {
  @property(cc.Node)
  public button: cc.Node = null;

  @property(cc.Prefab)
  public _reelPrefab = null;

  @property({ type: cc.Prefab })
  get reelPrefab(): cc.Prefab {
    return this._reelPrefab;
  }

  set reelPrefab(newPrefab: cc.Prefab) {
    this._reelPrefab = newPrefab;
    this.node.removeAllChildren();

    if (newPrefab !== null) {
      this.createMachine();
    }
  }

  @property({ type: cc.Integer })
  public _numberOfReels = 3;

  @property({ type: cc.Integer, range: [3, 6], slide: true })
  get numberOfReels(): number {
    return this._numberOfReels;
  }

  set numberOfReels(newNumber: number) {
    this._numberOfReels = newNumber;

    if (this.reelPrefab !== null) {
      this.createMachine();
    }
  }

  private reels = [];

  public tilesTextures = [];

  public spinning = false;

  //loads the tiles textures and create the reels
  async createMachine(): Promise<boolean> {
    this.lock();
    this.node.destroyAllChildren();
    this.reels = [];

    this.tilesTextures = await this.loadTextures();

    let newReel: cc.Node;
    for (let i = 0; i < this.numberOfReels; i += 1) {
      newReel = cc.instantiate(this.reelPrefab);
      this.node.addChild(newReel);
      this.reels[i] = newReel;

      const reelScript = newReel.getComponent('Reel');
      reelScript.tilesTextures = this.tilesTextures;
      reelScript.shuffle();
      reelScript.reelAnchor.getComponent(cc.Layout).enabled = false;
    
      this.node.getComponent(cc.Widget).updateAlignment();
    }

    //enable the spin button again
    this.button.getComponent(cc.Button).interactable = true;

    return new Promise<boolean>(resolve => {    
      resolve(true);
    });
  }
 
  async loadTextures(): Promise<Array<cc.SpriteFrame>> {
    //loads all resources in the folder as spriteFrames
    return new Promise<Array<cc.SpriteFrame>>(resolve => {
      cc.loader.loadResDir('gfx/Square', cc.SpriteFrame, function afterLoad(err, loadedTextures) {
        resolve(loadedTextures);
      });
    });
  }

  spin(): void {
    this.spinning = true;
    this.button.getChildByName('Label').getComponent(cc.Label).string = 'STOP';

    for (let i = 0; i < this.numberOfReels; i += 1) {
      const theReel = this.reels[i].getComponent('Reel');

      if (i % 2) {
        theReel.spinDirection = Aux.Direction.Down;
      } else {
        theReel.spinDirection = Aux.Direction.Up;
      }

      theReel.doSpin(0.03 * i);
    }
  }

  lock(): void {
    //disables the spin button
    this.button.getComponent(cc.Button).interactable = false;
  }

  stop(result: Array<Array<Array<number>>> = null): void {
    //disables the button and sets a timer to enable the spin button again
    setTimeout(() => {
      this.spinning = false;
      this.button.getComponent(cc.Button).interactable = true;
      this.button.getChildByName('Label').getComponent(cc.Label).string = 'SPIN';
    }, 2500);

    //delay to make the machine feel more realistic
    const rngMod = Math.random() / 2;
    //delay to start the glow in case a row is matched
    const glowDelay = rngMod + rngMod * (this.numberOfReels - 3) + (this.numberOfReels - 1) / 4;

    ///stop the reels
    for (let i = 0; i < this.numberOfReels; i += 1) {
      const spinDelay = i < 2 + rngMod ? i / 4 : rngMod * (i - 2) + i / 4;
      const theReel = this.reels[i].getComponent('Reel');
      setTimeout(() => {
        theReel.readyStop(result[i], glowDelay - spinDelay);
      }, spinDelay * 1000);
    }
  }
}
