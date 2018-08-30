/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  sprite-image.mjs
 */

import { from, Thread } from 'sphere-runtime';

export default
class SpriteImage extends Thread
{
	constructor(fileName)
	{
		super();
		
		// while we're loading the spriteset using the Sphere v1 API, we want to
		// use Sphere v2 filename resolution rules.  we can call FS.fullPath() in advance
		// to accomplish that.
		fileName = FS.fullPath(fileName);

		this.set = LoadSpriteset(fileName);
		this.xOffset = -(this.set.base.x1 + Math.round((this.set.base.x2 + 1 - this.set.base.x1) / 2));
		this.yOffset = -(this.set.base.y1 + Math.round((this.set.base.y2 + 1 - this.set.base.y1) / 2));
		this.alpha = 1.0;
		this.poseID = 0;
		this.frameID = 0;
		this.countdown = this.set.directions[this.poseID].frames[this.frameID].delay;
		this.x = 0;
		this.y = 0;
	}

	get pose()
	{
		return this.set.directions[this.poseID].name;
	}

	set pose(name)
	{
		let newPoseID = from(this.set.directions)
			.where(it => it.name == name)
			.select((it, idx) => idx)
			.first();
		if (newPoseID === undefined)
			throw new ReferenceError(`No such pose '${name}' in spriteset`);
		this.poseID = newPoseID;
		this.frameID = 0;
		this.countdown = this.set.directions[this.poseID].frames[this.frameID].delay;
	}

	on_render()
	{
		let imageIndex = this.set.directions[this.poseID].frames[this.frameID].index
		let image = this.set.images[imageIndex];
		image.blit(this.x + this.xOffset, this.y + this.yOffset);
	}

	on_update()
	{
		if (--this.countdown == 0) {
			let pose = this.set.directions[this.poseID];
			this.frameID = (this.frameID + 1) % pose.frames.length;
			this.countdown = pose.frames[this.frameID].delay;
		}
	}
}
