let Diff = {
  None:'none',
  Enter:'enter',
  Exit:'exit',
  Move:'move'
}

function getTranslation(prev, next) {
  if(!prev || !next)
    return Translation.None;

  return prev.translationFrom(next);
}

class StateComparison {
  
  /**
  * @param {HTMLElement} root
  */
  constructor(root) {
    this.previousState = new Map();
    this.root = root || document.body;
  
    this.gatherPrevious(this.root);
  }

  get cssProperties() {
    return ['position', 'display', 'opacity', 'transform']
  }

  /**
  *
  */
  compare() {
    if(!this.previousState)
      return;
    
    this.differences = [];
    
    this.gatherNext(this.root);

    for(let entry of this.previousState.entries()) {
      let result = {node:entry.key, previousState:entry.value, action:'exit'};
      this.differences.push(result);
    }
    
    delete this.previousState;
  }
  
  /**
  * @param {HTMLElement} node
  */
  gatherPrevious(node) {
    this.previousState.set(node, new State(node, this.cssProperties));
    Array.prototype.forEach.call(node.children, (child)=>{this.gatherPrevious(child)});
  }
  

  
  /**
  *
  */
  gatherNext(node, parentTranslation) {
    const nextState = new State(node);
    let previousState = this.previousState.get(node);
    
    parentTranslation = parentTranslation || Translation.None;
    
    let translation = getTranslation(previousState,nextState);

    let result = {node, 
                  nextState, 
                  previousState,
                  didChildrenMove:false, 
                  netTranslation: translation.subtract(parentTranslation, true)
                 };

    if(!previousState) 
      result.action =  Diff.Enter
    else if(!previousState.isDisplayed() && nextState.isDisplayed())
      result.action = Diff.Enter
    else if(previousState.isDisplayed() && !nextState.isDisplayed())
      result.action = Diff.Exit
    else if(result.netTranslation.equals(Translation.None))
      result.action = Diff.None;
    else
      result.action  = Diff.Move;
       
    this.previousState.delete(node);
    if(Diff.None !== result.action)
      this.differences.push(result);  
    
    Array.prototype.forEach.call(node.children, (child)=>{
      let childResult = this.gatherNext(child, translation);
      result.didChildrenMove =  result.didChildrenMove || Diff.Move === childResult.action;
    });
    
    return result;
  }
}