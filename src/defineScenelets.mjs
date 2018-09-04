/**
 *  OFF: Puppetmaster  (c) 2018 Fat Cerberus
 *  based on the game "OFF" by Mortis Ghost  (c) 2008
**/

import { Joypad, Music, Prim, Scene } from 'sphere-runtime';

Scene.defineOp('adjustBGM',
{
	start(scene, volume, numFrames = 0) {
		Music.adjustVolume(volume, numFrames);
	},

	update(scene) {
		return Music.adjustingVolume;
	},
});

Scene.defineOp('changeBGM',
{
	start(scene, trackName, fadeTime) {
		Music.play(trackName, fadeTime);
	},
});


Scene.defineOp('popBGM',
{
	start(scene) {
		Music.pop();
	},
});

Scene.defineOp('pushBGM',
{
	start(scene, trackName) {
		Music.push(trackName);
	},
});

Scene.defineOp('splash',
{
	async start(scene, fileName, fadeFrames, holdFrames) {
		this.alpha = 0.0;
		this.texture = new Texture(fileName);
		this.x = (Surface.Screen.width - this.texture.width) / 2;
		this.y = (Surface.Screen.height - this.texture.height) / 2;
		let renderJob = Dispatch.onRender(() => {
			Prim.blit(Surface.Screen, this.x, this.y, this.texture, Color.White.fadeTo(this.alpha));
		});
		await new Scene()
			.tween(this, fadeFrames, 'linear', { alpha: 1.0 })
			.pause(holdFrames)
			.tween(this, fadeFrames, 'linear', { alpha: 0.0 })
			.run();
		renderJob.cancel();
	},
});

