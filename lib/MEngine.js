/* File: MEngine.mjs
 * Author: Rhuan
 * Date: 27/10/2017
 * 2D Map Engine for miniSphere game engine
 * Usage: FIX ME - WRITE USAGE HERE OR EXTERNAL GUIDE DOC
 * License for MEngine.mjs, SEngine.mjs and CEngine.mjs and related files
 * Copyright (c) 2017 Richard Lawrence (Rhuan)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Except as contained in this notice, the name(s) of the above copyright holders
 * shall not be used in advertising or otherwise to promote the sale, use or other
 * dealings in this Software without prior written authorization.
 */


import {MapBuffer, TileBuffer} from "./PixelBuffer.js";
import DataStream from "data-stream";

/**
 * MEngine is the core of the MapEngine.
 * This class handles storing, updating and drawing maps
 * 
 * @export
 * @class MEngine
 */
export default class MEngine
{
    /**
     * @param {Object} runTime - object to be given to map scripts when they're called - not currently used
     * @param {Object} SEngine - instance of SEngine class to handle sprites
     * @param {Object} [CEngine=null] - instance of CENgine class to handle collisions (must be shared with the SEngine instance)
     * @param {string} [shaderPath="shaders/"] - path to customised shaders
     * @param {number} [width=Surface.Screen.width] - dimensions of the surface this will draw on
     * @param {number} [height=Surface.Screen.height]
     * @param {string} [scriptsPath="scripts/"] - path to map scripts either relative to maps or with a sphereFS prefix
     * @memberof MEngine
     */
    constructor(runTime, SEngine=null, CEngine=null, shaderPath="shaders/", width = Surface.Screen.width, height = Surface.Screen.height, scriptsPath = "scripts/")
    {
        this.shader         = new Shader({
            fragmentFile : shaderPath + "customised.frag.glsl",
            vertexFile   : shaderPath + "customised.vert.glsl"});

        /**@type {number} */
        this.s_width        = width;
        this.s_height       = height;
        this.maxLayer       = 0;
        this.useTransform   = false;
        this.transformation = null;
        this.map            = null;//current map - null at first
        this.folder         = "@";
        /**@type {Promise<void>|null} */
        this.changing       = null;
        this._changingDone  = function () {};
        this.DEBUG_MODE     = false;
        this.col_tile_size  = 100;
        this.useSEngine     = false;
        this.scriptsPath    = scriptsPath;
        if (SEngine !== null)
        {
            this.SEngine = SEngine;
            this.useSEngine = true;
        }
        if (CEngine !== null)
        {
            CEngine.MEngine = this;
        }
        this.runTime        = runTime;
    }

