
type Formats = [
    {
        url: string,
        qualityLabel: string,
        container: string,
        quality: string,
        audioBitrate: number | null,
        audioCodec: string | null
    }
];

interface thumbnail {
    url: string;
    width: number;
    height: number;
  }
interface VideoDetails {
    videoId: string;
    title: string;
    shortDescription: string;
    lengthSeconds: string;
    keywords?: string[];
    channelId: string;
    isOwnerViewing: boolean;
    isCrawlable: boolean;
    thumbnails: thumbnail[];
    averageRating: number;
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
  }

export type SentenceInfo = { start: number, text: string };
export type VideoInfo = {
    videoDetails: VideoDetails,
    videoAndAudioFormats: Formats,
    allFormats: Formats,
    tracks: [
        {
            languageCode: string,
            baseUrl: string
        }
    ] | null
};

