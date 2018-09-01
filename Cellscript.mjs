/*
 *  OFF: Puppetmaster by Fat Cerberus
 *  (c) 2018, based on OFF by Mortis Ghost (c) 2008
 *  Cellscript.mjs
 */

Object.assign(
	Sphere.Game,
{
	name: "OFF: Puppetmaster",
	author: "Fat Cerberus",
	summary: "The Batter has an important mission. Be sure it's accomplished.",
	resolution: '320x240',
	main: '@/scripts/main.mjs',

	// minimum Sphere v2 API level 1
	version: 2, apiLevel: 1,
});

install('@/data',    files('data/*.json', true));
install('@/images',  files('images/*.png', true));
install('@/lib',     files('lib/*.mjs', true));
install('@/logos',   files('logos/*.png', true));
install('@/music',   files('music/*.ogg', true));
install('@/scripts', files('src/*.mjs', true));
install('@/sounds',  files('sounds/*.wav', true));
install('@/sprites', files('sprites/*.rss'));
install('@/',        files('icon.png'));
