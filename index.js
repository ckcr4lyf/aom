const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const { spawnSync } = require('child_process');

let COOKIE = null;
let list = false;

if (fs.existsSync('cookie.txt')) {
    COOKIE = fs.readFileSync('cookie.txt', 'utf-8');
    console.log(`[AoM] Loaded cookie!`);
}

if (process.argv.length < 3) {
    console.log(`[AoM] Missing parameter. Exiting...`);
    process.exit(1);
}

if (process.argv.length > 3 && (process.argv[3] == "-l" || process.argv[3] == "--list")) {
    list = true;
}

const og_url = process.argv[2];
const slug = og_url.substring(og_url.lastIndexOf('/') + 1);

const api_main = `https://magicstream.com/api/contents/${slug}`;
const options_main = {
    method: 'get',
    url: api_main,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36', //Just to be safe
        'Referer': og_url //Not needed but to seem innocent in logs
    }
};

if (COOKIE) {
    options_main.headers['Cookie'] = COOKIE;
}

let response_main;

console.log(`[AoM] Requesting main data...`);

(async () => {
    try {
        response_main = await axios(options_main);

        if (response_main.status != 200) {
            process.exit(0);
        }

    } catch (e) {
        console.log("[AoM] Error in main request");
        process.exit(1);
    }

    const trick_title = response_main.data.title;
    console.log(`[AoM] Loaded information for ${trick_title}`);
    const chapter_ids = response_main.data.chapters;
    let new_cookies = response_main.headers['set-cookie'];
    COOKIE = new_cookies[new_cookies.length - 1]
    console.log(`[AoM] Main request updated cookie...`)

    let response_chapter;
    let query = querystring.stringify({ "ids[]": chapter_ids });
    const api_chapter = "https://magicstream.com/api/chapters";
    const options_chapter = {
        method: 'get',
        url: api_chapter + '?' + query,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36', //Just to be safe
            'Referer': api_main //Not needed but to seem innocent in logs
        }
    };

    if (COOKIE) {
        options_chapter.headers['Cookie'] = COOKIE;
    }

    console.log(`[AoM] Getting chapter stream links...`);

    try {
        response_chapter = await axios(options_chapter);

        if (response_chapter.status != 200) {
            process.exit(1);
        }
    } catch (e) {
        console.log("[AoM] Error in chapter request");
        console.log(e);
        process.exit(1);
    }

    const chapters = response_chapter.data;
    let flag = false;
    new_cookies = response_chapter.headers['set-cookie'];
    COOKIE = new_cookies[new_cookies.length - 1]
    console.log(`[AoM] Chapter request updated cookie...`)

    fs.writeFileSync("cookie.txt", COOKIE);
    console.log(`[AoM] Saved cookie to file...`)

    for (chapter of chapters) {
        if (chapter.subject) {
            let filename = `${trick_title}_${chapter.title}_${chapter.id.toString()}.mkv`
            filename = filename.replace(/[/\\?%*:|"<>]/g, '');
            // console.log(filename, chapter.subject.versions.hls);
            if (chapter.subject.versions.hls != "") {

                if (list) {
                    console.log(`[AoM] ${trick_title} - ${chapter.title}: ${chapter.subject.versions.hls}`);
                } else {
                    console.log(`[FFMPEG] Downloading ${filename}`);
                    let start, end, seconds;
                    start = Date.now();
                    const dl = spawnSync("ffmpeg", ["-user_agent", "Mozilla Firefox", "-i", chapter.subject.versions.hls, "-c", "copy", filename]);
                    if (dl.status != 0) {
                        console.log(`[FFMPEG] Failed to download.`);
                    } else {
                        end = Date.now();
                        seconds = (end - start) / 1000;
                        console.log(`[FFMPEG] Finished download of ${filename} in ${seconds.toString()} seconds.`);
                    }
                }
            }
        }
    }
})();


