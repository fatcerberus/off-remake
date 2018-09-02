/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  main.mjs
 */

import { Console, Music, Prim, Scene, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';

import OpeningScene from './cutscenes/opening';
import MapEngine from 'map-engine/map-engine';
import TitleScreen from './titleScreen';

import '$/defineScenelets.mjs';

global.console =
	new Console({ hotKey: Key.Tilde });

export default
class OFFGame
{
	async start()
	{
		await new TitleScreen().run();
		await new OpeningScene().run();

		let mapEngine = new MapEngine();
		let hero = mapEngine.createCharacter('batter', '@/sprites/batter.ses', 50, 100, 1);
		mapEngine.attachInput(hero);
		mapEngine.addInput(Key.Q, Sphere.shutDown);
		await mapEngine.start('@/maps/somewhere.mem', hero);
	}
}