    /**
     * Called to update the map should be done every frame
     * 
     * This is designed to be used via Dispatch.onUpdate
     * 
     * If using SEngine this automatically calls SEngine#update
     * 
     * @param {number} [x=1] - x coordinate to centre the map on
     * @param {number} [y=1] - y coordinate to centre the map on
     * @param {number} [zoom=1] - zoom scale factor, increase to make things bigger...
     * @memberof MEngine
     */
    update(x = 0, y = 0, zoom = 1)
    {
        if (this.map === null)
        {
            throw new MEngineError("Attempting to update map when there is no map");
        }
        //update the offset coordinates
        const surfaceHeight = this.s_height;
        const surfaceWidth = this.s_width;
        const width = this.map.width;
        const height = this.map.height;
        zoom = Math.max(Math.min(height / surfaceHeight, width / surfaceWidth, zoom), 0.01);
        //#FIX ME this needs adjustment to allow for repeating maps, probably an if - to do something totally different
        // (other things do too for repeating maps :( - though mostly this + sprite coordinate code also Collision code)
        this.map.x = Math.floor(Math.min(Math.max(x - surfaceWidth * zoom  / 2, 0), width  - surfaceWidth * zoom));
        this.map.y = Math.floor(Math.min(Math.max(y - surfaceHeight * zoom  / 2, 0), height - surfaceHeight * zoom));
        this.map.zoom = zoom;

        //handle map Scripts
        if (this.map.entered === false)
        {
            this.map.entered = true;
            Promise.all([
                this.map.mapScripts.onEnter(this.runTime, this.map),
                this.onEnter(this.runTime, this.map)]
            ).then (() =>
            {
                this._changingDone();
            });
        }
        else if (this.map.leaving === true)
        {
            switch (this.map.dir)
            {
            case 0:
                this.map.mapScripts.onLeaveWest(this.runTime, this.map, this.map.player);
                break;
            case 1:
                this.map.mapScripts.onLeaveEast(this.runTime, this.map, this.map.player);
                break;
            case 2:
                this.map.mapScripts.onLeaveNorth(this.runTime, this.map, this.map.player);
                break;
            case 3:
                this.map.mapScripts.onLeaveSouth(this.runTime, this.map, this.map.player);
                break;
            }
        }
        this.map.mapScripts.onUpdate(this.runTime, this.map);
        this.onUpdate(this.runTime, this.map);

        //update animated tiles
        const animations = this.map.animations;
        const numAnims   = animations.length;
        const tick       = this.map.tick;
        for (let i = 0; i < numAnims; ++ i)
        {
            const anim = animations[i].data;
            if (anim.list[anim.current].delay < tick - anim.last)
            {
                anim.current = anim.list[anim.current].next;
                anim.needsUpdate = true;
                anim.last = tick;
            }
        }

        if (this.useSEngine === true)
        {
            this.SEngine.update();
        }
        ++ this.map.tick;
    }

    /**
     * Draw the whole map onto surface
     * 
     * Intended to be used via Dispatch.onRender
     * 
     * start_layer and end_layer allow you to draw a specified range of layers only if wanted
     * 
     * Note if using SEngine the call to this.renderLayer within this method calls on to SEngine.renderLayer as well
     * @param {any} [surface=Surface.Screen] 
     * @param {number} [start_layer=0] 
     * @param {number} [end_layer=(this.map.layers.length-1)] 
     * @memberof MEngine
     */
    render(surface=Surface.Screen, start_layer=0, end_layer=(this.maxLayer))
    {
        if (this.map === null)
        {
            throw new MEngineError ("Attempting to render a map when there is no map");
        }
        if (this.DEBUG_MODE === true)
        {
            this.map.obsTransform.identity();
            this.map.obsTransform.translate(-this.map.x, -this.map.y);
        }

        //for (let i = 0; i < this.map.layers.length; ++i)
        //{
        this.shader.setFloatVector(tex_move, [this.map.x / this.map.width, 1 - this.map.y/this.map.height, this.map.zoom]);
        //}

        ++end_layer;
        for (let i = start_layer; i < end_layer; ++i)
        {
            this.renderLayer(surface, i);
        }
        if (this.DEBUG_MODE === true)
        {
            this.map.layers[1].obsModel.draw();
        }
        this.map.mapScripts.onRender(this.runTime, this.map);
        this.onRender(this.runTime, this.map);
    }

