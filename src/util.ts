import { SentenceInfo, VideoInfo } from './types';

export async function getVideoInfo(input: string): Promise<VideoInfo> {
    const url = `https://youtube-video-info-fvxkv650trvd.runkit.sh/?url=${input}`;
    const videoInfo = await fetch(url).then(t => t.json()) as VideoInfo;
    return videoInfo;
};

export const decodeHtmlCharCodes = (str: string) =>
    str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
        String.fromCharCode(charCode));

export async function getSubtitle(url: string): Promise<SentenceInfo[]> {
    const resp = await fetch(url)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))

    const sentenceNodes = Array.from(resp.getElementsByTagName("text"));
    return sentenceNodes.map(sentence => ({
        start: parseFloat(sentence.getAttribute("start") as string),
        duration: parseFloat(sentence.getAttribute("dur") as string),
        text: decodeHtmlCharCodes(sentence.textContent as string)
    }));
};

export function forceDownload(blob: any, filename: string) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

export function getPlayableVideoURL(videoInfo: VideoInfo) {
    return videoInfo.videoAndAudioFormats[0].url;
}
