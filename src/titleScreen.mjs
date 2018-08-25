/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  titleScreen.mjs
 */

import { Prim, Thread } from 'sphere-runtime';

export
class SplashEngine
{
	constructor(options)
	{
		options = Object.assign({}, {
			fadeTime: 60,
		}, options);

		Sphere.Main.log(`initializing Splasher`,
			`fade: ${options.fadeTime}f`);

		this.fadeTime = options.fadeTime;
	}
	
	async showImage(textureOrFile, holdTime = 180)
	{
		let texture = textureOrFile;
		if (!(textureOrFile instanceof Texture))
			texture = new Texture(textureOrFile);
		let image = new SplashImage(texture, this.fadeTime, holdTime);
		image.start();
		await Thread.join(image);
	}
}

class SplashImage extends Thread
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
