/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  Cellscript.mjs
 */

import { convertRSS } from '$/build/rssLoader';
import { convertRMP } from '$/build/rmpLoader';

const rssTool = new Tool(convertRSS, "compiling spriteset");
const rmpTool = new Tool(convertRMP, "compiling map");

Object.assign(Sphere.Game,
{
	name: "OFF: Puppetmaster",
	author: "Fat Cerberus",
	summary: "The Batter has an important mission. Be sure it's accomplished.",
	resolution: '320x240',
	main: '@/scripts/main.mjs',

	// minimum Sphere v2 API level 1
	version: 2, apiLevel: 1,
});

runTool('@/sprites', files('sprites/*.rss'), rssTool, '.ses');
runTool('@/maps',    files('maps/*.rmp'),    rmpTool, '.mem');

install('@/data',    files('data/*.json', true));
install('@/images',  files('images/*.png', true));
install('@/lib',     files('lib/*.mjs', true));
install('@/logos',   files('logos/*.png', true));
install('@/maps',    files('maps/*.mjs', true));
install('@/music',   files('music/*.ogg', true));
install('@/scripts', files('src/*.mjs', true));
install('@/shaders', files('shaders/*.glsl', true));
install('@/sounds',  files('sounds/*.wav', true));
install('@/sprites', files('sprites/*.rss'));
install('@/',        files('icon.png'));

function runTool(dirName, sources, tool, extension)
{
    const targets = [];
    FS.createDirectory(dirName);
    for (const source of sources) {
        let fileName = FS.fullPath(source.name, dirName);
        fileName = fileName.substring(0, fileName.lastIndexOf('.')) + extension;
        targets.push(tool.stage(fileName, [source], { name : source.name }));
    }
    return targets;
}
