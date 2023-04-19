import {
    AbstractMesh, ActionManager,
    ArcRotateCamera, CannonJSPlugin,
    Engine,
    HemisphericLight,
    MeshBuilder, PhysicsImpostor,
    Scene,
    SceneLoader, SetValueAction,
    StandardMaterial,
    Texture,
    Vector3
} from "@babylonjs/core";
import '@babylonjs/loaders';
import * as CANNON from 'cannon';
import {h} from "vue";


export class Game {
    scene: Scene;
    engine: Engine;
    camera: ArcRotateCamera;


    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true, {stencil: true}, true);
        this.scene = this.CreateScene();
        this.camera = this.CreateCamera();
        this.CreateGround();
        this.CreateHero();
        this.CreateImpostors();


        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 5, 0), this.scene);
        hemiLight.intensity = 1;

        scene.onPointerDown = (event) => {
            if (event.button === 0) this.engine.enterPointerlock();
            if (event.button === 1) this.engine.exitPointerlock();
        };

        const framesPerSecond = 60;
        const gravity = -9.81;
        scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);
        scene.collisionsEnabled = true;

        scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin(true, 10, CANNON))

        return scene;
    }


    CreateGround(): void {
        const ground = MeshBuilder.CreateGround('ground', {width: 1000, height: 1000}, this.scene);
        ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor,
            {mass: 0, friction: 0, restitution: 0});
        ground.checkCollisions = true;
        ground.material = this.CreateGroundMaterial();
    }

    CreateGroundMaterial(): StandardMaterial {
        const groundMat = new StandardMaterial('groundMat', this.scene);


        const uvScale = 10;
        const texArray: Texture[] = [];

        const diffuseTex = new Texture('./textures/ground/diff_ground.jpg', this.scene);

        groundMat.diffuseTexture = diffuseTex;
        texArray.push(diffuseTex);

        const normalTex = new Texture('./textures/ground/nor_ground.jpg', this.scene);
        groundMat.bumpTexture = normalTex;
        texArray.push(normalTex);

        const aoTex = new Texture('./textures/ground/ao_ground.jpg', this.scene);
        groundMat.ambientTexture = aoTex;
        texArray.push(aoTex);

        const specTex = new Texture('./textures/ground/arm_ground.jpg', this.scene);
        groundMat.specularTexture = specTex;
        texArray.push(specTex);

        texArray.forEach((tex) => {
            tex.uScale = uvScale;
            tex.vScale = uvScale;
        });

        return groundMat;
    }

    CreateCamera(): ArcRotateCamera {
        // const camera = new FreeCamera('camera', new Vector3(-10, 20, 10), this.scene);
        // camera.attachControl();
        //
        // camera.applyGravity = true;
        // camera.checkCollisions = true;
        //
        // camera.ellipsoid = new  Vector3(1,5,1);
        //
        // camera.minZ = 0.45;
        // camera.speed = 1;
        // camera.angularSensibility = 4000;
        //
        //
        // camera.keysUp.push(87);
        // camera.keysDown.push(83);
        // camera.keysLeft.push(65);
        // camera.keysRight.push(68);
        this.camera = new ArcRotateCamera('camera', 0, 0, 15, Vector3.Zero(), this.scene)
        this.camera.attachControl(this.canvas, true)
        return this.camera

    }

    async CreateHero(): Promise<void> {
        const hero = await SceneLoader.ImportMeshAsync('', './models/', 'heros/knight/knight1.glb', this.scene)
        const heroMash = hero.meshes[0]
        heroMash.position = new Vector3(0, 10.5, 0)
        this.camera.setTarget(heroMash)

        const boxHero = MeshBuilder.CreateBox('boxHero', {width: 4, height: 12, depth: 4});
        boxHero.position.y = 6;
        boxHero.visibility = 0.25;

        boxHero.physicsImpostor = new PhysicsImpostor(boxHero, PhysicsImpostor.SoftbodyImpostor,
            {
                mass: 1,
                restitution: 0
            });

        // heroMash.parent = boxHero;
        heroMash.setParent(boxHero);

        boxHero.physicsImpostor.setDeltaPosition(new Vector3(0,1,0));



        // heroMash.physicsImpostor = new PhysicsImpostor(heroMash, PhysicsImpostor.CylinderImpostor,
        //     {mass: 0, friction: 0, restitution: 0})
    }

    CreateImpostors(): void {
        const box = MeshBuilder.CreateBox('box', {size: 2});
        box.position = new Vector3(0, 10, 10);
        box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor,
            {mass: 1, friction: 0, restitution: 5});

    }
}