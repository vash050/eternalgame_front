import {Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3} from "@babylonjs/core";

export  class FirstControll {
    scene: Scene;
    engine: Engine;
    constructor(private canvas:HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateScene();
    this.CreateGround();
    this.CreateController();

    this.engine.runRenderLoop(()=>{
        this.scene.render();
    });
    }

    CreateScene():Scene {
        const scene = new Scene(this.engine);
        const hemiLight = new HemisphericLight('hemiLight', new Vector3(0,1,0), this.scene);
        hemiLight.intensity = 0.5;



        scene.onPointerDown = (event)=>{
            if(event.button === 0) this.engine.enterPointerlock();
            if(event.button === 1) this.engine.exitPointerlock();
        };

        const framesPerSecond = 60;
        const gravity = -9.81;
        scene.gravity = new Vector3(0, gravity/framesPerSecond, 0);
        scene.collisionsEnabled = true;

        return scene;
    }

    CreateGround(): void {
        const ground = MeshBuilder.CreateGround('ground', {width:100, height:100}, this.scene);
        ground.checkCollisions = true;
    }

    CreateController(): void {
        const camera = new FreeCamera('camera', new Vector3(0, 10, 0), this.scene);
        camera.attachControl();

        camera.applyGravity = true;
        camera.checkCollisions = true;

        camera.ellipsoid = new  Vector3(1,1,1);

        camera.minZ = 0.45;
        camera.speed = 0.75;
        camera.angularSensibility = 4000;


        camera.keysUp.push(87);
        camera.keysDown.push(65);
        camera.keysLeft.push(83);
        camera.keysRight.push(68);
    }
}