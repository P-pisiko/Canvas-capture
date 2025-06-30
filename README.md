
<h1 align="center"> Canvas Capture </h1>

<div align="center" markdown="1">
This browser extension makes it possible to record and export the canvas in any website.

<br>

<img src="https://raw.githubusercontent.com/P-pisiko/Canvas-capture/refs/heads/main/images/canvas.jpg"/>

<br>

### __[ Main Futures of Canvas Capture ]__ 
<br>

**PNG sequence export:** (Higher quality)
- Creates a bitmap of the current frame then turns it into a PNG image, repeats until the capture duration is reached.

**Mp4 video export:**
- Uses MediaRecorder to record in mp4 format with a given bitrate.
- Better quality then webm but slightly higher file sizes.

**Webm video export:**
- Uses MediaRecorder to record in webm format with a given bitrate.
- Bitrates lower then 8000 is not really recommended for this mode as its causes artifacts and smearing
</div>

## Important Note
When exporting a PNG sequence, if you set the framerate high—say, 60 FPS—but your hardware can only handle 30 FPS, the resulting video duration will be cut in half after encoding with FFmpeg, assuming the same framerate is used for both recording and encoding.  
This happens because your hardware can only capture half the frames within the given time frame.  
To counteract this, you can lower the framerate during the encoding process, but this will make the video appear slower. So its best to increase the recording time.

Experiment with it until you get something that fits your hardware.




# Installation & Usage
Download the source code from the [releases](https://github.com/P-pisiko/Canvas-capture/releases) or clone the repository.
```
git clone https://github.com/P-pisiko/Canvas-capture.git
```
After that, go in to *manage extensions* in your Chromium based browser.

**Make sure** you enable developer mode on the top right corner.

Lastly use Load Unpacked extension to complete the installation!



Using PNG Sequence, will capture all the frames and zip them before downloading. In order to create a video from the frames, i recommend you to use **ffmpeg** but you can use **Adobe premier** or even **Blender**!

example usage of ffmpeg:
- *adjust the framerate accordingly!!*
```
cd "in your working directory"
ffmpeg -framerate 24 -i frame-%04d.png -c:v libvpx-vp9 -b:v 4M output.webm
```
