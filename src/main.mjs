/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Console, Music, Prim, Scene, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';
import SpriteImage from 'sprite-image';

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

		Music.play('@/music/fourteenResidents.ogg');
		await new TitleScreen().run();
		let image = new SpriteImage('@/sprites/batter.rss');
		image.pose = 'south';
		image.x = Surface.Screen.width / 2;
		image.y = Surface.Screen.height / 2;
		image.alpha = 0.0;
		await new Scene()
			.adjustBGM(0.0, 180)
			.changeBGM('@/music/fourteenResidents-title.ogg')
			.adjustBGM(0.5)
			.talk("", false, 0.5, Infinity,
				"Welcome, Player. We have been anticipating your arrival for quite some time.",
				"...oh, but we hardly have time for formalities, do we? Let's cut to the chase.")
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
			.fork()
				.adjustBGM(1.0, 120)
			.end()
			.splash('@/images/titleCard.png', 120, 300)
			.adjustBGM(0.0, 120)
			.run();
		Music.play(null);
		Music.adjustVolume(1.0, 0);
		image.stop();
	}
}
