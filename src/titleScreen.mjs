/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  titleScreen.mjs
 */

import { Prim, Scene, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';

export
class TitleEngine extends Thread
{
	constructor(fileName = '@/data/titleScreen.json')
	{
		super();
		
		Sphere.main.log(`initializing titlescreen`, `file: '${fileName}'`);

		let data = require(fileName);
		this.fadeAlpha = 0.0;
		this.fadeTime = data.titleFadeFrames;
		this.menu = new MenuStrip(data.menuText, false, [ "new game", "continue", "exit" ]);
		this.texture = new Texture(data.titleScreen);
		this.splashes = [];
		for (const splash of data.splashScreens) {
			Sphere.main.log(`splash '${splash.fileName}'`, `hold: ${splash.holdFrames}f`);
			let texture = new Texture(splash.fileName);
			let thread = new SplashThread(texture, data.splashFadeFrames, splash.holdFrames);
			this.splashes.push({ thread });
		}

		this.onSound = new Sample('@/sounds/switchOn.wav');
		this.offSound = new Sample('@/sounds/switchOff.wav');

		this.start();
	}

	async run(showLogos = true)
	{
		if (showLogos) {
			for (const splash of this.splashes) {
				splash.thread.start();
				await Thread.join(splash.thread);
			}
		}
		await new Scene()
			.tween(this, this.fadeTime, 'linear', { fadeAlpha: 1.0 })
			.run();
		this.onSound.play(Mixer.Default);
		await this.menu.run();
		this.offSound.play(Mixer.Default);
		await new Scene()
			.tween(this, this.fadeTime, 'linear', { fadeAlpha: 0.0 })
			.run();
	}
	
	on_startUp()
	{
		this.fadeAlpha = 0.0;
	}
	
	on_render()
	{
		let fadeMask = Color.White.fadeTo(this.fadeAlpha);
		Prim.blit(Surface.Screen, 0, 0, this.texture, fadeMask);
	}
}

class SplashThread extends Thread
{
	constructor(texture, fadeTime, holdTime)
	{
		super();

		this.fadeStep = 1.0 / fadeTime;
		this.holdTime = holdTime;
		this.texture = texture;
		this.x = Math.trunc((Surface.Screen.width - texture.width) / 2);
		this.y = Math.trunc((Surface.Screen.height - texture.height) / 2);
	}

	on_startUp()
	{
		this.fadeAlpha = 0.0;
		this.fadeMask = Color.White.fadeTo(0.0);
	}

	on_render()
	{
		Prim.blit(Surface.Screen, this.x, this.y, this.texture, this.fadeMask);
	}

	async on_update()
	{
		this.fadeAlpha = Math.min(Math.max(this.fadeAlpha + this.fadeStep, 0.0), 1.0);
		this.fadeMask = Color.White.fadeTo(this.fadeAlpha);
		if (this.fadeAlpha >= 1.0) {
			await Sphere.sleep(this.holdTime);
			this.fadeStep = -(this.fadeStep);
		}
		else if (this.fadeAlpha <= 0.0) {
			this.stop();
		}
	}
}
