class Game {
    constructor() {
        this.scene = new THREE.Scene()
        this.bufferScene = new THREE.Scene()
        this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight /- 2, 1, 1000)
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.stats = new Stats()
        this.shaders = []
        this.textures = {}
        this.frame = 1
        this.initialSpawnRate = 0.8
        this.currentScale = 1
        this.slowmotion = false

        this.planeMesh = null
        this.bufferPlaneMesh = null

        this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setClearColor(0x000000, 1)

        document.body.appendChild(this.renderer.domElement)
        document.body.appendChild(this.stats.dom)

        this.renderer.domElement.style["image-rendering"] = "pixelated"
        this.renderer.domElement.style.transition = "transform 0.2s ease"

        window.addEventListener('resize', () => this.windowResize(), false)

        this.camera.position.z = 2

        this.initShaders(['shader.vert', 'shader.frag'], () => {
            this.initGeometry()
            this.render()
        })

        this.initGui()

        this.renderer.domElement.addEventListener("wheel", (e) => this.onMouseWheel(e))
    }

    initGui() {
        let resetBt = document.createElement("button")
        resetBt.innerHTML = "reset"
        resetBt.style.position = "absolute"
        resetBt.style.right = "20px"
        resetBt.style.top = "50px"
        resetBt.addEventListener("click", () => {
            this.bufferPlaneMesh.material.uniforms.initState.value = 1
        })
        document.body.appendChild(resetBt)

        let slowmotionBt = document.createElement("button")
        slowmotionBt.innerHTML = "Toggle slowmotion"
        slowmotionBt.style.position = "absolute"
        slowmotionBt.style.right = "20px"
        slowmotionBt.style.top = "20px"
        slowmotionBt.addEventListener("click", () => {
            this.slowmotion = !this.slowmotion
        })
        document.body.appendChild(slowmotionBt)
    }

    onMouseWheel(e) {
        let zoomDirection = e.deltaY > 0 ? -1 : 1;
        let loc = { x: e.pageX, y: e.pageY }
        let oldScale = this.currentScale

        if (zoomDirection > 0) {
            this.currentScale += 1;
        } else {
            this.currentScale -= 1;
        }

        this.currentScale = Math.max(1, Math.min(5, this.currentScale))

        let widthDiff =  window.innerWidth * this.currentScale - window.innerWidth * oldScale
        let heightDiff =  window.innerHeight * this.currentScale - window.innerHeight * oldScale
        let transform = {
            x: widthDiff * -0.5,
            y: heightDiff * -0.5
        }
        this.renderer.domElement.style["transform-origin"] = loc.x+"px "+loc.y+"px"
        this.renderer.domElement.style.transform = "scale("+this.currentScale+")"
    }

    windowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    initShaders(fileList, callback) {
        var leftToFetch = fileList.length

        this.shaders = {}

        for (var i = 0; i < fileList.length; i++) {
            ajax.get(fileList[i], null, (data, file) => {
                this.shaders[file] = data
                leftToFetch -= 1
                if (leftToFetch === 0) callback()
            })
        }
    }

    initGeometry() {
        this.textures.textureA = (new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter}))
        this.textures.textureB = (new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter}))

        let planeGeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight)

        let bufferMaterial = new THREE.ShaderMaterial({
            uniforms: {
                bufferTexture: { type: "t", value: this.textures.textureA.texture },
                res : { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                frame : { type: 'f', value: 1.0 },
                initState : { type: 'f', value: 1.0 },
                initialSpawnRate : { type: 'f', value: this.initialSpawnRate }
            },
        	vertexShader: this.shaders['shader.vert'],
        	fragmentShader: this.shaders['shader.frag']
        });

        this.bufferPlaneMesh = new THREE.Mesh(planeGeometry, bufferMaterial)
        this.bufferScene.add(this.bufferPlaneMesh)
        window.a = this.bufferPlaneMesh

        let planeMaterial =  new THREE.MeshBasicMaterial({ map: this.textures.textureB.texture })
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
        this.scene.add(this.planeMesh)
    }

    update() {
        this.renderer.render(this.bufferScene, this.camera, this.textures.textureB, true)

        //Swap textureA and B
        let tmp = this.textures.textureA
        this.textures.textureA = this.textures.textureB
        this.textures.textureB = tmp

        this.planeMesh.material.map = this.textures.textureB.texture

        this.planeMesh.material.map = this.textures.textureB.texture
        this.bufferPlaneMesh.material.uniforms.bufferTexture.value = this.textures.textureA.texture

        this.frame++

        this.bufferPlaneMesh.material.uniforms.frame.value = this.frame
        this.bufferPlaneMesh.material.uniforms.initState.value = 0
    }

    render() {
        if (this.slowmotion) {
            setTimeout(() => this.render(), 200)
        } else {
	       requestAnimationFrame(() => this.render())
       }

        this.update()

    	this.renderer.render(this.scene, this.camera)
        this.stats.update()
        this.planeMesh.material.needsUpdate = true
    }
}
