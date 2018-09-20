/*
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on OFF by Mortis Ghost  (c) 2008
 */

import { Music, Scene } from 'sphere-runtime';

export const mapScripts =
{
	async onEnter(runTime, map)
	{
		Music.play('@/music/emptyWarehouse-out.ogg');

		if (!runTime.flags.metTheJudge) {
			runTime.flags.metTheJudge = true;
			runTime.maps.blockInput = true;
			let pablo = runTime.maps.getEntity('pablo');
			let playerName = runTime.flags.playerName;
			let pronoun1 = runTime.flags.playerSex == 'male' ? 'he' : 'she';
			let pronoun2 = runTime.flags.playerSex == 'male' ? 'He' : 'She';
			let pronoun3 = runTime.flags.playerSex == 'male' ? 'His' : 'Her';
			let purring = new Sample('sounds/catPurr.wav');
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
			runTime.maps.blockInput = false;
		}
	},
};
