/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Prim, Scene, Thread } from 'sphere-runtime';

import SpriteImage from 'sprite-image';

export
async function playOpening()
{
	let backColor = Color.of('#00101010');
	let sprite = new SpriteImage('@/sprites/batter.rss');
	sprite.pose = 'south';
	sprite.x = Surface.Screen.width / 2;
	sprite.y = Surface.Screen.height / 2;
	sprite.alpha = 0.0;
	let job = Dispatch.onRender(() => {
		Prim.fill(Surface.Screen, backColor);
	});
	await new Scene()
		.pause(300)
		.changeBGM('@/music/fourteenResidents-title.ogg')
		.adjustBGM(0.5)
		.talk("", false, 0.5, Infinity,
			"Welcome, Player.",
			"We have been anticipating your arrival for quite some time.")
		.pause(60)
		.talk("", false, 0.5, Infinity,
			"...oh, but we hardly have time for formalities, do we? Let's cut to the chase.")
		.call(() => sprite.start())
		.fork()
			.tween(backColor, 60, 'linear', { a: 1.0 })
		.end()
		.tween(sprite, 60, 'linear', { alpha: 1.0 })
		.talk("", false, 0.5, Infinity,
			"You have been assigned to a being known as \"The Batter\". The Batter... well, let's just say he has a very important mission.",
			"Be sure that it's accomplished.")
		.pause(60)
		.talk("", false, 0.5, Infinity,
			"The switch is now ON, but it won't be for long. We will let you both out in zone 0, where you should solicit the advice of the one known as \"The Judge\".")
		.fork()
			.tween(backColor, 60, 'linear', { a: 0.0 })
		.end()
		.tween(sprite, 60, 'linear', { alpha: 0.0 })
		.talk("", false, 0.5, Infinity, "Good luck.")
		.talk("", false, 0.5, Infinity, "Trust us. You're going to need it.")
		.pause(120)
		.fork()
			.adjustBGM(1.0, 120)
		.end()
		.splash('@/images/titleCard.png', 120, 300)
		.adjustBGM(0.0, 120)
		.call(async () => await sprite.stop())
		.run();
	job.cancel();
}
