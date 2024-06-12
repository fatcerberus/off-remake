/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music, Scene } from 'sphere-runtime';

export const mapScripts =
{
	async onEnter(runTime, map)
	{
		runTime.maps.addTeleport('@/maps/zone0-house-3f.mem', 5, 27, 56, 136);

		Music.play('@/music/emptyWarehouse-out.ogg');

		if (!runTime.flags.metTheJudge) {
			runTime.flags.metTheJudge = true;
			runTime.maps.blockInput = true;
			let pablo = runTime.maps.getEntity('pablo');
			let playerName = runTime.flags.playerName;
			let pronoun1 = runTime.flags.playerSex == 'male' ? 'he' : 'she';
			let pronoun2 = runTime.flags.playerSex == 'male' ? 'He' : 'She';
			let pronoun3 = runTime.flags.playerSex == 'male' ? 'His' : 'Her';
			let purring = new Sample('@/sounds/catPurr.wav');
			await new Scene()
				.move(pablo, 'east', 8)
				.move(pablo, 'south', 6 * 16)
				.pause(90)
				.call(() => purring.play(Mixer.Default))
				.talk("Cat", true, 1.0, Infinity, `There cannot be any living beings in zone 0; hence, I deduce that you are a pure figment of my imagination.`)
				.talk("Cat", true, 1.0, Infinity, `Nevertheless, I will introduce myself. I am the Judge, and I am aching to know your name, dear illusory interlocutor.`)
				.talk("Batter", true, 1.0, Infinity, `I'm the Batter.\nI've been entrusted with a sacred mission.`)
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `It is a pleasure, although it was not the body I was addressing, but the soul that it harbors. What is your name, controller?`)
				.talk("Batter", true, 1.0, Infinity, `${pronoun3} name is ${playerName}. ${pronoun2} can't talk to us. However, ${pronoun1} can see and hear everything.`)
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `Even though you, too, are but an imaginary spectre in my eyes, let it be said that I am delighted to meet you as well, dear ${playerName}.`)
				.talk("Batter", true, 1.0, Infinity, `I believe we need your help.`)
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `Many people are in need of my services, you know. Everybody loves cats. We rub ourselves against their legs and purr in a most insistent manner. They adore that.`)
				.talk("Batter", true, 1.0, Infinity, `I'm not talking about that kind of help.`)
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `I see--but what sort of service could I offer to an ectoplasmic entity?`)
				.talk("Batter", true, 1.0, Infinity, `I have a sacred mission to fulfill. I must purify the world.`)
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `There is no objective more laudable than yours. I accept to serve you as a guide through this area, if it is of any help to you.`)
				.talk("Batter", true, 1.0, Infinity, `Thanks.`)
				.move(pablo, 'north', 6 * 16 - 1)
				.move(pablo, 'west', 8)
				.move(pablo, 'north', 1)
				.run();
			pablo.x = 152;
			pablo.y = 632;
			pablo.queueMove('west', 1, 3);
			runTime.maps.blockInput = false;
		}
	},
};

export const entityScripts =
{
	pablo:
	{
		async onTalk(runTime, self, actor)
		{
			let pablo = runTime.maps.getEntity('pablo');
			let purring = new Sample('sounds/catPurr.wav');
			runTime.maps.blockInput = true;
			self.faceEntity(actor);
			await new Scene()
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `Allow me to inform you that I find you quite tangible for a phantasmagorial being. Might you, in fact, be a person of flesh and blood?`)
				.talk("Batter", true, 1.0, Infinity, `I think so.`)
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `Then I was mistaken from the beginning, and you did not even interrupt me in my fanciful phantasms...`)
				.pause(30)
				.talk("Judge", true, 1.0, Infinity,
					`This is relatively bizarre, I must say, for you are the first living being I was given to encounter in this place. I had, incidentally, concluded that zone 0 was an empty land. It is all too obvious that I was led astray.`,
					`However, there exist other zones, and in those territories, hostile individuals might attack you most violently. Your sacred mission will likely lead you into these lands. Would you like me to acquaint you with the art of violent confrontation?`)
				.pause(60)
				.talk("Batter", true, 1.0, Infinity, `(This is the part where I whale on a cat for a few minutes using a baseball bat. The cat is surprisingly durable.)`)
				.pause(60)
				.call(() => purring.play(Mixer.Default))
				.talk("Judge", true, 1.0, Infinity, `From now on, you will be ready to dispose of all impure obstacles that dare appear in your luminous mission's way.`)
				.pause(30)
				.talk("Judge", true, 1.0, Infinity, `...well, supposing your intelligence is on the same level with your undeniable capability of dealing bat blows to an innocent cat. Be it as it may, your training has not reached its end yet. Let me ask you to follow me, if you still want me as your guide.`)
				.run();
			pablo.x = 152;
			pablo.y = 424;
			pablo.destroy();
			runTime.maps.blockInput = false;
		},
	},
};
