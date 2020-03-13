import * as THREE from 'three';
import * as dat from 'dat.gui';
import ScrollPos from './ScrollPos';

// const scrollPerImage = window.innerHeight / 3;
const scrollPerImage = 500;

export default class ImageSlider {
  constructor(textures) {
    this.textures = textures;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.settings = {
      scrollPos: 0 + scrollPerImage * textures.length * 10,
      maskScale: 1,
      curentTextureIndex: 1,
      nextTextureIndex: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'scrollPos').min(-2000).max(2000).step(0.5);
    this.gui.add(this.settings, 'curentTextureIndex').min(0).max(20).step(1);
    this.gui.add(this.settings, 'nextTextureIndex').min(0).max(20).step(1);
    this.mouseWheel = new ScrollPos();
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.domElement.width = this.width;
    this.renderer.domElement.height = this.height;
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener('wheel', this.handleWheel);

  }

  handleWheel = (e) => {
    this.settings.scrollPos += e.deltaY;
    // console.log();
    
  }

  setDsmTexture = () => {
    // this.material.uniforms.mask.value = texture;
    console.log(this.material);
    
    // this.material.displacementMap = texture;
  }

  init = (maskTexture) => {
  	this.scene = new THREE.Scene();
  	this.camera = new THREE.PerspectiveCamera(
  		45,
  		window.innerWidth / window.innerHeight,
  		0.1,
  		2000
  	);
  	this.camera.position.set(0, 0, 20);

  	this.scene.add(this.camera);

  	this.geometry = new THREE.PlaneGeometry(4.75, 7, 4, 4);

  	this.material = new THREE.ShaderMaterial({
  		uniforms: {
        size: { type: 'v2', value: new THREE.Vector2(4.75, 7) },
  			time: { value: 1.0 },
        blend: { value: 0.0 },
        offset: { value: 0.0 },
  			tex1: { type: "t", value: this.textures[this.settings.curentTextureIndex] },
        tex2: { type: "t", value: this.textures[this.settings.nextTextureIndex] },
        mask: { type: "t", value: maskTexture },
        maskScale: { value: 0.0 },
  		},
  		vertexShader: document.getElementById("vertexShader").textContent,
  		fragmentShader: document.getElementById("fragmentShader").textContent,
    });

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.rotateZ(-0.296706);

    this.scene.add(this.mesh);
    this.resize();

  	this.tex1 = this.textures[this.settings.curentTextureIndex];
    this.tex2 = this.textures[this.settings.nextTextureIndex];

    console.log(this.settings.curentTextureIndex, this.settings.nextTextureIndex, 'constructor');
  }

  setScrollPos = (newScrollPos) => {
    this.settings.scrollPos = newScrollPos;
  }

  setNewtexture = (index) => {
    this.settings.scrollPos = index * scrollPerImage + (scrollPerImage * this.textures.length * 10);
    this.settings.curentTextureIndex = index;
    this.settings.nextTextureIndex = index;
  }

  showThrowDSM = () => {
    TweenLite.fromTo(this.settings, 1, { maskScale: 0 }, { maskScale: 1 });
  }

  hideThrowDSM = () => {
    TweenLite.fromTo(this.settings, 1, { maskScale: 1 }, { maskScale: 0 });
  }

  updateIndexes = (pos) => {
    const diffPoss = pos % (this.textures.length * scrollPerImage);
    let indextexture = Math.floor((diffPoss / scrollPerImage));
    this.settings.curentTextureIndex = indextexture;
    this.settings.nextTextureIndex = (indextexture + 1) % (this.textures.length);
  }

  updateTexture = () => {
    if(this.tex2 !== this.textures[this.settings.curentTextureIndex]) {
      this.tex2 = this.textures[this.settings.curentTextureIndex]
      this.material.uniforms.tex2.value = this.tex2;
    }
    if(this.tex1 !== this.textures[this.settings.nextTextureIndex]) {
      this.tex1 = this.textures[this.settings.nextTextureIndex]
      this.material.uniforms.tex1.value = this.tex1;
    }
  }

  draw = () => {
    requestAnimationFrame(this.draw);
    if (this.settings.scrollPos < scrollPerImage * this.textures.length) {
      this.settings.scrollPos = scrollPerImage * this.textures.length * 10;
    }
    let { scrollPos, maskScale } = this.settings;
    this.updateIndexes(scrollPos);
    this.updateTexture();
    const blend = (scrollPos % scrollPerImage) / scrollPerImage;
    this.material.uniforms.blend.value = blend >= 0 ? blend : 1 - (blend * -1);
    this.material.uniforms.offset.value = (scrollPos % scrollPerImage) / scrollPerImage;
    
    this.material.uniforms.time.value += 0.1;
    this.material.uniforms.maskScale.value = maskScale;
    
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}