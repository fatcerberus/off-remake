/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  Cellscript.js
 */

import { convertRSS } from './build/rssLoader.js';
import { convertRMP } from './build/rmpLoader.js';

const rssTool = new Tool(convertRSS, "compiling spriteset");
const rmpTool = new Tool(convertRMP, "compiling map");

describe({
	version: 2,
	apiLevel: 2,
	name: "OFF: Puppetmaster",
	author: "Fat Cerberus",
	summary: "The Batter has an important mission. Be sure it's accomplished.",
	resolution: '320x240',
	main: '@/scripts/main.js',
});

runTool('@/sprites', files('sprites/*.rss'), rssTool, '.ses');
runTool('@/maps',    files('maps/*.rmp'),    rmpTool, '.mem');

install('@/lib',     files('lib/*.js', true));

install('@/data',    files('data/*.json', true));
install('@/images',  files('images/*.png', true));
install('@/logos',   files('logos/*.png', true));
install('@/music',   files('music/*.ogg', true));
install('@/scripts', files('src/*.js', true));
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
