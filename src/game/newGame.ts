import {
    Engine,
    FreeCamera,
    HemisphericLight, Matrix, Mesh,
    MeshBuilder,
    PhysicsImpostor, PointerEventTypes, Quaternion, Scalar,
    Scene,
    SceneLoader, StandardMaterial, Texture,
    Vector3,
    Ray
} from "@babylonjs/core";
import '@babylonjs/loaders';

export class NewGame {
    scene: Scene;
    engine: Engine;
    pickedPoint: any;
    targetPoint: any;
    root: any;
    MAP_SIZE: number;
    ground: any

    constructor(private canvas: HTMLCanvasElement) {
        this.MAP_SIZE = 700;
        this.engine = new Engine(this.canvas, true, {stencil: true}, true);
        this.scene = this.CreateScene();
        this.CreateGround();
        this.createMarket();
        this.createMainHero();
        this.createTree();


        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // window.addEventListener("keydown", (event) => {
        //     if (event.shiftKey && event.ctrlKey && event.altKey && event.keyCode === 73) {
        //         if (this.scene.debugLayer.isVisible()) {
        //             console.log('1')
        //             this.scene.debugLayer.hide();
        //         } else {
        //             console.log('2')
        //             this.scene.debugLayer.show({overlay: true});
        //         }
        //     }
        // })
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        const camera = new FreeCamera("camera", new Vector3(0, 1, -5), this.scene);
        camera.minZ = 0.01;
        camera.attachControl();

        const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 1;

        return scene;
    }

    CreateGround(): void {
        this.ground = MeshBuilder.CreateGround('ground', {width: this.MAP_SIZE, height: this.MAP_SIZE}, this.scene);
        // ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor,
        //     {mass: 0, friction: 0, restitution: 0});
        // ground.checkCollisions = true;
        this.ground.material = this.CreateGroundMaterial();
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


    async createMarket(): Promise<void> {
        await SceneLoader.ImportMeshAsync(
            '',
            "./models/",
            "gameModel/build/build/glTF/Market_FirstAge_Level1.gltf",
            this.scene
        ).then((res) => {
            [this.root] = res.meshes;
            this.root.scaling.setAll(10)
        })
    }

    async createMainHero(): Promise<void> {
        await SceneLoader.ImportMeshAsync(
            '',
            "./models/",
            "gameModel/heros/heros/glTF/Knight_Golden_Male.gltf",
            this.scene
        ).then((res) => {
            [this.root] = res.meshes;
            const playHero = () => {
                res.animationGroups.forEach((ag) => {
                    if (ag.name === 'Idle') {
                        ag.start(true);
                    } else {
                        ag.stop();
                    }
                })
            }

            const playRunHero = () => {
                res.animationGroups.forEach((ag) => {
                    if (ag.name === 'Run') {
                        ag.start(true);
                    } else {
                        ag.stop();
                    }
                })
            }
            playHero()

            this.root.rotationQuaternion = Quaternion.Identity()

            this.targetPoint = this.root.position.clone()
            const targetRotation = this.root.rotationQuaternion.clone()


            this.scene.onPointerObservable.add(eventData => {
                if (eventData.type !== PointerEventTypes.POINTERPICK) return;

                const pickedMesh = eventData.pickInfo?.pickedMesh;
                if (pickedMesh == null) return;

                this.pickedPoint = eventData.pickInfo?.pickedPoint;
                if (this.pickedPoint == null) return;

                if (pickedMesh.name == 'ground') {
                    this.targetPoint.copyFrom(this.pickedPoint);
                }

                const dir = this.targetPoint.subtract(this.root.position).normalize()
                targetRotation.copyFrom(
                    Quaternion.FromLookDirectionLH(dir, this.root.up)
                )
            })

            this.scene.onBeforeRenderObservable.add(() => {
                const rotLerpSpeed = 40;
                const deltaTime = (this.scene.deltaTime ?? 1) / 10000;
                Quaternion.SlerpToRef(
                    this.root.rotationQuaternion,
                    targetRotation,
                    rotLerpSpeed * deltaTime,
                    this.root.rotationQuaternion
                )

                const diff = this.targetPoint.subtract(this.root.position);

                const speed = 4;

                const maxDelta = speed * 0.01

                if (diff.length() < maxDelta) {
                    playHero();
                    return;
                }

                playRunHero();
                const dir = diff.normalize();

                const velocity = dir.scaleInPlace(speed * deltaTime);

                this.root.position = Vector3.Lerp(this.root.position, this.targetPoint, speed * deltaTime)
                this.root.position.addInPlace(velocity)

            })
        })

    }

    async createTree(): Promise<void> {
        await SceneLoader.ImportMeshAsync(
            null,
            "./models/",
            "gameModel/build/build/glTF/Resource_PineTree_Group.gltf",
            this.scene,
        ).then((result) => {
            const mesh = result.meshes[0] as Mesh;
            mesh.scaling.setAll(10);
            const merged = mesh

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merged.isPickable = false

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merged.checkCollisions = false

            const COUNT = 100
            const offset = 5
            const max = this.MAP_SIZE / 2 - 2 - offset;

            const getPos = () =>
                (offset + Math.random() * max) * (Math.random() > 0.5 ? 1 : -1);


            for (let i = 0; i < COUNT; i++) {
                // const clone = merged.createInstance('inst_' + i)

                const clone = merged.clone()
                const x = getPos()
                const z = getPos()

                clone?.position.set(x, 0, z)
                clone?.scaling.setAll(Scalar.RandomRange(2, 10))
                clone?.freezeWorldMatrix()
                clone?.material?.freeze()


                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore

                clone?.alwaysSelectAsActiveMesh = true
            }

        })
    }

}
