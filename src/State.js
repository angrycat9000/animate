class Translation {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }
  
  equals(other) {
    return other && other.top == this.top && other.left == this.left;
  }

  subtract(other, returnNew) {
    const top = this.top - other.top;
    const left = this.left - other.left;

    if(returnNew)
      return new Translation(left,top);
      
    this.left = left;
    this.top = top;
    return this;
  }  
}  

Translation.None = new Translation(0,0);

/**
* @class
* @param {HTMLElement} element
* @param {Array[string]} {cssProperties} names of any inline CSS properties to save from
*/
function State(element, cssProperties) {
  let rect = element.getBoundingClientRect();
  this.top = rect.top;
  this.left = rect.left;
  this.height = rect.height;
  this.width = rect.width;
  
  this.element = element;
  this.parentElement = element.parentElement;

  this.liveStyle = window.getComputedStyle(element);
  
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


/**
* @return {boolean}
*/
State.prototype.isDisplayed = function() {
  return 'none' !== this.computedStyle.display && this.parentElement;
}



/**
* @param {State} other
*/
State.prototype.hasChangeFrom = function( other ) {
  return this.width !== other.width ||
    this.height !== other.height ||
    this.top !== other.top ||
    this.left !== other.left;
}


/**
* @param {State} other
*/
State.prototype.translationFrom = function( other ) {
  return new Translation(this.left - other.left, this.top - other.top);
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
