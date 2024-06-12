/**
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on the game "OFF" by Mortis Ghost  (c) 2008
**/

import { Console, Prim, Random, Scene } from 'sphere-runtime';

import AutoColorMask from './autoColorMask.js';
import SpriteImage from './spriteImage.js';
import { TitleScreen } from './menuSystem/index.js';

import './defineScenelets.js';

globalThis.console = new Console();
console.defineObject('yap', null, {
	'off'() {
		Sphere.Game.disableTalking = true;
		console.log("the yappy talking switch is now OFF");
	},
	'on'() {
		Sphere.Game.disableTalking = false;
		console.log("the yappy talking switch is now ON");
	},
});

export default
class OFFSession
{
	constructor()
	{
		this.flags = {
			playerName: "Big Chungus",
			playerSex: 'male',
			metTheJudge: false,
		};

		this.titles = new TitleScreen();
	}

	async start()
	{
		await this.titles.run();
		await playOpening();
	}
}

async function playOpening()
{
	let backColor = Color.of('#00101010');
	let sprite = await SpriteImage.fromFile('@/sprites/theBatter.rss');
	sprite.pose = 'south';
	sprite.x = Surface.Screen.width / 2;
	sprite.y = Surface.Screen.height / 2;
	sprite.alpha = 0.0;
	const updateJob = Dispatch.onUpdate(() => {
		sprite.update();
	});
	const renderJob = Dispatch.onRender(() => {
		Prim.fill(Surface.Screen, backColor);
		sprite.blit(sprite.x, sprite.y, sprite.alpha);
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
		.changeBGM(null)
		.adjustBGM(1.0)
		.call(async () => await sprite.stop())
		.run();
	renderJob.cancel();
	updateJob.cancel();
}
