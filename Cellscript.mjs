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
	summary: "A remake/remaster of the surreal horror game OFF, originally by Mortis Ghost, for Sphere.",
	resolution: '320x240',
	main: '@/scripts/main.mjs',

	// minimum Sphere v2 API level 1
	version: 2, apiLevel: 1,
});

install('@/images',  files('images/*.png', true));
install('@/lib',     files('lib/*.mjs', true));
install('@/music',   files('music/*.ogg', true));
install('@/scripts', files('src/*.mjs', true));
install('@/',        files('icon.png'));
