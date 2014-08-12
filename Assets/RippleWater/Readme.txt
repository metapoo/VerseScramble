 - Setup

To use Ripple Water, add the 'RippleWater' Component to an empty gameObject. 

The location of the gameObject is where the mesh will be generated. As the mesh is generated at runtime, try parenting a quad to the object to assist with positioning in scene view.

Be sure to give the RippleWater component a material, as this will be applied to the mesh. You can use any material and shader.

 

 - Tweaking

Values for tweaking are all publicly exposed accessable in the Unity Inspector. Although only slight adjustments should be needed from the default values.

For the resolution of the mesh, any value  from 30 to 200 is fine depending on your needs. Much higher than 250 and the mesh will hit the vertex limit.

Try using the demo scene to find good values for your needs.

Be careful when tweaking not to use extreme values as this may produce an undersireable effect.



 - Interacting

Included with RippleWater is a simple, click-interaction script called RippleWaterCam. Simply add this component to your scene's camera, and give the RippleWaterCam component the Transform in your scene with the RippleWater Component.

RippleWaterCam uses a simple raycast method of getting the point of click on the mesh and applying a downward force using the RippleWater.SmoothDepress function. It is a good example for anyone wanting to add their own interaction control methods.