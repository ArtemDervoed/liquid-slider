	precision mediump float;
    			precision mediump int;
          uniform float time;
    			uniform float blend;
    			varying vec3 vPosition;
    			varying vec4 vColor;

          uniform sampler2D tex1;
          uniform sampler2D tex2;
          varying vec2 vUv;

          float length = 10.;

          mat2 scale(vec2 _scale){
            return mat2(_scale.x,0.0,
                        0.0,_scale.y);
          }

          mat3 k = mat3(
                   -0.3, 0., 1.,
                   -0.4, 0., 1.,
                  2., 0., 1.
                  );

    			float displaceAmount = 0.3;

    			void main()	{
    				// invert blend;
            float blend2 = 1.-blend;
    				vec4 image1 = texture2D(tex1, vUv);
            vec4 image2 = texture2D(tex2, vUv);

            float t1 = ((image2.r*displaceAmount)*blend)*2.;
            float t2 = ((image1.r*displaceAmount)*blend2)*2.;

            vec4 imageA = texture2D(tex2, vec2(vUv.x, vUv.y-t1))*blend2;
            vec4 imageB = texture2D(tex1, vec2(vUv.x, vUv.y+t2))*blend;

    				gl_FragColor = imageA.bbra * blend + imageA * blend2 +
    				imageB.bbra * blend2 + imageB * blend ;
    				//gl_FragColor = image3

    			}