    /**
     * Draw one layer of the map onto the specified surface
     * 
     * If using SEngine this also draws the entities for the layer via calling SEngine#renderLayer
     * 
     * @param {Surface} [surface=Surface.Screen] 
     * @param {number} [layer=0] 
     * @memberof MEngine
     */
    renderLayer(surface=Surface.Screen, layer=0)
    {
        if (this.map === null)
        {
            throw new MEngineError ("Attempting to render a map when there is no map");
        }
        const thisLayer = this.map.layers[layer];
        if (thisLayer.visible === true)
        {
            if (this.useTransformation)//#FIX me is this funcationality usable?
            {
                thisLayer.transform2.identity();
                thisLayer.transform2.compose(this.transformation);
                thisLayer.transform2.compose(thisLayer.transform);
            }
            //draw the static component of the layer
            thisLayer.model.draw(surface);
            //draw any animated tiles that are in view
            const numAnims = thisLayer.animations.length;
            if (numAnims > 0)//don't get setup to draw animated tiles on this layer if there aren't any
            {
                const coords = [0, 0];//this section is basically a copy and paste of the sprite drawing logic in SEngine
                const offset = [this.map.x, this.map.y];
                const zoom = this.map.zoom;
                const transformed = this.useTransformation;
                const animWidth = Math.ceil(this.map.tile_w / zoom);
                const scaleW = animWidth / this.map.tile_w;//avoid 1 pixel gaps around tiles at odd scales
                const animHeight = Math.ceil(this.map.tile_h / zoom);
                const scaleH = animHeight / this.map.tile_h;//seperate for width and height in case tiles aren't squares
                const uZoom = Math.floor(1024 / zoom);

                const sWidth = surface.width |0;
                const sHeight = surface.height |0;

                for (let i = 0; i < numAnims; ++ i)
                {
                    const currentRender = thisLayer.animations[i].data;
                    coords[0] = (thisLayer.animations[i].x - offset[0]) * uZoom >> 10;
                    coords[1] = (thisLayer.animations[i].y - offset[1]) * uZoom >> 10;

                    if (coords[0] < sWidth &&//only draw the animated tiles that are visible
                        coords[1] < sHeight &&
                        coords[0] + animWidth > 0 &&
                        coords[1] + animHeight > 0 )
                    {
                        if (currentRender.needsUpdate === true)//update which tile is shown for the animation (but only update if necesary)
                        {//note tiles following the same animation chain and starting in the sample palce share the same data - so this is only called once for them all
                            currentRender.shader.setFloatVector(tex_move, [currentRender.list[currentRender.current].offset, 0.0, 1.0]);//OPTIMISE ME - make a new shader for this - only needs 1 number not a vector
                            currentRender.needsUpdate = false;
                        }
                        currentRender.trans.identity();
                        currentRender.trans.scale(scaleW, scaleH);
                        currentRender.trans.translate(coords[0], coords[1]);
                        if (transformed === true)
                        {
                            currentRender.trans.compose(this.transformation);
                        }
                        currentRender.model.draw(surface);
                    }
                }
            }
            //draw the entities on the layer
            if (this.useSEngine === true)
            {
                this.SEngine.renderLayer([this.map.x, this.map.y], this.map.zoom, surface, layer);
            }
        }
    }

    //#IMPROVE ME - could the next two methods be combined and made into a setter?

    /**
     * Attach a transformation object to the whole map
     * Use this to rotate or translate or scale the rectangle the map is drawn in
     * For transititions or shrinking to a miniMap or the like
     * 
     * #EXPERIMENTAL feature - not fully tested
     * 
     * @param {Transform} transformation - a Sphere Transform object
     * @memberof MEngine
     */
    attachTransformation(transformation)
    {
        if (this.map === null)
        {
            throw new MEngineError ("Attempting to transform a map when there is no map");
        }
        this.useTransformation = true;
        this.transformation = transformation;
        for (let i = 0; i < this.map.layers.length; ++i)
        {
            this.map.layers[i].transform2 = new Transform();
            this.map.layers[i].model.transform = this.map.layers[i].transform2;
        }
    }

    /**
     * Use this to remove a Transfom that was set with attachTransformation
     * 
     * @memberof MEngine
     */
    detachTransformation()
    {
        if (this.map === null)
        {
            throw new MEngineError ("Attempting to remove a transform from a map when there is no map");
        }
        this.useTransformation = false;
        this.transformation = null;
        for (let i = 0; i < this.map.layers.length; ++i)
        {
            this.map.layers[i].model.transform = this.map.layers[i].transform;
            this.map.layers[i].transform2 = null;
        }
    }

