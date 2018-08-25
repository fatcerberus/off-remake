/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Console, Music, Thread } from 'sphere-runtime';

import { SplashEngine } from './titleScreen';

export default
class OFFGame extends Thread
{
	constructor()
	{
		super();

		// polyfill for Sphere.Main
		Object.defineProperty(Sphere, 'Main', {
			value: this,
			configurable: true,
			enumerable: false,
			writable: false,
		});

		this.console = new Console({ prompt: ">" });
		this.splash = new SplashEngine();
	}

	log(...args)
	{
		this.console.log(...args);
	}

	async on_startUp()
	{
		Music.play('@/music/fourteenResidents.ogg');
		await this.splash.showImage('@/images/imJustSaiyan.png');
	}
	
	on_update()
	{
	}

	on_render()
	{
	}
}
