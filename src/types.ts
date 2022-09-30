
export type SentenceInfo = { start: number, text: string };
export type VideoInfo = {
    formats: [
        {
            url: string
        }
    ],
    tracks: [
        {
            languageCode: string,
            baseUrl: string
        }
    ] | null
};