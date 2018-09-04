/**
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on the game "OFF" by Mortis Ghost  (c) 2008
**/

import { Console, Music, Prim, Scene, Thread } from 'sphere-runtime';
import MenuStrip from 'menu-strip';

import MapEngine from 'map-engine/map-engine';

import { playOpening } from './cutscenes/opening';
import TitleScreen from './titleScreen';

import '$/defineScenelets.mjs';

global.console =
	new Console({ hotKey: Key.Tilde });

export default
async function main()
{
	await new TitleScreen().run();
	await playOpening();

	let mapEngine = new MapEngine();
	let hero = mapEngine.createCharacter('batter', '@/sprites/batter.ses', 50, 100, 1);
	mapEngine.attachInput(hero);
	mapEngine.addInput(Key.Q, Sphere.shutDown);
	await mapEngine.start('@/maps/somewhere.mem', hero);
}
