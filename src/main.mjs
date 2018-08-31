/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Console, Music, Prim, Scene, Thread } from 'sphere-runtime';
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
		Music.play('@/music/fourteenResidents.ogg');
		await this.title.run();
		let image = new SpriteImage('@/batter.rss');
		image.pose = 'south';
		image.x = Surface.Screen.width / 2;
		image.y = Surface.Screen.height / 2;
		image.alpha = 0.0;
		await new Scene()
			.adjustBGM(0.0, 180)
			.changeBGM('@/music/fourteenResidents-title.ogg')
			.adjustBGM(1.0)
			.talk("", false, 0.5, Infinity,
				"Welcome, Bruce. We have been anticipating your arrival for quite some time.",
				"But we hardly have time for formalities, do we? Let's cut to the chase.")
			.call(() => image.start())
			.tween(image, 60, 'linear', { alpha: 1.0 })
			.talk("", false, 0.5, Infinity,
				"You have been assigned to a being known as \"The Batter\". The Batter... well, let's just say he has a very important mission.",
				"Be sure that it's accomplished.")
			.pause(60)
			.talk("", false, 0.5, Infinity,
				"The switch is now ON, but it won't be for long. We will let you both out in zone 0, where you should solicit the advice of the one known as \"The Judge\".")
			.tween(image, 60, 'linear', { alpha: 0.0 })
			.talk("", false, 0.5, Infinity, "Good luck.")
			.talk("", false, 0.5, Infinity, "Trust us. You're going to need it.")
			.pause(120)
			.splash('@/images/title.png', 120, 300)
			.adjustBGM(0.0, 120)
			.run();
		Music.play(null);
		Music.adjustVolume(1.0, 0);
		image.stop();
	}

	log(...args)
	{
		this.console.log(...args);
	}
}
