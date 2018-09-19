/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music, Scene } from 'sphere-runtime';

export const mapScripts =
{
	async onEnter(runTime, map)
	{
		Music.play('@/music/emptyWarehouse-out.ogg');
		await runTime.fader.fadeTo(Color.Transparent, 120);
	},
	
	async onExit(runTime, map)
	{
		await runTime.fader.fadeTo(Color.Black, 120);
	},
};