    /**
     * Change the standard width and height of the box the map is drawn in
     * 
     * #Experimental feature, not fully tested
     * 
     * @param {number} width 
     * @param {number} height 
     * @returns {boolean}
     * @memberof MEngine
     */
    changeRes(width, height)
    {
        if (this.map === null)
        {
            throw new MEngineError ("Attempting to change resolution of a map when there is no map");
        }
        if (width >= this.map.width && height >= this.map.height)
        {
            if (width === this.s_width && height === this.s_height)
            {
                return false; //nothing to do just return
            }
            this.s_width  = width;
            this.s_height = height;
            const new_vertices = new VertexList([
                {x : 0,     y : 0,      z : 0, u : 0,                      v : 1,                           },
                {x : width, y : 0,      z : 0, u : width / this.map.width, v : 1,                           },
                {x : 0,     y : height, z : 0, u : 0,                      v : 1 - height / this.map.height },
                {x : width, y : height, z : 0, u : width / this.map.width, v : 1 - height / this.map.height }]);
            for (const layer of this.map.layers) //not performance critical and for...of looks nice
            {
                layer.shape.vertexList = new_vertices;
            }
            return true;
        }
        else
        {
            throw new MEngineError("Requested screen resolution too large for map");
        }
    }

    /**
     * Set a map - used to set the first map and to change map later.
     * 
     * Note this is an async function use it with an await or a .then
     * if you wish to schedule anything to happen after the map loads
     * 
     * Additionally the promise MEngine#changing will resolve after the
     * new map's onEnter script has completed
     * 
     * @param {string} fileName -path/name of map to load
     * @memberof MEngine
     */
    async setMap(fileName)
    {
        if (this.map !== null)
        {
            if (this.map.entered === true)
            {
                await Promise.all([
                    this.map.mapScripts.onExit(this.runTime, this.map),
                    this.onExit(this.runTime, this.map)
                ]);
            }
        }
        //#optimise me - considering doing one read at start and virtualising the rest
        const inputFile = new DataStream(fileName, FileOp.Read);
        //lead out with the tile data
        const numTiles     = inputFile.readUint16(true);
        const tileWidth    = inputFile.readUint16(true);
        const tileHeight   = inputFile.readUint16(true);
        const tileBuffer   = new TileBuffer(inputFile, tileWidth, tileHeight, numTiles);
        const tiles        = new Array(numTiles);
        let triggerID    = 0;
        const triggerNames = [];
        this.changing = new Promise((r)=>{
            this._changingDone =  r;
        });

        for (let i = 0, j = 0; i < numTiles; ++i, j = 0)
        {
            tiles[i] = {
                name     : inputFile.readString16(true),
                animated : inputFile.readUint8(),
                obs      : new Array(inputFile.readUint16(true))
            };
            const tempBuffer = new DataView(inputFile.read(9 * tiles[i].obs.length));
            for (;j < tiles[i].obs.length; ++j)
            {
                tiles[i].obs[j] = {
                    type : tempBuffer.getUint8(9 * j),//inputFile.readUint8(),
                    x    : tempBuffer.getUint16(9 * j + 1, true),//inputFile.readUint16(true),
                    y    : tempBuffer.getUint16(9 * j + 3, true),
                    w    : tempBuffer.getUint16(9 * j + 5, true),
                    h    : tempBuffer.getUint16(9 * j + 7, true)
                };
            }
        }
        const numAnims = inputFile.readUint16(true);
        const animations = new Array(numAnims);
        for (let i = 0; i < numAnims; ++i)
        {
            const currentLength = inputFile.readUint16(true);
            animations[i] = {
                tiles : new Array(currentLength),
                shape : null
            };
            const animBuffer = new MapBuffer(currentLength, 1, tileBuffer);
            for (let j = 0; j < currentLength; ++j)//optimise me could reduce number of reads here
            {
                const index = inputFile.readUint16(true);
                animations[i].tiles[j] = {
                    index  : index,
                    offset : j / currentLength,
                    delay  : inputFile.readUint16(true),
                    next   : inputFile.readUint16(true)
                };
                animBuffer.setTileInBuffer(index, j);
            }
            const finalForm = animBuffer.tileBufferToTexture();
            const image = new Texture(finalForm.width, finalForm.height, finalForm.data);
            animations[i].shape = new Shape(ShapeType.TriStrip, image, new VertexList([
                {x : 0,         y : 0,          u : 0,                 v : 1, color : Color.White},
                {x : tileWidth, y : 0,          u : 1 / currentLength, v : 1, color : Color.White},
                {x : 0,         y : tileHeight, u : 0,                 v : 0, color : Color.White},
                {x : tileWidth, y : tileHeight, u : 1 / currentLength, v : 0, color : Color.White}
            ]));

        }
        /*let repeating =*/ inputFile.readUint8(); //#FIX ME implement repeating
        const width = inputFile.readUint16(true);
        const height = inputFile.readUint16(true);
        const numLayers = inputFile.readUint8();
        const layers = new Array(numLayers);
        const fullWidth = width * tileWidth;
        const fullHeight = height * tileHeight;
        const screenWidth = this.s_width;
        const screenHeight = this.s_height;
        const mapBuffer = new MapBuffer(width, height, tileBuffer);
        const VBO = new VertexList([
            {x : 0,           y : 0,            u : 0,                       v : 1,                            },
            {x : screenWidth, y : 0,            u : screenWidth / fullWidth, v : 1,                            },
            {x : 0,           y : screenHeight, u : 0,                       v : 1 - screenHeight / fullHeight },
            {x : screenWidth, y : screenHeight, u : screenWidth / fullWidth, v : 1 - screenHeight / fullHeight }]);
        const debugColour = new Color(0.9, 0.6, 0);
        /**@type {mapAnimation[]} */
        const inUseAnimations = [];
        for (let i = 0, j = 0, k = 0, l = 0, tileIndex = 0; i < numLayers; ++i, j = 0, k = 0, l = 0)
        {
            layers[i] = {
                x          : 0,
                y          : 0,
                width      : inputFile.readUint16(true),
                height     : inputFile.readUint16(true),
                flags      : inputFile.readUint16(true),
                parallaxX  : inputFile.readFloat32(true),//#FIX ME implement parallax and scroll
                parallaxY  : inputFile.readFloat32(true),
                scrollX    : inputFile.readFloat32(true),
                scrollY    : inputFile.readFloat32(true),
                reflective : inputFile.readUint8(),//#FIX ME implement reflective
                segments   : new Array(inputFile.readUint32(true)),
                zones      : new Array(inputFile.readUint16(true)),
                /**@type {trigger[]} */
                triggers   : new Array(inputFile.readUint16(true)),
                tileMap    : new Array(height),
                visible    : true,
                transform  : new Transform(),
                animations : [],
                transform2 : null,
                shape      : null,
                model      : null
            };
            if (this.DEBUG_MODE === true)
            {
                layers[i].obsShapes = [];
            }
            let tempBuffer = new DataView(inputFile.read(layers[i].width * layers[i].height * 2));
            for (; j < height; ++ j, k = 0)
            {
                layers[i].tileMap[j] = new Array(width);

                for (; k < width; ++k, ++l)
                {
                    tileIndex = tempBuffer.getInt16(l * 2, true);
                    layers[i].tileMap[j][k] = tileIndex;
                    if (tiles[tileIndex].animated !== 1)
                    {
                        mapBuffer.setTileInBuffer(layers[i].tileMap[j][k], l);
                    }
                    else
                    {
                        layers[i].animations.push(MapAnimation(animations, k * tileWidth, j * tileHeight, tileIndex, this.shader, inUseAnimations));
                    }
                }
            }
            if (this.DEBUG_MODE === true)
            {
                for (j = 0; j < height; ++ j, k = 0)
                {
                    for (; k < width; ++k, ++l)
                    {
                        for (let m = 0; m < tiles[layers[i].tileMap[j][k]].obs.length; ++m)
                        {
                            const tempX = tileWidth * k;
                            const tempY = tileHeight * j;
                            const obsP  = tiles[layers[i].tileMap[j][k]].obs[m];
                            layers[i].obsShapes.push(new Shape(ShapeType.LineLoop, null, new VertexList([
                                {x : tempX + obsP.x         , y : tempY + obsP.y,          color : debugColour},
                                {x : tempX + obsP.x + obsP.w, y : tempY + obsP.y,          color : debugColour},
                                {x : tempX + obsP.x         , y : tempY + obsP.y + obsP.h, color : debugColour},
                                {x : tempX + obsP.x + obsP.w, y : tempY + obsP.y + obsP.h, color : debugColour}])));
                        }
                    }
                }
                layers[i].obsModel = new Model(layers[i].obsShapes);
            }
            const finalBuffer = mapBuffer.tileBufferToTexture();
            layers[i].shape = new Shape(ShapeType.TriStrip,
                new Texture(finalBuffer.width, finalBuffer.height, finalBuffer.data), VBO);

            layers[i].model = new Model([layers[i].shape], this.shader);
            layers[i].model.transform = layers[i].transform;

            tempBuffer = new DataView(inputFile.read(9 * layers[i].segments.length));
            for (j = 0; j < layers[i].segments.length; ++j)
            {
                layers[i].segments[j] = {
                    type : tempBuffer.getUint8(9 * j),
                    x    : tempBuffer.getUint16(9 * j + 1,true),
                    y    : tempBuffer.getUint16(9 * j + 3,true),
                    w    : tempBuffer.getUint16(9 * j + 5,true),
                    h    : tempBuffer.getUint16(9 * j + 7,true),
                };
            }
            for (j = 0; j < layers[i].zones.length; ++j)
            {
                layers[i].zones[j] = {
                    name  : inputFile.readString16(true),
                    steps : inputFile.readUint16(true),
                    poly  : {
                        type : inputFile.readUint8(),
                        x    : inputFile.readUint16(true),
                        y    : inputFile.readUint16(true),
                        w    : inputFile.readUint16(true),
                        h    : inputFile.readUint16(true)
                    }
                };
            }
            for (j = 0; j < layers[i].triggers.length; ++j)
            {
                const name = inputFile.readString16(true);
                triggerID = triggerNames.indexOf(name);
                if (triggerID === -1)
                {
                    triggerID = triggerNames.length;
                    triggerNames.push(name);
                }
                const x = inputFile.readUint16(true);
                layers[i].triggers[j] = {
                    name  : name,
                    id    : triggerID,
                    x     : x,
                    index : x + inputFile.readUint16(true) * width
                };
            }
            //@ts-ignore
            layers[i].triggers.sort((a, b) =>
            {
                return a.index - b.index;
            });
        }
        const entities = new Array(inputFile.readUint16(true));
        for (let i = 0; i < entities.length; ++i)
        {
            entities[i] = {
                name   : inputFile.readString16(true),
                x      : inputFile.readUint16(true),
                y      : inputFile.readUint16(true),
                layer  : inputFile.readUint8(),
                sprite : inputFile.readString16(true)
            };
        }

        this.shader.setFloatVector(tex_move, [0,0,1]);
        this.shader.setInt("mask_mode",0);
        this.shader.setFloatVector("unit_size", [1/fullWidth, 1/fullHeight]);

        const startingName = inputFile.fileName;
        const splitPoint = startingName.lastIndexOf("/")+1;
        let identifier = FS.fullPath(this.scriptsPath + startingName.slice(splitPoint, startingName.length - 3), startingName.slice(0,splitPoint));

        identifier = FS.fileExists(identifier + "js") ? identifier + "js" : identifier + "mjs";

        //bring in the scripts
        let scripts;
        try
        {
            scripts = await import(identifier);
        }
        catch (e)
        {
            SSj.log("WARNING: map script failed to load for: " + fileName);
            SSj.log("Error was " + e);
            scripts = {};
        }

        const loadedScripts = Object.assign({zoneScripts : {}, triggerScripts : {}, entityScripts : {}}, scripts);

        if (Object.prototype.hasOwnProperty.call(scripts, "mapScripts"))
        {
            loadedScripts.mapScripts = Object.assign({}, templateScripts, scripts.mapScripts);
        }
        else
        {
            loadedScripts.mapScripts = templateScripts;
        }

        if (Object.prototype.hasOwnProperty.call(scripts, "triggerScripts"))
        {
            loadedScripts.triggerScripts = Object.assign({}, scripts.triggerScripts);
        }

        if (this.useSEngine === true)
        {
            this.SEngine.reset(fullWidth, fullHeight, numLayers);
            this.SEngine.loadMapEntities(entities, loadedScripts.entityScripts);
        }

        this.maxLayer = numLayers -1;
        this.map =
        {
            layers         : layers,
            tiles          : tiles,
            tick           : 0,
            x              : 0,
            y              : 0,
            zoom           : 1,
            entered        : false,
            leaving        : false,
            player         : null,
            dir            : 0,
            width          : fullWidth,
            height         : fullHeight,
            tile_w         : tileWidth,
            tile_h         : tileHeight,
            fract_w        : 1 / tileWidth,
            fract_h        : 1 / tileHeight,
            mapScripts     : loadedScripts.mapScripts,
            triggerScripts : loadedScripts.triggerScripts,
            zoneScripts    : loadedScripts.zoneScripts,
            animations     : inUseAnimations
        };

        if (this.DEBUG_MODE === true)
        {
            this.map.obsTransform = new Transform();
            for (let i = 0; i < this.map.layers.length; ++i)
            {
                this.map.layers[i].obsModel.transform = this.map.obsTransform;
            }
        }
    }

