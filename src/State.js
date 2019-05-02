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
  this.offsetTop = element.offsetTop;
  this.offsetLeft = element.offsetLeft;
  
  let rect = element.getBoundingClientRect();
  
  this.clientTop = rect.top;
  this.clientLeft = rect.left;
   
  this.height = element.clientHeight;
  this.width = element.clientWidth;
  
  this.offsetParent = element.offsetParent;

  let style = window.getComputedStyle(element);
  this.display = style.display;
  this.position = style.position;
  
  this.inlineStyle = {};
  this.computedStyle = {};  
  
  cssProperties = cssProperties || [];
  cssProperties.forEach((name,i) => {
    this.inlineStyle[name] = element.style[name] || '';
    this.computedStyle[name] = style[name];
  });
}

Object.defineProperty(State.prototype, 'top', {get:function(){return this.clientTop}})
Object.defineProperty(State.prototype, 'left', {get:function(){return this.clientLeft}})

/**
* @return {boolean}
*/
State.prototype.isDisplayed = function() {
  return 'none' !== this.display && this.offsetParent;
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
  
  for(let prop in this.inlineCSS) {
    element.style[prop] = this.inlineCSS[prop];
  }
}

/**
*
*/
class NestedState extends State {
  constructor(element, cssProperties) {
    super(element, cssProperties);
    this.children = Array.prototype.map.call(element.children, child=>new NestedState(child));
  }
}