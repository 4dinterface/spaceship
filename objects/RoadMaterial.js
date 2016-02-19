"use strict";
class RoadMaterial extends BABYLON.ShaderMaterial{
	constructor(conf, scene){
    super("shaderroad", scene, {
      vertex: "./objects/road",//custom",
      fragment: "./objects/road"//"custom"
    },
    {
      needAlphaBlending: true, //Эксперемент
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "backgroundColor", "color", "speed" ,"brightness"]      
    });
            
    this.scene=scene;
            
    //var mainTexture = new BABYLON.Texture("./demo/tex09.jpg", scene);
    //this.setTexture("textureSampler", mainTexture);                
    this.setFloat("time", 0);
    
    this.setFloat("speed", 0.5);
    this.setFloat("brightness", 1);
    this.setVector3("backgroundColor", new BABYLON.Vector3(0,0.1,0));
    this.setVector3("color", new BABYLON.Vector3(0,1,0.1));    
    
    this.setVector3("cameraPosition", BABYLON.Vector3.Zero());
    this.backFaceCulling = false;    
          
    scene.registerBeforeRender(this.update.bind(this));
    this.time=0;
  } 
          
  update(){            
    this.setFloat("time", this.time);                
    //this.setVector3("cameraPosition", scene.activeCamera.position);    
    this.time += 0.01;               
  };          
}