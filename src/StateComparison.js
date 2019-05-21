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
    this.records = new Map();
    this.root = root || document.body;
    this.recordPrevious(this.root);
  }

  get cssProperties() {
    return ['position', 'display', 'opacity', 'transform']
  }

  /**
  *
  */
  checkpoint() {
    this.differences = [];
    
    this.recordNext(this.root);

    for(let record of this.records.values()) {
      if(!record.next) {
        record.action = Diff.Exit;
        this.differences.push(record);
      }
    } 
  }

  
  /**
  * @param {HTMLElement} node
  */
  recordPrevious(node) {
    let record = {node, previous:new State(node, this.cssProperties)}
    this.records.set(node, record);
    Array.prototype.forEach.call(node.children, (child)=>{this.recordPrevious(child)});
  }
  

  
  /**
  *
  * @param {HTMLElement} node
  * @param {Translation} [parentTranslation]
  * @param {Diff} [parentDiff]
  */
  recordNext(node, parentTranslation, parentDiff) {
    let record = this.records.get(node) || {node, previous:null};
    parentDiff = parentDiff || Diff.None;

    let next = record.next = new State(node);
    let previous = record.previous;
    
    parentTranslation = parentTranslation || Translation.None;
    let translation = getTranslation(previous, next);
    let netTranslation = translation.subtract(parentTranslation, true);


    if(!previous) 
      record.action =  Diff.Enter
    else if(!previous.isDisplayed() && next.isDisplayed()) {
      record.action = Diff.Enter
      record.isEnterRoot = (Diff.Enter != parentDiff);
    } else if(previous.isDisplayed() && !next.isDisplayed()) {
      record.action = Diff.Exit
      record.isExitRoot = (Diff.Exit != parentDiff);
    } else if(netTranslation.equals(Translation.None))
      record.action = Diff.None;
    else {
      record.action  = Diff.Move;
      record.netTranslation = netTranslation;
    }

    if(Diff.None != record.action)
      this.differences.push(record)
       
    Array.prototype.forEach.call(node.children, (child)=>{
        this.recordNext(child, translation, record.action);
    });
  }

  isExitRoot(node) {
    let record = this.records.get(node);
    if(! record)
      throw new Exception('Cannot find node');

    if('undefined' != typeof record.isExitRoot)
      return record.isExitRoot;

    if(record.next.isDisplayed())
      return record.isExitRoot= false;

    if(this.isExitRoot(record.previous.parentElement))
      return record.isExitRoot = false;

    return record.isExitRoot = true;
  }

  isEnterRoot(node) {
    let record = this.records.get(node);
    if(! record)
      throw new Exception('Cannot find node');
    
    return record.isEnterRoot;
  }
}