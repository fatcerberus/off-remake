/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music } from 'sphere-runtime';

export const mapScripts =
{
	onEnter(runTime, map)
	{
		Music.play('@/music/emptyWarehouse-out.ogg');
	},

	onUpdate() {},
	onRender() {},
};