Scene.defineOp('talk',
{
	start(scene, speaker, showSpeaker, textSpeed, timeout /*...pages*/) {
		this.speakerName = speaker;
		this.speakerText = this.speakerName != null ? this.speakerName + ":" : null;
		this.showSpeaker = showSpeaker;
		this.textSpeed = textSpeed;
		this.timeout = timeout;
		this.timeoutLeft = this.timeout;
		this.font = GetSystemFont();
		this.text = [];
		let speakerTextWidth = this.font.getStringWidth(this.speakerText);
		let textAreaWidth = Surface.Screen.width - 16;
		for (let i = 5; i < arguments.length; ++i) {
			let lineWidth = this.speakerName != null ? textAreaWidth - (speakerTextWidth + 5) : textAreaWidth;
			let wrappedText = this.font.wordWrapString(arguments[i], lineWidth);
			let page = this.text.push([]) - 1;
			for (let iLine = 0; iLine < wrappedText.length; ++iLine) {
				this.text[page].push(wrappedText[iLine]);
			}
		}
		this.boxVisibility = 0.0;
		this.textVisibility = 1.0;
		this.nameVisibility = 0.0;
		this.lineVisibility = 0.0;
		this.scrollOffset = 0.0;
		this.currentPage = 0;
		this.numLinesToDraw = 0;
		this.topLine = 0;
		this.lineToReveal = 0;
		this.textSurface = CreateSurface(textAreaWidth, this.font.getHeight() * 3 + 1, CreateColor(0, 0, 0, 0));
		this.transition = new Scene()
			.tween(this, 20, 'easeOutBack', { boxVisibility: 1.0 });
		this.transition.run();
		this.mode = "fadein";
		while (AreKeysLeft()) {
			GetKey();
		}
		if (Sphere.Game.disableTalking) {
			this.mode = "finish";
		}
		return true;
	},

	render(scene) {
		let lineHeight = this.font.getHeight();
		let boxHeight = lineHeight * 3 + 11;
		let finalBoxY = Surface.Screen.height * 0.85 - boxHeight / 2;
		let boxY = finalBoxY + (Surface.Screen.height - finalBoxY) * (1.0 - this.boxVisibility);
		OutlinedRectangle(-1, boxY - 1, Surface.Screen.width + 2, boxHeight + 2, CreateColor(0, 0, 0, 144 * this.boxVisibility));
		Rectangle(0, boxY, Surface.Screen.width, boxHeight, CreateColor(0, 0, 0, 128 * this.boxVisibility));
		this.textSurface.setBlendMode(REPLACE);
		this.textSurface.rectangle(0, 0, this.textSurface.width, this.textSurface.height, CreateColor(0, 0, 0, 0));
		this.textSurface.setBlendMode(BLEND);
		let lineCount = this.text[this.currentPage].length;
		let textAreaWidth = this.textSurface.width;
		let textX = 0;
		if (this.speakerName != null) {
			let speakerTextWidth = this.font.getStringWidth(this.speakerText);
			textX = speakerTextWidth + 5;
		}
		textAreaWidth -= textX;
		for (let iLine = Math.min(this.lineToReveal - this.topLine + 1, lineCount - this.topLine, 3) - 1; iLine >= 0; --iLine) {
			let trueLine = this.topLine + iLine;
			let textY = iLine * lineHeight - this.scrollOffset * lineHeight;
			let lineVisibility = iLine == 0 ? 1.0 - this.scrollOffset : 1.0;
			if (this.lineVisibility > 0.0 || this.lineToReveal != trueLine) {
				let lineText = this.text[this.currentPage][trueLine];
				this.font.setColorMask(CreateColor(0, 0, 0, 255 * this.textVisibility * lineVisibility));
				this.textSurface.drawText(this.font, textX + 1, textY + 1, lineText);
				this.font.setColorMask(CreateColor(255, 255, 255, 255 * this.textVisibility * lineVisibility));
				this.textSurface.drawText(this.font, textX, textY, lineText);
				if (this.lineToReveal == trueLine) {
					let shownArea = textAreaWidth * this.lineVisibility;
					this.textSurface.setBlendMode(SUBTRACT);
					this.textSurface.gradientRectangle((textX - lineHeight * 2) + shownArea, textY, lineHeight * 2, lineHeight + 1, CreateColor(0, 0, 0, 0), CreateColor(0, 0, 0, 255), CreateColor(0, 0, 0, 255 * this.boxVisibility), CreateColor(0, 0, 0, 0));
					this.textSurface.setBlendMode(REPLACE);
					this.textSurface.rectangle(textX + shownArea, textY, textAreaWidth - shownArea, lineHeight + 1, CreateColor(0, 0, 0, 0));
					this.textSurface.setBlendMode(BLEND);
				}
			}
			if (this.showSpeaker && this.speakerName != null && trueLine == 0) {
				this.font.setColorMask(CreateColor(0, 0, 0, this.textVisibility * this.nameVisibility * 255));
				this.textSurface.drawText(this.font, 1, textY + 1, this.speakerText);
				this.font.setColorMask(CreateColor(255, 192, 0, this.textVisibility * this.nameVisibility * 255));
				this.textSurface.drawText(this.font, 0, textY, this.speakerText);
			}
		}
		this.textSurface.blit((Surface.Screen.width - this.textSurface.width) / 2, boxY + 5);
	},

	update(scene) {
		if (Sphere.Game.disableTalking) {
			this.mode = "finish";
		}
		switch (this.mode) {
			case "idle":
				if (this.timeout !== Infinity) {
					if (this.topLine + 3 >= this.text[this.currentPage].length) {
						this.timeoutLeft -= 1.0 / Sphere.frameRate;
						if (this.timeoutLeft <= 0.0) {
							if (this.currentPage < this.text.length - 1)
								this.mode = "page";
							else
								this.mode = "hidetext";
							this.timeoutLeft = this.timeout;
						}
					}
					else {
						this.mode = "nextline";
						this.numLinesToDraw = 0;
						this.lineVisibility = 0.0;
					}
				}
				break;
			case "fadein":
				if (!this.transition.running) {
					this.mode = "write";
				}
				break;
			case "write":
				this.nameVisibility = Math.min(this.nameVisibility + 4.0 / Sphere.frameRate, 1.0);
				if (this.nameVisibility >= 1.0) {
					this.lineVisibility = Math.min(this.lineVisibility + this.textSpeed / Sphere.frameRate, 1.0);
					let lineCount = Math.min(3, this.text[this.currentPage].length - this.topLine);
					let currentLineText = this.text[this.currentPage][this.lineToReveal];
					let currentLineWidth = this.font.getStringWidth(currentLineText);
					let textAreaWidth = this.textSurface.width;
					if (this.speakerName != null) {
						let speakerTextWidth = this.font.getStringWidth(this.speakerText);
						textAreaWidth -= speakerTextWidth + 5;
					}
					if (this.lineVisibility >= 1.0 || textAreaWidth * this.lineVisibility >= currentLineWidth + 20) {
						if (this.lineToReveal - this.topLine == lineCount - 1) this.mode = "idle";
						++this.lineToReveal;
						++this.numLinesToDraw;
						if (this.numLinesToDraw < 3 && this.lineToReveal < this.text[this.currentPage].length)
							this.mode = "nextline";
						else
							this.mode = "idle";
						this.lineVisibility = 0.0;
					}
				}
				break;
			case "nextline":
				if (this.lineToReveal < 3) {
					this.lineVisibility = 0.0;
					this.mode = "write";
					break;
				}
				this.scrollOffset = Math.min(this.scrollOffset + 8.0 * this.textSpeed / Sphere.frameRate, 1.0);
				if (this.scrollOffset >= 1.0) {
					this.topLine += 1;
					this.scrollOffset = 0.0;
					this.lineVisibility = 0.0;
					this.textVisibility = 1.0;
					this.mode = "write";
				}
				break;
			case "page":
				this.textVisibility = Math.max(this.textVisibility - (2.0 * this.textSpeed) / Sphere.frameRate, 0.0);
				if (this.textVisibility <= 0.0) {
					this.mode = "write";
					++this.currentPage;
					this.lineToReveal = 0;
					this.numLinesToDraw = 0;
					this.textVisibility = 1.0;
					this.topLine = 0;
					this.lineVisibility = 0.0;
				}
				break;
			case "hidetext":
				this.textVisibility = Math.max(this.textVisibility - (4.0 * this.textSpeed) / Sphere.frameRate, 0.0);
				if (this.textVisibility <= 0.0) {
				    this.transition = new Scene()
						.tween(this, 20, 'easeInBack', { boxVisibility: 0.0 });
					this.transition.run();
					this.mode = "fadeout";
				}
				break;
			case "fadeout":
				if (!this.transition.running) {
					this.mode = "finish";
				}
				break;
			case "finish":
				return false;
		}
		return true;
	},

	getInput(scene) {
		if (this.mode != "idle")
			return;
		if ((Keyboard.Default.isPressed(Key.Z) || Joypad.P1.isPressed(0))
			&& this.timeout == Infinity)
		{
			if (this.topLine + 3 >= this.text[this.currentPage].length) {
				if (this.currentPage < this.text.length - 1)
					this.mode = "page";
				else
					this.mode = "hidetext";
			}
			else {
				this.mode = "nextline";
				this.numLinesToDraw = 0;
				this.lineVisibility = 0.0;
			}
		}
	},
});
