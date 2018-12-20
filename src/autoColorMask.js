/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Easing, Prim, Thread, Tween } from 'sphere-runtime';

export default
class AutoColorMask extends Thread
{
	constructor(initialMask = Color.Transparent)
	{
		super({ priority: Infinity });
		this.mask = initialMask;
		this.tween = new Tween(this, Easing.Linear);
		this.start();
	}

	on_render()
	{
		Prim.fill(Surface.Screen, this.mask);
	}

	async fadeTo(newMask, numFrames = 60)
	{
		if (!(newMask instanceof Color))
			throw new TypeError(`'newMask' must be a Color object`);
		await this.tween.easeInOut(newMask, numFrames);
	}
}
