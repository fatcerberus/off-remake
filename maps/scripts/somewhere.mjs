/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music, Random, Scene } from 'sphere-runtime';

export const mapScripts =
{
	async onEnter(runTime, map)
	{
		addTeleport(runTime.engine, 'maps/zone0-outside.mem', 9, 0, 160, 960);
		runTime.theBatter.frozen = true;
		await runTime.overlay.fadeTo(Color.Transparent, 120);
		await new Scene()
			.talk("Batter", true, 1.0, Infinity,
				"To move my body, use the arrow keys on your keyboard.  To interact with the environment, use the Z key.")
			.run();
		runTime.theBatter.frozen = false;
	},
	
	async onExit(runTime, map)
	{
		await Sphere.main.overlay.fadeTo(Color.Black, 120);
	},
};

function addTeleport(engine, mapFileName, x, y, toX, toY)
{
	let mEngine = engine.MEngine;
	let fired = false;
	mEngine.addTrigger(Random.string(10), x, y, 0, async () => {
		Sphere.main.theBatter.frozen = true;
		await engine.changeMap(mapFileName);
		Sphere.main.theBatter.x = toX;
		Sphere.main.theBatter.y = toY;
		Sphere.main.theBatter.frozen = false;
	});
}
