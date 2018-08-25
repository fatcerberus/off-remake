/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  titleScreen.mjs
 */

import { Prim, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';

export
class TitleEngine
{
	constructor(options)
	{
		options = Object.assign({}, {
			fadeTime:  60,
			menuTitle: Sphere.Game.name,
		}, options);

		Sphere.main.log(`initializing titlescreen engine`, `fade: ${options.fadeTime}f`);
		this.fadeTime = options.fadeTime;
		this.menu = new MenuStrip(options.menuTitle, false, [ "new game", "continue", "exit" ]);
		this.splashes = [];
	}

	addSplash(textureOrName, holdTime = 180)
	{
		Sphere.main.log(`adding splash '${textureOrName}'`, `hold: ${holdTime}f`);

		let texture = textureOrName;
		if (!(textureOrName instanceof Texture))
			texture = new Texture(`@/images/logos/${textureOrName}.png`);
		let thread = new SplashThread(texture, this.fadeTime, holdTime);
		this.splashes.push({ thread });
	}

	async run(showLogos = true)
	{
		if (showLogos) {
			for (const splash of this.splashes) {
				splash.thread.start();
				await Thread.join(splash.thread);
			}
		}
		await this.menu.run();
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
