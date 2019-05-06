class Translation {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }
  
  equals(other) {
    return other && other.top == this.top && other.left == this.left;
  }
}  

Translation.None = new Translation(0,0);

/**
* @class
* @param {HTMLElement} element
* @param {Array[string]} {cssProperties} names of any inline CSS properties to save from
*/
function State(element, cssProperties) {
  this.element = element;
  this.offsetTop = element.offsetTop;
  this.offsetLeft = element.offsetLeft;
  
  let rect = element.getBoundingClientRect();
  
  this.clientTop = rect.top;
  this.clientLeft = rect.left;
   
  this.height = element.clientHeight;
  this.width = element.clientWidth;
  
  //this.offsetParent = element.offsetParent;
  this.parentElement = element.parentElement;

  let style = this.liveStyle = window.getComputedStyle(element);
  
  this.inlineStyle = {};
  this.computedStyle = {};
  
  if(cssProperties)
    this.snapshotStyle(cssProperties);

  this.snapshotStyle('display');
}


/**
 * @param {Array<string>|string} prop
 */
State.prototype.snapshotStyle = function(prop) {
  if(!Array.isArray(prop))
    prop =[prop];

  prop.forEach((name,i) => {
    this.inlineStyle[name] = this.element.style[name] || '';
    this.computedStyle[name] = this.liveStyle[name];
  });
}

Object.defineProperty(State.prototype, 'top', {get:function(){return this.clientTop}})
Object.defineProperty(State.prototype, 'left', {get:function(){return this.clientLeft}})

/**
* @return {boolean}
*/
State.prototype.isDisplayed = function() {
  return 'none' !== this.computedStyle.display && this.parentElement;
}

/**
* @param {State} other
*/
State.translationFrom = function(other) {
  return {
    x: this.clientTop - other.clientTop,
    y: this.clientLeft - other.clientLeft
  }
}

/**
* @param {State} other
*/
State.prototype.hasChangeFrom = function( other ) {
  return this.width !== other.width ||
    this.height !== other.height ||
    this.clientTop !== other.clientTop ||
    this.clientLeft !== other.clientLeft;
}


/**
* @param {State} other
*/
State.prototype.translationFrom = function( other ) {
  return new Translation(this.clientLeft - other.clientLeft, this.clientTop - other.clientTop);
}
/**
* @param {State} other
*/
State.prototype.hasOffsetChangeFrom = function(other) {
  if(!this.isDisplayed() || !other.isDisplayed())
    return false;
  
  if(this.offsetParent !== other.offsetParent)
    return true;
  
  return this.offsetLeft !== other.offsetLeft || this.offsetTop != other.offsetTop;
}

/**
* @param {HTMLElement} element
*/
State.prototype.restoreStyle= function (element) {
  if(!this.inlineStyle)
    return;
  
  for(let prop in this.inlineStyle) {
    element.style[prop] = this.inlineStyle[prop];
  }
}
