const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
  @property({ type: [cc.SpriteFrame], visible: true })
  private textures = [];

  async onLoad(): Promise<void> {
    await this.loadTextures();
  }

  async resetInEditor(): Promise<void> {
    await this.loadTextures();
    this.setRandom();
  }

  async loadTextures(): Promise<boolean> {
    const self = this;
    return new Promise<boolean>(resolve => {
      cc.loader.loadResDir('gfx/Square', cc.SpriteFrame, function afterLoad(err, loadedTextures) {
        self.textures = loadedTextures;
        resolve(true);
      });
    });
  }

  setTile(index: number): void {
    this.node.getComponent(cc.Sprite).spriteFrame = this.textures[index];
  }

  setRandom(exclude: Array<number> = null): void {
    //get all possible tiles indexes
    let randomIndexes = Array.from(Array(this.textures.length).keys());

    //filter the possible tiles, removing the tiles present in the result
    //so it won't accidentally repeat the tile
    if(exclude != null && exclude.length > 0){
      randomIndexes = randomIndexes.filter( ( el ) => !exclude.includes( el ) );
    }
    
    const randomIndex = randomIndexes[Math.floor(Math.random() * randomIndexes.length)];
    this.setTile(randomIndex);
  }
}
