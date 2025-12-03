import { Block } from ".";

interface BlockChainInterface {
  blocks: Block[];
  
}

export class BlockChain implements BlockChainInterface {
  blocks: Block[];
  constructor() {
    this.blocks = [];
  }
}
