import * as THREE from 'three';
const a = 'https://images.prismic.io/cusp/7bfcdab3-8c43-4558-9417-d6b431730083_cleannow_next.jpg?auto=compress,format'
const b = 'https://images.prismic.io/cusp/f251334f-6a36-43c6-b55c-d84e3d4a0555_1-min.jpg?auto=compress,format'
const c = 'https://images.prismic.io/cusp/528c9ee2-a14a-4787-9a55-621a61dd61a2_lifemessy_preview.jpg?auto=compress,format'
const d = 'https://images.prismic.io/cusp/93995c93-8dfe-4f3f-b0d7-727c20c758db_81b79566090147.5b249527da157.jpg?auto=compress,format'
const e = 'https://images.prismic.io/cusp/43da11bd-03f5-426f-804b-c79112adf8a3_sprout.jpg?auto=compress,format'
const f = 'https://images.prismic.io/cusp/ca9636a5-0dec-45e7-ad5a-d32bb15ac63f_factory_preview_main.jpg?auto=compress,format'
const g = 'https://images.prismic.io/cusp/6a352978-a03a-4a25-98ab-50f46a0f50a7_iStock-915736424-min.jpg?auto=compress,format'

const data = [a, b, c, d, e, f, g];

window.onload = () => {

  const MOUSE_WHEEL_EVENT = "wheel";
  const TOUCH_MOVE = "touchmove";
  const TOUCH_END = "touchend";
  const MOUSE_DOWN = "mousedown";
  const MOUSE_UP = "mouseup";
  const MOUSE_MOVE = "mousemove";
  class ScrollPos {
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

  var mouseWheel = new ScrollPos();
  const scrollPerImage = 500;

  const KEYBOARD_ACCELERATION = 25;

  window.addEventListener("keydown", (e)=>{
  	switch(e.keyCode) {
  		case 33:
  		case 38:
  			// UP
  			mouseWheel.acceleration -= KEYBOARD_ACCELERATION;
  			mouseWheel.update()
  			break;
  		case 34:
  		case 40:
  			// DOWN
  			mouseWheel.acceleration += KEYBOARD_ACCELERATION;
  			mouseWheel.update()
  			break;
  	}
  })


  const IMAGE_SIZE = 1024;

  let imageContainer = document.getElementById("images");
  let canvas = document.createElement("canvas");
  		canvas.width = IMAGE_SIZE;
  		canvas.height = IMAGE_SIZE;
  let ctx = canvas.getContext("2d");

  function resizeImage(image, size = IMAGE_SIZE) {
  	let newImage = image;
  	let {width, height} = image;
  	let newWidth = size/width;
  	let newHeight = size/height;

  	ctx.drawImage(image, 0, 0, width, height, 0,0, size, size);

  	return ctx.getImageData(0,0,size,size);
  }

  function makeThreeTexture(image) {
  	let tex = new THREE.Texture(image);
  					tex.needsUpdate = true;
  	return tex
  }

  function loadImages() {
  	let promises = [];
  	for (var i = 0; i < data.length; i++) {
  		promises.push(
  			new Promise((resolve, reject) => {
  				let img = document.createElement("img");
  				img.crossOrigin = "anonymous";
  				img.src = data[i];
  				img.onload = image => {
  					return resolve(image.target);
  				};
  			}).then(resizeImage)
  				.then(makeThreeTexture)
  		);
  	}
  	return Promise.all(promises);
  }

  loadImages().then((images) => {
  	document.getElementById("loading").style = "display: none;";
  	init(images);
  });

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  document.body.appendChild(renderer.domElement);

  function init(textures) {
  	let scene = new THREE.Scene();
  	let camera = new THREE.PerspectiveCamera(
  		45,
  		window.innerWidth / window.innerHeight,
  		0.1,
  		2000
  	);
  	camera.position.set(0, 0, 20);

  	scene.add(camera);

  	let geometry = new THREE.PlaneGeometry(4.75, 7, 4, 4);

  	let material = new THREE.ShaderMaterial({
  		uniforms: {
  			time: { value: 1.0 },
  			blend: { value: 0.0 },
  			tex1: { type: "t", value: textures[1] },
  			tex2: { type: "t", value: textures[0] }
  		},
  		vertexShader: document.getElementById("vertexShader").textContent,
  		fragmentShader: document.getElementById("fragmentShader").textContent,
  	});

		let mesh = new THREE.Mesh(geometry, material);
		mesh.rotateZ(-0.296706);

  	scene.add(mesh);

  	var tex1 = textures[1];
  	var tex2 = textures[0];

  	function updateTexture(pos) {
  		if(tex2 != textures[Math.floor(pos / scrollPerImage)]) {
  			tex2 = textures[Math.floor(pos / scrollPerImage)]
  			material.uniforms.tex2.value = tex2;
  		}
  		if(tex1 != textures[Math.floor(pos / scrollPerImage) + 1]) {
  			tex1 = textures[Math.floor(pos / scrollPerImage) + 1]
  			material.uniforms.tex1.value = tex1;
  		}
  	}



  	function draw() {
  		requestAnimationFrame(draw);
  		mouseWheel.update();
  		let scrollTarget = (Math.floor((mouseWheel.scrollPos+scrollPerImage*0.5) / scrollPerImage)) * scrollPerImage;
  		mouseWheel.snap(scrollTarget);

  		let { scrollPos, velocity } = mouseWheel;

  		if (scrollPos < 0) {
  			scrollPos = 0;
  		}
  		if (scrollPos > scrollPerImage * textures.length - 1) {
  			scrollPos = scrollPerImage * textures.length - 1;
  		}

  		if (scrollPos > 0 && scrollPos < scrollPerImage * textures.length - 1) {
  			updateTexture(scrollPos);
  			material.uniforms.blend.value = (scrollPos % scrollPerImage) / scrollPerImage;
  		}

  		mouseWheel.scrollPos = scrollPos;

  		material.uniforms.time.value += 0.1;

  		renderer.render(scene, camera);
  	}

  	function resize() {
  		camera.aspect = window.innerWidth / window.innerHeight;
  		camera.updateProjectionMatrix();
  		renderer.setPixelRatio(window.devicePixelRatio);
  		renderer.setSize(window.innerWidth, window.innerHeight);
  	}

   	window.addEventListener("resize", resize);

   	resize();
  	draw();

  }
}
