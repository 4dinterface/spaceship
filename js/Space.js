"use strict";

class Space{
  
  constructor(scene, engine, camera){
    console.log("cmera.maxZ", camera.maxZ)
    this.scene=scene;
    this.camera=camera;
    this.engine=engine;
    
    this.makeSkybox();
    this.makeSun();    
  }
  
  update(camera, shape){            
    /*this.skybox.position.x=shape.position.x;
    this.skybox.position.y=shape.position.y;
    this.skybox.position.z=shape.position.z;*/
    
    /*this.sun.mesh.position.x=shape.position.x;
    this.sun.mesh.position.y=shape.position.y;
    this.sun.mesh.position.z=shape.position.z+1000;*/
  }    
  
  makeSkybox(){    
     var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000000.0, this.scene);
     //skybox.renderingGroupId = 0;    
     skybox.infiniteDistance=true;        
     var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);    
     skyboxMaterial.backFaceCulling = false;
     var files = [
          "./Space/space_left.jpg",
          "./Space/space_up.jpg",
          "./Space/space_front.jpg",
          "./Space/space_right.jpg",
          "./Space/space_down.jpg",
          "./Space/space_back.jpg",
     ];
     skyboxMaterial.reflectionTexture = BABYLON.CubeTexture.CreateFromImages(files, this.scene);
     skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
     skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
     skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
     skyboxMaterial.disableLighting = true;
     skybox.material = skyboxMaterial;    
     this.skybox= skybox;
  }
  
  makeSun(){
    /*var emitter = new BABYLON.VolumetricLightScatteringPostProcess('godrays', { passRatio: 0.5, postProcessRatio:1 }, this.camera, null, 30, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.engine, false);
    emitter.mesh.material.diffuseTexture = new BABYLON.Texture("sun.png", this.scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    emitter.mesh.material.diffuseTexture.hasAlpha = true;          
    emitter.mesh.scaling = new BABYLON.Vector3(200, 200, 200);
    emitter.mesh.position = new BABYLON.Vector3(0,0,10000); 
    emitter.mesh.renderingGroupId = 1;
    //emitter.mesh.infiniteDistance=true;        
    this.sun=emitter;    */
    
    this.sun=new Star({z:-2000},this.scene);
    //this.sun.mesh.renderingGroupId=1;
    this.sun.mesh.position.z=200000;
    
    this.sunLight = new BABYLON.PointLight("sun", new BABYLON.Vector3(0, 0, 1000), this.scene);
    this.sunLight.renderingGroupId = 1;
  }  
}