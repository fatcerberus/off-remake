/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music, Scene } from 'sphere-runtime';

export const mapScripts =
{
	async onEnter(runTime, map)
	{
		Music.play('@/music/emptyWarehouse-in.ogg');

		let pablo = runTime.maps.getEntity('pablo');
		pablo.queueMove('west', 1, 3);
	},
};

export const entityScripts =
{
	pablo:
	{
		async onTalk(runTime, self, actor)
		{
			const purring = await Sample.fromFile('@/sounds/catPurr.wav');
			self.faceEntity(actor);
			await new Scene()
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `Ah, yes. To pass through, it will be necessary to use your cerebral organ correctly. You know, the one bathing flabbily in your cranium. I think that these floating blocks correspond, in some way or another, to the symbols you can see on the wall.`)
				.run();
		},
	},
};
