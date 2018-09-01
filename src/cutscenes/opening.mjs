/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Prim, Scene, Thread } from 'sphere-runtime';
import SpriteImage from 'sprite-image';

export default
class OpeningScene extends Thread
{
	constructor()
	{
		super();

		this.sprite = new SpriteImage('@/sprites/batter.rss');
		this.sprite.pose = 'south';
		this.sprite.x = Surface.Screen.width / 2;
		this.sprite.y = Surface.Screen.height / 2;
	}

	async run()
	{
		this.start();

		// HACK: ensure on_startUp() gets called before we continue
		await null;

		await new Scene()
			.changeBGM('@/music/fourteenResidents-title.ogg')
			.adjustBGM(0.5)
			.talk("", false, 0.5, Infinity,
				"Welcome, Player. We have been anticipating your arrival for quite some time.",
				"...oh, but we hardly have time for formalities, do we? Let's cut to the chase.")
			.call(() => this.sprite.start())
			.fork()
				.tween(this.backColor, 60, 'linear', { a: 1.0 })
			.end()
			.tween(this.sprite, 60, 'linear', { alpha: 1.0 })
			.talk("", false, 0.5, Infinity,
				"You have been assigned to a being known as \"The Batter\". The Batter... well, let's just say he has a very important mission.",
				"Be sure that it's accomplished.")
			.pause(60)
			.talk("", false, 0.5, Infinity,
				"The switch is now ON, but it won't be for long. We will let you both out in zone 0, where you should solicit the advice of the one known as \"The Judge\".")
			.fork()
				.tween(this.backColor, 60, 'linear', { a: 1.0 })
			.end()
			.tween(this.sprite, 60, 'linear', { alpha: 0.0 })
			.talk("", false, 0.5, Infinity, "Good luck.")
			.talk("", false, 0.5, Infinity, "Trust us. You're going to need it.")
			.pause(120)
			.fork()
				.adjustBGM(1.0, 120)
			.end()
			.splash('@/images/titleCard.png', 120, 300)
			.adjustBGM(0.0, 120)
			.run();
		await this.stop();
	}

	on_startUp()
	{
		this.backAlpha = 0.0;
		this.backColor = Color.of('#00101010');
		this.sprite.alpha = 0.0;

		this.sprite.start();
	}

	on_shutDown()
	{
		this.sprite.stop();
	}

	on_render()
	{
		Prim.fill(Surface.Screen, this.backColor);
	}
}
