"use strict";
class Planet {
  constructor(scene,engine, camera, sun, descr){
    this.scene=scene;
    
    //camera.lowerRadiusLimit = 50;
    //camera.upperRadiusLimit = 500;      
    
    var options={};    
    //options=this.changeBiome("earth");
    options=this.changeBiome(descr.biome||"earth");
    
    // Random texture
    this.random = new BABYLON.DynamicTexture("random", 512, scene, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    this.random2 = new BABYLON.DynamicTexture("random", 512, scene, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);


    // Noise
    this.noiseTexture=null;
    this.cloudTexture=null;

    // Planet
    var SIZE=2130;
    var planet = BABYLON.Mesh.CreateSphere("planet", 64, SIZE, scene);
    planet.renderingGroupId = 1;
    
    var planetImpostor = BABYLON.Mesh.CreateSphere("planetImpostor", 16, SIZE-SIZE/1.1, scene);   //TODO - нужно что то сделать с impostor
    planetImpostor.renderingGroupId = 1;
    
    planetImpostor.parent=planet;        
    planetImpostor.isBlocker = true;
    planetImpostor.material = new BABYLON.StandardMaterial("impostor", scene);

    
    planet.position.z=descr.z;
    planet.position.x=descr.x;
    planet.position.y=descr.y;    
      
    
    // Material
    this.shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
          vertex: "./planet",
          fragment: "./planet",
        },
        {
          attributes: ["position", "normal", "uv"],
          uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
          needAlphaBlending: true
        });
    
    this.shaderMaterial.setVector3("cameraPosition", planet.position);//shaderMaterial.setVector3("cameraPosition", camera.position);
    this.shaderMaterial.setVector3("lightPosition", sun.position);

    planet.material = this.shaderMaterial;

    // Rings
    var rings = BABYLON.Mesh.CreateGround("rings", 60, 60, 1, scene);
    rings.parent = planet;
    var ringsMaterial = new BABYLON.StandardMaterial("ringsMaterial", scene);
    ringsMaterial.diffuseTexture = new BABYLON.Texture("rings.png", scene);
    ringsMaterial.diffuseTexture.hasAlpha = true;
    ringsMaterial.backFaceCulling = false;
    rings.material = ringsMaterial;
    rings.receiveShadows = true;
    this.rings=rings;
    this.ringsMaterial=ringsMaterial;

