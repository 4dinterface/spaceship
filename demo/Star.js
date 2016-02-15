        "use strict";
      
        //SunMaterial
        class SunMaterial extends BABYLON.ShaderMaterial{
          constructor(conf, scene){
            super("shader", scene, {
                vertex: "./demo/sun",//custom",
                fragment: "./demo/sun"//"custom"
              },
              {
                needAlphaBlending: true, //Эксперемент
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            })
            
            this.scene=scene;
            
            var mainTexture = new BABYLON.Texture("./demo/tex09.jpg", scene);
            this.setTexture("textureSampler", mainTexture);                
            this.setFloat("time", 0);
            this.setVector3("cameraPosition", BABYLON.Vector3.Zero());
            this.backFaceCulling = false;    
            
            scene.registerBeforeRender(this.update.bind(this));
            this.time=0;
          } 
          
          update(){            
            this.setFloat("time", this.time);                
            this.setVector3("cameraPosition", scene.activeCamera.position);              
            this.time += 0.006;               
          };
          
        }


      
        //STAR
        class Star{
          constructor(conf, scene){
            var shaderMaterial=new SunMaterial(conf,scene);
            var plane = BABYLON.Mesh.CreatePlane("plane", 50000, scene);            
            //var plane = BABYLON.Mesh.CreateSphere("plane", 100, 50000, scene);            
            
            plane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
            
            //plane.rotation.y=3.14/2;        
            //plane.position.z=2000;//conf.z;
            //plane.position.x=0;
            //plane.position.z=0;
            
            
            
            plane.material = shaderMaterial;
            this.mesh=plane;            
          }
          
        }