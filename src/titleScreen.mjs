/**
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on the game "OFF" by Mortis Ghost  (c) 2008
**/

import { Music, Prim, Scene } from 'sphere-runtime';

import { MenuStrip } from '$/menuSystem';

export default
class TitleScreen
{
	constructor(fileName = '@/data/titleScreen.json')
	{
		this.data = require(fileName);
		this.menu = new MenuStrip(this.data.menuText, false, [ "new game", "exit" ]);
		this.showSplash = true;
		this.texture = new Texture(this.data.titleScreen);
		this.splashScene = new Scene();
		for (const splash of this.data.splashScreens)
			this.splashScene.splash(splash.fileName, this.data.splashFadeFrames, splash.holdFrames);
	}

	async run(forceSplash = false)
	{
		if (this.data.musicOverSplash)
			Music.play(this.data.music);
		if (this.showSplash || forceSplash) {
			await this.splashScene.run();
			if (!this.data.alwaysShowSplash)
				this.showSplash = false;
		}
		if (!this.data.musicOverSplash)
			Music.play(this.data.music);
		let fadeMask = Color.White.fadeTo(0.0);
		let job = Dispatch.onRender(() => {
			Prim.blit(Surface.Screen, 0, 0, this.texture, fadeMask);
		});
		await new Scene()
			.tween(fadeMask, this.data.titleFadeFrames, 'linear', { a: 1.0 })
			.run();
		await this.menu.run();
		await new Scene()
			.doIf(() => !this.data.persistBGM)
				.fork()
					.adjustBGM(0.0, this.data.titleFadeFrames)
					.changeBGM(null)
				.end()
			.end()
			.tween(fadeMask, this.data.titleFadeFrames, 'linear', { a: 0.0 })
			.resync()
			.adjustBGM(1.0)
			.run();
		job.cancel();
		
	}
}
