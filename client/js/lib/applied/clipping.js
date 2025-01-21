const clipping = {
   init,
};

const {
   PI,
} = Math;

function createClippingPlane() {
   const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

   return plane;
};

function createPlaneHelper(plane) {
   const plane_helper = new THREE.PlaneHelper(plane, 2, 0xffffff);

   return plane_helper;
};

function createPlaneMask() {
   const
      geometry = new THREE.PlaneGeometry(4, 4),
      material =
         new THREE.MeshStandardMaterial({
            color: 0x1EDD1E,
            metalness: 0.1,
            roughness: 0.75,

            stencilWrite: true,
            stencilRef: 0,
            stencilFunc: THREE.NotEqualStencilFunc,
            stencilFail: THREE.ReplaceStencilOp,
            stencilZFail: THREE.ReplaceStencilOp,
            stencilZPass: THREE.ReplaceStencilOp,
         });

   const plane_mask = new THREE.Mesh(geometry, material);
   plane_mask.renderOrder = 1.1;

   return plane_mask
};


function createPlaneStencilGroup(geometry, plane, renderOrder) {
   const
      group = new THREE.Group(),
      baseMat = new THREE.MeshBasicMaterial();

   baseMat.depthWrite = false;
   baseMat.depthTest = false;
   baseMat.colorWrite = false;
   baseMat.stencilWrite = true;
   baseMat.stencilFunc = THREE.AlwaysStencilFunc;

   // back faces
   const mat0 = baseMat.clone();
   mat0.side = THREE.BackSide;
   mat0.clippingPlanes = [plane];
   mat0.stencilFail = THREE.IncrementWrapStencilOp;
   mat0.stencilZFail = THREE.IncrementWrapStencilOp;
   mat0.stencilZPass = THREE.IncrementWrapStencilOp;

   const mesh0 = new THREE.Mesh(geometry, mat0);
   mesh0.renderOrder = renderOrder;
   group.add(mesh0);

   // front faces
   const mat1 = baseMat.clone();
   mat1.side = THREE.FrontSide;
   mat1.clippingPlanes = [plane];
   mat1.stencilFail = THREE.DecrementWrapStencilOp;
   mat1.stencilZFail = THREE.DecrementWrapStencilOp;
   mat1.stencilZPass = THREE.DecrementWrapStencilOp;

   const mesh1 = new THREE.Mesh(geometry, mat1);
   mesh1.renderOrder = renderOrder;

   group.add(mesh1);

   return group;
};

function createBox() {
   const
      geometry = new THREE.BoxGeometry(1, 1, 1),
      material = new THREE.MeshStandardMaterial({
         color: 0xFFC107,
         metalness: 0.1,
         roughness: 0.75,
      });

   const box = new THREE.Mesh(geometry, material);

   return box;
};

function createTorus() {
   const
      geometry = new THREE.BoxGeometry(1, 1, 1),
      material = new THREE.MeshStandardMaterial({
         color: 0xFFC107,
         metalness: 0.1,
         roughness: 0.75,
      });

   const box = new THREE.Mesh(geometry, material);
   return box;
};

// function init() {
//    const { scene } = THREE_APP.system;

//    // const geometry = new THREE.BoxGeometry(1, 1, 1);
//    const geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 220, 60);

//    const clipping_plane = createClippingPlane();
//    const plane_helper = createPlaneHelper(clipping_plane);
//    const plane_mask = createPlaneMask();
//    const stencilGroup = createPlaneStencilGroup(geometry, clipping_plane, 1);

//    const material = new THREE.MeshStandardMaterial({
//       color: 0xFFC107,
//       metalness: 0.1,
//       roughness: 0.75,
//       clippingPlanes: [clipping_plane],
//    });

//    const model = new THREE.Mesh(geometry, material);

//    plane_mask.renderOrder = 1.1;

//    scene.add(stencilGroup);
//    scene.add(plane_helper);
//    scene.add(plane_mask);
//    scene.add(material);
//    scene.add(model);
// };

export default clipping;