    // Shadow generator
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, sun);
    shadowGenerator.getShadowMap().renderList.push(planetImpostor);
    shadowGenerator.setDarkness(0.3);
    shadowGenerator.usePoissonSampling = true;

    // Rotation
    var angle = 0;
    scene.registerBeforeRender(()=>{
        var ratio = scene.getAnimationRatio()
        planet.rotation.y += 0.001 * ratio;

        this.shaderMaterial.setMatrix("rotation", BABYLON.Matrix.RotationY(angle));
        angle -= 0.0004 * ratio;

        this.shaderMaterial.setVector3("options", new BABYLON.Vector3(options.clouds, options.groundAlbedo, options.cloudAlbedo));
    });
    
    
    this.generateBiome(options);
  }    

  generateBiome(options){    
    if (this.noiseTexture) {
      this.noiseTexture.dispose();
      this.cloudTexture.dispose();
    }

    this.updateRandom(this.random);
    this.updateRandom(this.random2);

    // Noise
    this.noiseTexture = new BABYLON.ProceduralTexture("noise", options.mapSize, "./noise", this.scene, null, true, true);
    this.noiseTexture.setColor3("upperColor", options.upperColor);
    this.noiseTexture.setColor3("lowerColor", options.lowerColor);
    this.noiseTexture.setFloat("mapSize", options.mapSize);
    this.noiseTexture.setFloat("maxResolution", options.maxResolution);
    this.noiseTexture.setFloat("seed", options.seed);
    this.noiseTexture.setVector2("lowerClamp", options.lowerClamp);
    this.noiseTexture.setTexture("randomSampler", this.random);
    this.noiseTexture.setVector2("range", options.range);
    this.noiseTexture.setVector3("options", new BABYLON.Vector3(options.directNoise ? 1.0 : 0, options.lowerClip.x, options.lowerClip.y));
    this.noiseTexture.refreshRate = 0;

    this.shaderMaterial.setTexture("textureSampler", this.noiseTexture);

    // Cloud
    this.cloudTexture = new BABYLON.ProceduralTexture("cloud", options.mapSize, "./noise", this.scene, null, true, true);
    this.cloudTexture.setTexture("randomSampler", this.random2);
    this.cloudTexture.setFloat("mapSize", options.mapSize);
    this.cloudTexture.setFloat("maxResolution", 256);
    this.cloudTexture.setFloat("seed", options.cloudSeed);
    this.cloudTexture.setVector3("options", new BABYLON.Vector3(1.0, 0, 1.0));
    this.cloudTexture.refreshRate = 0;
    
    this.shaderMaterial.setTexture("cloudSampler", this.cloudTexture);
    this.shaderMaterial.setColor3("haloColor", options.haloColor);
    this.engageRings(options);
  }
  
  updateRandom (random) {
    var context = random.getContext();

    var data = context.getImageData(0, 0, 512, 512);

    for (var i = 0; i < 512 * 512 * 4; i++) {
      data.data[i] = (Math.random() * 256) | 0;
    }

    context.putImageData(data, 0, 0);
    random.update();
  }
  
  engageRings(options) {
    this.rings.setEnabled(options.rings);
    this.ringsMaterial.diffuseColor = options.ringsColor;
    this.scene.shadowsEnabled = options.rings;
  }
  
  changeBiome(biome){
    var options={};
    options.mapSize= 1024;
    
    switch (biome) {
            case "earth":
                options.biomes= "earth";
                options.clouds= true;
                options.mapSize= 1024;
                options.upperColor= new BABYLON.Color3(0.0, 1.0, 0.5);
                options.lowerColor= new BABYLON.Color3(0, 0.2, 1.0);
                options.haloColor= new BABYLON.Color3(0, 0.2, 1.0);
                options.maxResolution= 512;
                options.seed= 0.30;
                options.cloudSeed= 0.55;
                options.lowerClamp= new BABYLON.Vector2(0.6, 1);
                options.groundAlbedo= 1.2;
                options.cloudAlbedo= 1.0;
                options.rings= false;
                options.ringsColor= new BABYLON.Color3(0.6, 0.6, 0.6);
                options.directNoise= false;
                options.lowerClip= new BABYLON.Vector2(0, 0);
                options.range= new BABYLON.Vector2(0.3, 0.35);
                break;
            case "volcanic":
                options.upperColor = new BABYLON.Color3(0.9, 0.45, 0.45);
                options.lowerColor = new BABYLON.Color3(1.0, 0, 0);
                options.haloColor = new BABYLON.Color3(1.0, 0, 0.3);
                options.seed = 0.30;
                options.cloudSeed = 0.60;
                options.clouds = false;
                options.lowerClamp = new BABYLON.Vector2(0, 1);
                options.maxResolution = 256;
                options.cloudAlbedo = 0;
                options.groundAlbedo = 1.0;
                options.rings = false;
                options.directNoise = false;
                options.lowerClip = new BABYLON.Vector2(0, 0);
                options.range = new BABYLON.Vector2(0.3, 0.4);
                break;
            case "jungle":
                options.upperColor = new BABYLON.Color3(0.1, 0.6, 0.4);
                options.lowerColor = new BABYLON.Color3(0, 1.0, 0.1);
                options.haloColor = new BABYLON.Color3(0.5, 1.0, 0.5);
                options.seed = 0.40;
                options.cloudSeed = 0.70;
                options.clouds = true;
                options.lowerClamp = new BABYLON.Vector2(0, 1);
                options.maxResolution = 512;
                options.cloudAlbedo = 1.0;
                options.groundAlbedo = 1.1;
                options.rings = false;
                options.directNoise = false;
                options.lowerClip = new BABYLON.Vector2(0, 0);
                options.range = new BABYLON.Vector2(0.2, 0.4);
                break;
            case "icy":
                options.upperColor = new BABYLON.Color3(1.0, 1.0, 1.0);
                options.lowerColor = new BABYLON.Color3(0.7, 0.7, 0.9);
                options.haloColor = new BABYLON.Color3(1.0, 1.0, 1.0);
                options.seed = 0.80;
                options.cloudSeed = 0.40;
                options.clouds = true;
                options.lowerClamp = new BABYLON.Vector2(0, 1);
                options.maxResolution = 256;
                options.cloudAlbedo = 1.0;
                options.groundAlbedo = 1.1;
                options.rings = true;
                options.ringsColor = new BABYLON.Color3(0.6, 0.6, 0.6);
                options.directNoise = false;
                options.lowerClip = new BABYLON.Vector2(0, 0);
                options.range = new BABYLON.Vector2(0.3, 0.4);
                break;
            case "desert":
                options.upperColor = new BABYLON.Color3(0.9, 0.30, 0);
                options.lowerColor = new BABYLON.Color3(1.0, 0.5, 0.1);
                options.haloColor = new BABYLON.Color3(1.0, 0.5, 0.1);
                options.seed = 0.18;
                options.cloudSeed = 0.60;
                options.clouds = false;
                options.lowerClamp = new BABYLON.Vector2(0.3, 1);
                options.maxResolution = 512;
                options.cloudAlbedo = 1.0;
                options.groundAlbedo = 1.0;
                options.rings = false;
                options.directNoise = false;
                options.lowerClip = new BABYLON.Vector2(0, 0);
                options.range = new BABYLON.Vector2(0.3, 0.4);
                break;
            case "islands":
                options.upperColor = new BABYLON.Color3(0.4, 2.0, 0.4);
                options.lowerColor = new BABYLON.Color3(0, 0.2, 2.0);
                options.haloColor = new BABYLON.Color3(0, 0.2, 2.0);
                options.seed = 0.15;
                options.cloudSeed = 0.60;
                options.clouds = true;
                options.lowerClamp = new BABYLON.Vector2(0.6, 1);
                options.maxResolution = 512;
                options.cloudAlbedo = 1.0;
                options.groundAlbedo = 1.2;
                options.rings = false;
                options.directNoise = false;
                options.lowerClip = new BABYLON.Vector2(0, 0);
                options.range = new BABYLON.Vector2(0.2, 0.3);
                break;
            case "moon":
                options.haloColor = new BABYLON.Color3(0, 0, 0);
                options.seed = 0.5;
                options.clouds = false;
                options.maxResolution = 256;
                options.groundAlbedo = 0.7;
                options.rings = false;
                options.directNoise = true;
                options.lowerClip = new BABYLON.Vector2(0.5, 0.9);
                break;
        }
        
        return options;
  }

}

/*function makePlanet(scene,engine, camera, sun){    
    
    
}*/
