import React, { FormEvent, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { SentenceInfo, VideoInfo } from './types';
import { getPlayableVideoURL, getSubtitle, getVideoInfo } from './util';
import { useAsync } from './useAsync';

const Loader = () => <article aria-busy="true"></article>;

// @ts-ignore
const castJS = new Castjs();

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputURL = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{
    activeSentenceIndex: number
  }>({ activeSentenceIndex: 0 });

  const hasSubtitle = (tracks: VideoInfo["tracks"]) => (Array.isArray(tracks) && tracks.length);

  const videoInfoFetcher = () => {
    const val = inputURL.current?.value as string;
    return getVideoInfo(val);
  };
  const { execute: fetchVideoInfo, status: videoInfoStatus, value: videoInfo } = useAsync(videoInfoFetcher, false);

  const subtitleFetcher = () => {
    if (videoInfo && hasSubtitle(videoInfo.tracks)) {
      // @ts-ignore
      const track = videoInfo.tracks[0];
      return getSubtitle(track.baseUrl);
    }

    return Promise.reject("Subtitle not found");
  }
  const { execute: fetchSubtitle, status: subtitleStatus, value: subtitle } = useAsync(subtitleFetcher, false);

  const handleVideoSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchVideoInfo();
  };

  const handleSentenceClick = (sentenceInfo: SentenceInfo, index: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sentenceInfo.start;
    }
    setState(curr => ({
      ...curr,
      activeSentenceIndex: index
    }));
  };

  const handleTimeUpdate = () => {
    const videoCurrentTime = videoRef.current?.currentTime;
    if (castJS.connected) {
      castJS.seek(videoCurrentTime);
    }
    if (!subtitle) return;

    const nextSentenceInfo = (subtitle[state?.activeSentenceIndex + 1]);
    if (videoCurrentTime && nextSentenceInfo && videoCurrentTime >= nextSentenceInfo?.start) {
      setState(curr => ({ ...curr, activeSentenceIndex: (curr?.activeSentenceIndex ?? 0) + 1 }));
    }
  };

  useEffect(() => {
    if (videoInfo && videoRef.current) {
      videoRef.current.src = getPlayableVideoURL(videoInfo);
      fetchSubtitle();
    }
  }, [videoInfo]);

  const handleCastClick = (videoInfo: VideoInfo) => {
    videoRef.current?.pause();

    const { videoDetails } = videoInfo;
    const metadata = {
      poster: videoDetails.thumbnails[0].url,
      title: videoDetails.title,
      description: videoDetails.shortDescription,
    };
    castJS.cast(getPlayableVideoURL(videoInfo), metadata);
  };

  castJS.on('playing', () => {
      
  });

  // Connected with device
  castJS.on('connect', () => {

  });  

  return (
    <>
      <nav>
        <a href="/">
          <img src={logo} className="logo" alt="logo" />
        </a>
      </nav>
      <section className='container'>
        <header>
          <form onSubmit={handleVideoSearch}>
            <div className="search-grid">
              <input required name="videoId" type="text" ref={inputURL} placeholder="Paste the video link here" autoFocus />
              <button type="submit">Start</button>
            </div>
          </form>
        </header>

        {videoInfoStatus === "pending" && <Loader />}
        <h6>{videoInfo?.videoDetails.title}</h6>

        {videoInfoStatus === "error" && <h3>No Video found!</h3>}

        {videoInfoStatus === "success" && videoInfo && <main>
          <div className="main-grid">
            <div className="player-wrapper">
              <video className='react-player' controls ref={videoRef} onTimeUpdate={handleTimeUpdate}></video>
            </div>
            <div>
              <Download videoInfo={videoInfo} />
              <button className='cast-button' onClick={() => handleCastClick(videoInfo)}><span className="material-symbols-outlined">
                cast
              </span></button>
            </div>

          </div>

          {subtitleStatus === "pending" && <Loader />}
          {subtitleStatus === "error" && <h3>No subtitle found!</h3>}
          {subtitleStatus === "success" && !subtitle && <h3>No subtitle found!</h3>}
          {subtitleStatus === "success" && subtitle &&
            <Subtitle handleSentenceClick={handleSentenceClick}
              subtitle={subtitle}
              activeSentenceIndex={state.activeSentenceIndex} />
          }
        </main>}
      </section>
    </>
  );
}

function Download({ videoInfo }: { videoInfo: VideoInfo }) {
  return <>
    <details role="list">
      <summary aria-haspopup="listbox" role="button">Download</summary>
      <ul role="listbox" className='download-list'>
        {videoInfo.allFormats.map((format, index) => {
          const isAudioOnly = format.qualityLabel === null
          const hasNoAudio = format.audioCodec === null;
          const suffix = `${hasNoAudio ? "(no audio)" : ""} ${isAudioOnly ? "(audio only)" : ""}`;
          const quality = format.qualityLabel ?? "audio";
          const name = `${quality}.${format.container} ${suffix}`;
          return <li key={index}><a href={format.url}>{name}</a></li>
        })}
      </ul>
    </details>
  </>
}

function Subtitle({ handleSentenceClick, subtitle, activeSentenceIndex }:
  {
    handleSentenceClick: (sentenceInfo: SentenceInfo, index: number) => void,
    subtitle?: SentenceInfo[];
    activeSentenceIndex: number;
  }
) {
  return <section>
    {subtitle?.map((sentenceInfo, index) => {
      return <span key={index}
        className={'sentence ' + (activeSentenceIndex === index ? "active" : "")}
        onClick={() => {
          handleSentenceClick(sentenceInfo, index);
        }}>{sentenceInfo.text + " "}</span>;
    })}
  </section>;
}

export default App;
