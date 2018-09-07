/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music, Scene } from 'sphere-runtime';

export const mapScripts =
{
	async onEnter(runTime, map)
	{
		Sphere.main.theBatter.frozen = true;
		await Sphere.main.screenMask.fadeTo(Color.Transparent, 0);
		/*await new Scene()
			.talk("Batter", true, 1.0, Infinity,
				"To move my body, use the arrow keys on your keyboard.  To interact with the environment, use the Z key.")
			.run();*/
		Sphere.main.theBatter.frozen = false;
	},
	
	async onExit(runTime, map)
	{
		await Sphere.main.screenMask.fadeTo(Color.Black, 120);
	},

	async onLeaveNorth(runTime, map)
	{
		await Sphere.main.mapEngine.changeMap('maps/zone0-outside.mem');
		Sphere.main.theBatter.x = 160;
		Sphere.main.theBatter.y = 960;
	},
	
	onUpdate() {},
	onRender() {},
};
