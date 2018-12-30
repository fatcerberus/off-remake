/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music, Random, Scene } from 'sphere-runtime';

export const mapScripts =
{
	async onEnter(runTime, map)
	{
		runTime.maps.addTeleport('maps/zone0-main.mem', 9, 0, 160, 944);
		runTime.theBatter.frozen = true;
		/*await new Scene()
			.talk("Batter", true, 1.0, Infinity,
				"To move my body, use the arrow keys on your keyboard.  To interact with the environment, use the Z key.")
			.run();*/
		runTime.theBatter.frozen = false;
	},
};
