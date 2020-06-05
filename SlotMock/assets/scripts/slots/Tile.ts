const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
  @property({ type: cc.Node, visible: true })
  public glow = null;
  
  setTile(tile: cc.SpriteFrame): void {
    this.node.getComponent(cc.Sprite).spriteFrame = tile;
  }

  setRandom(textures: Array<cc.SpriteFrame>, exclude: Array<number> = null): void {
    //get all possible tiles indexes
    let randomIndexes = Array.from(Array(textures.length).keys());

    //filter the possible tiles, excluding tiles present in the result
    //so it won't accidentally repeat the tile
    if(exclude != null && exclude.length > 0){
      randomIndexes = randomIndexes.filter( ( el ) => !exclude.includes( el ) );
    }
    
    const randomIndex = randomIndexes[Math.floor(Math.random() * randomIndexes.length)];
    this.setTile(textures[randomIndex]);
  }

  setGlow(doGlow: boolean) {
    //set the glow effect visible/invisible
    this.glow.active = doGlow;
    if(doGlow) {
      //reset the animation to frame 0
      const skeleton = this.glow.getComponent('sp.Skeleton');
      skeleton.setAnimation(0, 'loop', true);
    }
  }
}
