/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Console, Music, Scene, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';
import SpriteImage from 'sprite-image';

import { TitleEngine } from './titleScreen';

import '$/defineScenelets.mjs';

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

		this.console = new Console();
		this.title = new TitleEngine('@/data/titleScreen.json');
	}

	async start()
	{
		/*Music.play('@/music/fourteenResidents.ogg');
		await this.title.run();*/
		let image = new SpriteImage('@/batter.rss');
		image.pose = 'south';
		image.x = Surface.Screen.width / 2;
		image.y = Surface.Screen.height / 2;
		await new Scene()
			//.adjustBGM(0.0, 300)
			.talk("", false, 1.0, Infinity, "Welcome, Eaty Pig.")
			.call(() => image.start())
			.talk("", false, 1.0, Infinity, "You have been assigned to a being known as The Batter.")
			.talk("", false, 1.0, Infinity, "The Batter has an important mission. Be sure that it's accomplished.")
			.pause(1.0)
			.talk("", false, 1.0, Infinity,
				"The switch is now ON. We will let you both out in Zone 0, where you should elicit the aid of the one known as The Judge.",
				"Good luck.")
			.run();
	}

	log(...args)
	{
		this.console.log(...args);
	}
}