    /**
     * Add a trigger to the currently active map at
     * specified x, y tile coordinates and on the specified layer
     * 
     * With func as the function to call when it's triggered
     * 
     * Mode determines how to handle duplicates:
     * mode = 0 (default) - throw error for duplicate
     * mode = 1 when there is a duplicate create the new trigger
     *          but have it share the existing trigger's calback
     * mode = 2 overwrite the function used by the duplicate
     * 
     * @param {string} name
     * @param {number} x
     * @param {number} y
     * @param {number} layer
     * @param {function} onPlayer
     * @param {function} onOther
     * @param {number} [mode=0]
     * @memberof MEngine
     */
    addTrigger(name, x, y, layer, onPlayer, onOther = function () {}, mode = 0)
    {
        if (this.map === null)
        {
            throw new MEngineError("Attempt to add a trigger to map when there is no map.");
        }
        const dup = this.map.triggerScripts.hasOwnProperty.call(this.map.triggerScripts, name);

        if (mode === 0 && dup === true) // mode 0 don't accept duplicate
        {
            throw new MEngineError ("Duplicate trigger name '" + name + "' duplicate names not accepted when adding trigger with mode 0");
        }
        if (mode !== 1 || dup === false)
        {
            this.map.triggerScripts[name] = {
                onPlayer : onPlayer,
                onOther  : onOther
            };
        }
        const index = x + y * this.map.layers[layer].width;
        /**@type {trigger[]} */
        const triggers = this.map.layers[layer].triggers;
        const position = triggers.indexOf((trig) => {return trig.index > index;});
        const newTrigger = {
            name  : name,
            x     : x,
            id    : name.length,
            index : index
        };
        if (position === -1)
        {
            triggers.push(newTrigger);
        }
        else
        {
            triggers.splice(position, 0, newTrigger);
        }
    }

