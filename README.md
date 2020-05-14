# AoM

AoM stands for Art of Misdirection. It is a CLI tool to download videos from Magic Stream. To run AoM, clone the git repository, and then run `npm install` in it. (This means open a shell in the "aom" folder and run the command in it).

### Requirements

If you're on Windows and don't have git by default, find it here - https://git-scm.com/download/win
If you're on Windows and don't have node, find it here - https://nodejs.org/en/download/
You also need the ffmpeg binary. Windows builds are here - https://ffmpeg.zeranoe.com/builds/ (P.S. - you need to add it to your PATH, or just copy ffmpeg.exe to something like `C:\Windows\System32`)

### Cookies

By default, it can only usually download the trailers. To download the 'explanation' you need to provide a cookie. To get your cookie, login to magic stream in your browser. Then:

1. Open the DevTools (F12 in chrome)
2. Click the 'Application' tab at the top
3. On the left, choose "cookies" and then `https://magicstream.com`
4. Copy the value for the `_uscreen2_session` cookie. 
5. Save this in a file called 'cookie.txt' in the following format:

```
_uscreen2_session=thereallylongtextyoucopiedfromthebrowser
```

### Running

You should be all set. Open the video you want to grab in a browser, and copy the watch URL (`https://magicstream.com/programs/some-thing-here`)

In a shell, run the following command:
```
node index.js "https://magicstream.com/programs/some-thing-here"
```

It will try and grab the links and initiate a download. You can pass the `-l` parameter if you only want it to list the stream links but not actually download.

Use responsibly, and open an issue if you need help.