import {Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3} from "@babylonjs/core";
import '@babylonjs/loaders'


export  class CustomModels {
    scene: Scene;
    engine: Engine;
    constructor(private canvas:HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateScene();
    this.CreateHero();

    this.engine.runRenderLoop(()=>{
        this.scene.render();
    });
    }

    CreateScene():Scene {
        const scene = new Scene(this.engine);
        const camera = new FreeCamera("camera", new Vector3(0,1,-5), this.scene);
        camera.attachControl();

        const hemiLight = new HemisphericLight('hemiLight', new Vector3(0,1,0), this.scene);
        hemiLight.intensity = 0.5;

        const ground = MeshBuilder.CreateGround('ground', {width:10, height:10  }, this.scene);
        const ball = MeshBuilder.CreateSphere('ball', {diameter: 1}, this.scene);


        ball.position = new Vector3(0,1,0);

        return scene;
    }

    CreateHero(): void{
        SceneLoader.ImportMesh('', './models/', '22-trees_9_obj/trees9.obj', this.scene, (meshes)=>{
            console.log('meshes', meshes);
        })
    }
}