    // Methods to call when various events happen
    // intended to be overwritten
    /**
     *
     *
     * @param {unknown} runTime
     * @param {*} map
     * @memberof MEngine
     */
    onExit   (runTime, map) {}
    /**
     *
     *
     * @param {unknown} runTime
     * @param {*} map
     * @memberof MEngine
     */
    onEnter  (runTime, map) {}
    /**
     *
     *
     * @param {unknown} runTime
     * @param {*} map
     * @memberof MEngine
     */
    onUpdate (runTime, map) {}
    /**
     *
     *
     * @param {unknown} runTime
     * @param {*} map
     * @memberof MEngine
     */
    onRender (runTime, map) {}
}


/**
 * set up a map animation - function for internal use
 *
 * @param {array} animationsArray
 * @param {number} x
 * @param {number} y
 * @param {number} firstTile
 * @param {Shader} shader
 * @param {mapAnimation[]} inUseAnimations
 * @returns
 */
function MapAnimation(animationsArray, x, y, firstTile, shader, inUseAnimations)
{
    const allAnims = animationsArray.length;
    let animLength = 0;
    let anim = null;
    let found = false, done = false;

    if (allAnims === 0)
    {
        throw new MEngineError("Attempt to create a map animation when no animation data exists");
    }

    let i = 0, j = 0, k = 0;
    //We could avoid these loops by storing 4 bytes of extra information per tile in the map file
    //and then adding 2 extra Ints to each tile object - considering this is only a hit on loading a map
    //and probably quite a small one I thought better to have the loops
    for (; i < allAnims && found === false; ++i)
    {
        anim = animationsArray[i];
        animLength = anim.tiles.length;
        for (j = 0; j < animLength && found === false; ++j)
        {
            if (anim.tiles[j].index === firstTile)
            {
                found = true;
            }
        }
    }
    --i;
    --j;

    if (found === false)
    {
        throw new MEngineError("attempt to create a map animation with a tile which has no animation data");
    }

    while (k < inUseAnimations.length && done === false)
    {
        if (inUseAnimations[k].ref === i && inUseAnimations[k].start === j)
        {
            done = true;
        }
        else
        {
            ++ k;
        }
    }
    if (done === false)
    {
        const shaderProp = shader.clone();
        const model = new Model([anim.shape], shaderProp);
        const trans = new Transform();
        model.transform = trans;
        inUseAnimations.push({
            ref   : i,
            start : j,
            data  : {
                model       : model,
                list        : anim.tiles,
                current     : j,
                needsUpdate : true,
                last        : 0,
                trans       : trans,
                shader      : shaderProp
            }
        });
    }
    return {
        data : inUseAnimations[k].data,
        x    : x,
        y    : y
    };
}

//template for map scripts also used as blank version if none supplied
const templateScripts =
{
    //@ts-ignore
    onExit       : function (runTime, map) {},
    //@ts-ignore
    onEnter      : function (runTime, map) {},
    //@ts-ignore
    onUpdate     : function (runTime, map) {},
    //@ts-ignore
    onRender     : function (runTime, map) {},
    //@ts-ignore
    onLeaveEast  : function (runTime, map, player) {},
    //@ts-ignore
    onLeaveWest  : function (runTime, map, player) {},
    //@ts-ignore
    onLeaveNorth : function (runTime, map, player) {},
    //@ts-ignore
    onLeaveSouth : function (runTime, map, player) {}
};

//we use this string in a loop it's potentially needed many times a frame
//so make a constant out of it to remove the risk of it being re-created
const tex_move = "tex_move";

//Custom error object for MEngine may be fancier in future - for now just adds a prefix
class MEngineError extends Error
{
    /**
     *Creates an instance of MEngineError.
     * @param {string} message
     * @memberof MEngineError
     */
    constructor(message)
    {
        super("MEngine error: " + message);
    }
}
