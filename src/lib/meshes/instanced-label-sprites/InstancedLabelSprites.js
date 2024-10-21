import * as THREE from 'three';
export class InstancedLabelSprites {
	/**
	 * @param {THREE.PerspectiveCamera} camera
	 * @param {number} count
	 * @param {THREE.Vector2} labelSize label size as a PlaneGeometry
	 * @param {THREE.Vector2} labelResolution horizontal and vertical pixels for each label
	 * @param {THREE.Vector2} textureResolution horizontal and vertical pixels of the texture
	 */
	constructor(
		camera,
		count = 128,
		labelSize = new THREE.Vector2(4, 2),
		labelResolution = new THREE.Vector2(128, 64),
		textureResolution = new THREE.Vector2(1024, 1024)
	) {
		this.camera = camera;
		this.count = count;
		this.labelResolution = labelResolution;
		this.textureResolution = textureResolution;
		/**
		 * @type {string[] | null}
		 */
		this.labels = new Array(this.count).fill('');
		this.offset = new THREE.Vector2(0, 0.5);
		this.size = 0.03;
		this.needsUpdate = false;
		this._textureDimensions = this.textureResolution.clone().divide(this.labelResolution);
		if (this._textureDimensions.x * this._textureDimensions.y < this.count) {
			console.log(
				'[Warn] Unable to construct a texture that can include all labels. Either decrease the count, decrease the label resolution, or increase the texture resolution.'
			);
		}

		this.geometry = new THREE.PlaneGeometry(labelSize.x, labelSize.y);
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				uOffset: { value: this.offset },
				uSize: { value: this.size },
				uMarkerTexture: {
					value: this._getMarkerTexture(
						this._textureDimensions.x,
						this._textureDimensions.y,
						this.labelResolution.x,
						this.labelResolution.y
					)
				}, // update this in update()
				uTextureDimensions: { value: this._textureDimensions }
			},
			vertexShader: `
            uniform vec2 uOffset;
			uniform vec2 uTextureDimensions;
            uniform float uSize;
			
			varying vec2 vUv;
            varying vec3 vPosition;
			
			void main(){
              // keep things spritey
              vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
              vec2 offset = vec2(uOffset.x, 200.0 /(-mvPosition.z)*0.215 + uOffset.y);
              vec2 offsetPosition = position.xy; offsetPosition.xy += offset;
            
              mvPosition.xy += offsetPosition.xy * uSize * -mvPosition.z;
                
              gl_Position = projectionMatrix * mvPosition;
			  float iID = float(gl_InstanceID);
			  float stepW = 1. / uTextureDimensions.x;
			  float stepH = 1. / uTextureDimensions.y;
			  
			  float uvX = mod(iID, uTextureDimensions.x);
			  float uvY = floor(iID / uTextureDimensions.x);
			  
			  vUv = (vec2(uvX, uvY) + uv) * vec2(stepW, stepH);
			}
		  `,
			fragmentShader: `
			uniform sampler2D uMarkerTexture;

			varying vec2 vUv;
			
			void main(){
			  vec4 col = texture(uMarkerTexture, vUv);
			  gl_FragColor = vec4(col.rgb, 1);
			}
		  `
		});
		this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
		// @ts-ignore
		this.mesh.isInstancedLabelSprites = true;
	}

	/**
	 * @param {number} amountW
	 * @param {number} amountH
	 * @param {number} stepW
	 * @param {number} stepH
	 */
	_getMarkerTexture(amountW, amountH, stepW, stepH) {
		let c = document.createElement('canvas');
		c.width = amountW * stepW;
		c.height = amountH * stepH;
		let ctx = c.getContext('2d');

		if (ctx && this.labels) {
			// ctx.fillStyle = '#000';
			// ctx.fillRect(0, 0, c.width, c.height);

			ctx.font = `400 ${stepH / 2.5}px "Graphik", "Noto Sans TC", "PingFangTC", "Open Sans", arial, sans-serif`;
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#fff';

			// let col = new THREE.Color();

			let counter = 0;
			for (let y = 0; y < amountH && counter < this.count; y++) {
				for (let x = 0; x < amountW && counter < this.count; x++) {
					let textX = (x + 0.5) * stepW;
					let textY = (amountH - y - 1 + 0.5) * stepH;
					ctx.fillText(this.labels[counter], textX, textY);
					counter++;
				}
			}
		}

		let ct = new THREE.CanvasTexture(c);
		ct.colorSpace = THREE.SRGBColorSpace;
		return ct;
	}

	/**
	 * @param {number} index
	 * @param {string} str
	 */
	setLabelAt(index, str) {
		if (this.labels) this.labels[index] = str;
	}

	update() {
		this.material.uniforms.uMarkerTexture.value = this._getMarkerTexture(
			this._textureDimensions.x,
			this._textureDimensions.y,
			this.labelResolution.x,
			this.labelResolution.y
		);
		if (this.needsUpdate) {
			this.material.uniforms.uOffset.value = this.offset;
			this.material.uniforms.uSize.value = this.size;
		}
	}
	dispose() {
		this.mesh.dispose();
		this.geometry.dispose();
		this.material.dispose();
		this.labels = null;
	}
}
