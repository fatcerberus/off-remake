/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Console, Music, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';

import { TitleEngine } from './titleScreen';

export default
class OFFGame
{
	constructor()
	{
		// polyfill for `Sphere.main`
		Object.defineProperty(Sphere, 'main', {
			value: this,
			configurable: true,
			enumerable: false,
			writable: false,
		});

		this.console = new Console({ prompt: ">" });
		this.title = new TitleEngine('@/data/titleScreen.json');
	}

	async start()
	{
		Music.play('@/music/fourteenResidents.ogg');
		await this.title.run();
	}

	log(...args)
	{
		this.console.log(...args);
	}
}
