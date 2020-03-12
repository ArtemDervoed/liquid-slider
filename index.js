import * as THREE from 'three';

const a = 'https://images.prismic.io/cusp/7bfcdab3-8c43-4558-9417-d6b431730083_cleannow_next.jpg?auto=compress,format'
const b = 'https://images.prismic.io/cusp/f251334f-6a36-43c6-b55c-d84e3d4a0555_1-min.jpg?auto=compress,format'
const c = 'https://images.prismic.io/cusp/528c9ee2-a14a-4787-9a55-621a61dd61a2_lifemessy_preview.jpg?auto=compress,format'
const d = 'https://images.prismic.io/cusp/93995c93-8dfe-4f3f-b0d7-727c20c758db_81b79566090147.5b249527da157.jpg?auto=compress,format'
const e = 'https://images.prismic.io/cusp/43da11bd-03f5-426f-804b-c79112adf8a3_sprout.jpg?auto=compress,format'
const f = 'https://images.prismic.io/cusp/ca9636a5-0dec-45e7-ad5a-d32bb15ac63f_factory_preview_main.jpg?auto=compress,format'
const g = 'https://images.prismic.io/cusp/6a352978-a03a-4a25-98ab-50f46a0f50a7_iStock-915736424-min.jpg?auto=compress,format'
const mask = 'https://cusp-v2.snpdev.ru/assets/ds_map.30a87786.png';
import ImageSlider from './ImageSlider';

const images = [a, b, c, d, e, f, g];

function makeThreeTexture(image) {
  let tex = new THREE.Texture(image);
          tex.needsUpdate = true;
  return tex
}

function loadMask(maskUrl)  {
  return new Promise((resolve, reject) => {
    let img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = maskUrl;
    img.onload = image => {
      return resolve(image.target);
    };
  }).then(makeThreeTexture)
}

function loadImages(data) {
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
      }).then(makeThreeTexture)
    );
  }
  return Promise.all(promises);
}

window.onload = () => {
  const a = loadImages(images).then((textures) => {
    document.getElementById("loading").style = "display: none;";
    const myImageSlider = new ImageSlider(textures);
    loadMask(mask).then(maskTextureLoaded => {
      myImageSlider.init(maskTextureLoaded);
      myImageSlider.setDsmTexture();
      myImageSlider.draw();

      document.getElementById('ds-hide').onclick = myImageSlider.hideThrowDSM;
      document.getElementById('ds-show').onclick = myImageSlider.showThrowDSM;
      document.getElementById('set-5th-texture').onclick = myImageSlider.setNewtexture.bind(this, 5);
    });
  });
}