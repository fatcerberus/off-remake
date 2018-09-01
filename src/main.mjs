/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Console, Music, Prim, Scene, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';

import OpeningScene from './cutscenes/opening';
import TitleScreen from './titleScreen';

import '$/defineScenelets.mjs';

global.console =
	new Console({ hotKey: Key.Tilde });

export default
class OFFGame
{
	async start()
	{
		// polyfill for `Sphere.main` (API L2)
		if (!('main' in Sphere)) {
			Object.defineProperty(Sphere, 'main', {
				value: this,
				configurable: true,
				enumerable: false,
				writable: false,
			});
		}

		//await new TitleScreen().run();
		await new OpeningScene().run();
	}
}
