/**
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on the game "OFF" by Mortis Ghost  (c) 2008
**/

import { Music, Prim, Scene, Thread } from 'sphere-runtime';

import { MenuStrip } from '$/menuSystem';

export default
class TitleScreen extends Thread
{
	constructor(fileName = '@/data/titleScreen.json')
	{
		super();

		this.data = require(fileName);
		this.fadeAlpha = 0.0;
		this.fadeTime = this.data.titleFadeFrames;
		this.menu = new MenuStrip(this.data.menuText, false, [ "new game", "exit" ]);
		this.showSplash = true;
		this.texture = new Texture(this.data.titleScreen);
		this.splashes = [];
		for (const splash of this.data.splashScreens) {
			let texture = new Texture(splash.fileName);
			let thread = new SplashThread(texture, this.data.splashFadeFrames, splash.holdFrames);
			this.splashes.push({ thread });
		}

		this.start();
	}

	async run(forceSplash = false)
	{
		if (this.data.musicOverSplash)
			Music.play(this.data.music);
		if (this.showSplash || forceSplash) {
			for (const splash of this.splashes) {
				splash.thread.start();
				await Thread.join(splash.thread);
			}
			if (!this.data.alwaysShowSplash)
				this.showSplash = false;
		}
		if (!this.data.musicOverSplash)
			Music.play(this.data.music);
		await new Scene()
			.tween(this, this.fadeTime, 'linear', { fadeAlpha: 1.0 })
			.run();
		await this.menu.run();
		await new Scene()
			.doIf(() => !this.data.persistBGM)
				.fork()
					.adjustBGM(0.0, this.fadeTime)
					.changeBGM(null)
				.end()
			.end()
			.tween(this, this.fadeTime, 'linear', { fadeAlpha: 0.0 })
			.resync()
			.adjustBGM(1.0)
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
