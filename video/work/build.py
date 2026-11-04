"""Assemble the showcase video: Ken Burns stills + EN narration + music bed."""
import glob
import pathlib
import re
import shutil
import subprocess

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
WORK = pathlib.Path(__file__).resolve().parent
OUT = WORK.parent / "casa-de-brasas-showcase.mp4"
FPS = 30
FONT = "C\\:/Windows/Fonts/arialbd.ttf"

SCENES = [
    ("s1", "cover.jpg", "AUTONOMOUS COMMERCE"),
    ("s2", "identidad.png", "BRAND IDENTITY"),
    ("s3", "productos.png", "AI PRODUCTS"),
    ("s4", "trends.png", "CAMPAIGN STUDIO"),
    ("s5", "whatsapp.png", "VOICE CLERK"),
    ("s6", "productos-cutout.png", "VISION + CUTOUTS"),
    ("s7", "codecard.png", "AGENTS + SKILLS"),
    ("s8", "endcard.jpg", "BUILT. TESTED. RUNNING."),
]


def run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed:\n{p.stderr[-1500:]}")
    return p.stderr


def duration(path: pathlib.Path) -> float:
    err = run([FF, "-hide_banner", "-i", str(path), "-f", "null", "-"])
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    assert m, f"no duration for {path}"
    h, mi, s = int(m.group(1)), int(m.group(2)), float(m.group(3))
    return h * 3600 + mi * 60 + s


def main() -> None:
    # Cover/endcard: copy the two generated stills into work dir.
    gen_dir = WORK.parent.parent / "generated_images"
    shutil.copy(gen_dir / "call_01a1a598297074ff902a1b9b636b73f3.jpg", WORK / "cover.jpg")
    shutil.copy(gen_dir / "call_01a1a58e9a417408a5255b34fdb2c406.jpg", WORK / "endcard.jpg")

    segs: list[pathlib.Path] = []
    total = 0.0
    for i, (key, img, title) in enumerate(SCENES):
        ad = duration(WORK / f"{key}.mp3")
        seg_dur = round(ad + 1.1, 2)
        frames = int(seg_dur * FPS)
        total += seg_dur
        if i % 2 == 0:
            zoom = f"zoompan=z='min(zoom+0.0009,1.12)':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps={FPS}"
        else:
            zoom = f"zoompan=z='max(zoom-0.0009,1.0)':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps={FPS}"
        vf = (
            f"[0]scale=1280:720,{zoom},"
            f"drawtext=fontfile='{FONT}':text='{title}':fontsize=32:fontcolor=white:"
            f"box=1:boxcolor=black@0.55:boxborderw=14:x=48:y=h-104,setsar=1,format=yuv420p[v]"
        )
        af = f"[1]adelay=350|350,apad,atrim=0:{seg_dur}[a]"
        seg = WORK / f"seg{i + 1}.mp4"
        run([
            FF, "-y", "-loop", "1", "-framerate", str(FPS), "-i", str(WORK / img),
            "-i", str(WORK / f"{key}.mp3"), "-filter_complex", f"{vf};{af}",
            "-map", "[v]", "-map", "[a]", "-frames:v", str(frames),
            "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k", str(seg),
        ])
        segs.append(seg)
        print(f"seg{i + 1} {seg_dur:.1f}s")

    lst = WORK / "concat.txt"
    lst.write_text("".join(f"file '{s.name}'\n" for s in segs))
    joined = WORK / "joined.mp4"
    run([FF, "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)])

    # Synthetic cinematic underscore (placeholder bed): low A-root stack + pulse.
    t = round(total + 0.5, 2)
    music = WORK / "music.m4a"
    run([
        FF, "-y",
        "-f", "lavfi", "-i", f"sine=frequency=55:duration={t}",
        "-f", "lavfi", "-i", f"sine=frequency=82.5:duration={t}",
        "-f", "lavfi", "-i", f"sine=frequency=110:duration={t}",
        "-f", "lavfi", "-i", f"sine=frequency=220:duration={t}",
        "-filter_complex",
        "[0][1][2][3]amix=inputs=4:normalize=0,tremolo=f=0.6:d=0.5,"
        "lowpass=f=900,volume=0.05,afade=t=in:st=0:d=3,afade=t=out:st={:.1f}:d=3[m]".format(t - 3),
        "-map", "[m]", "-c:a", "aac", "-b:a", "96k", str(music),
    ])
    run([
        FF, "-y", "-i", str(joined), "-i", str(music),
        "-filter_complex", "[0:a][1:a]amix=inputs=2:normalize=0:duration=first[a]",
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart", str(OUT),
    ])
    print("total:", round(duration(OUT), 1), "s ->", OUT.name)


if __name__ == "__main__":
    main()
