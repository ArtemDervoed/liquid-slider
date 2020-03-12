const MOUSE_WHEEL_EVENT = "wheel";
  const TOUCH_MOVE = "touchmove";
  const TOUCH_END = "touchend";
  const MOUSE_DOWN = "mousedown";
  const MOUSE_UP = "mouseup";
  const MOUSE_MOVE = "mousemove";

  export default class ScrollPos {
  	constructor() {
  		this.acceleration = 0;
  		this.maxAcceleration = 5;
  		this.maxSpeed = 20;
  		this.velocity = 0;
  		this.dampen = 0.97;
  		this.speed = 8;
  		this.touchSpeed = 8;
  		this.scrollPos = 0;
  		this.velocityThreshold = 1;
  		this.snapToTarget = false;
  		this.mouseDown = false;
  		this.lastDelta = 0;

  		window.addEventListener(MOUSE_WHEEL_EVENT, event => {
  			event.preventDefault();
  			this.accelerate(Math.sign(event.deltaY) * this.speed);
  		});

  		window.addEventListener(TOUCH_MOVE, event => {
  			//event.preventDefault();
  			let delta = this.lastDelta-event.targetTouches[0].clientY;
  			this.accelerate(Math.sign(delta) * this.touchSpeed);
  			this.lastDelta = event.targetTouches[0].clientY;
  		})

  		window.addEventListener(TOUCH_END, event =>{
  			this.lastDelta = 0;
  		})

  		window.addEventListener(MOUSE_DOWN, event=>{
  			this.mouseDown = true;
  		})

  		window.addEventListener(MOUSE_MOVE, event=>{
  			if(this.mouseDown){
  				let delta = this.lastDelta-event.clientY;
  				this.accelerate(Math.sign(delta) * this.touchSpeed*0.4);
  				this.lastDelta = event.clientY;
  			}
  		})

  		window.addEventListener(MOUSE_UP, event=>{
  			this.lastDelta = 0;
  			this.mouseDown = false;
  		})

  	}
  	accelerate(amount) {
  		if (this.acceleration < this.maxAcceleration) {
  			this.acceleration += amount;
  		}
  	}
  	update() {
  		this.velocity += this.acceleration;
  		if (Math.abs(this.velocity) > this.velocityThreshold) {
  			this.velocity *= this.dampen;
  			this.scrollPos += this.velocity;
  		} else {
  			this.velocity = 0;
  		}
  		if (Math.abs(this.velocity) > this.maxSpeed) {
  			this.velocity = Math.sign(this.velocity) * this.maxSpeed;
  		}
  		this.acceleration = 0;
  	}
  	snap (snapTarget, dampenThreshold = 100, velocityThresholdOffset = 1.5) {
  		if(Math.abs(snapTarget - this.scrollPos) < dampenThreshold) {
  			this.velocity *= this.dampen;
  		}
  		if (Math.abs(this.velocity) < this.velocityThreshold+velocityThresholdOffset) {
  			this.scrollPos += (snapTarget - this.scrollPos) * 0.1;
  		}
  	}
  	project(steps = 1) {
  		if(steps === 1)	return this.scrollPos + this.velocity * this.dampen
  		var scrollPos = this.scrollPos;
  		var velocity = this.velocity;

  		for(var i = 0; i < steps; i++) {
  				velocity *= this.dampen;
  				scrollPos += velocity;
  		}
  		return scrollPos;
  	}
  }