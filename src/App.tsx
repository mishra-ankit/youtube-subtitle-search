import React, { FormEvent, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { SentenceInfo, VideoInfo } from './types';
import { getSubtitle, getVideoInfo } from './util';
import { useAsync } from './useAsync';

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
    if (!subtitle) return;

    const videoCurrentTime = videoRef.current?.currentTime;
    const nextSentenceInfo = (subtitle[state?.activeSentenceIndex + 1]);
    if (videoCurrentTime && nextSentenceInfo && videoCurrentTime >= nextSentenceInfo?.start) {
      setState(curr => ({ ...curr, activeSentenceIndex: (curr?.activeSentenceIndex ?? 0) + 1 }));
    }
  };

  useEffect(() => {
    if (videoInfo && videoRef.current) {
      videoRef.current.src = videoInfo.formats[0].url;
      fetchSubtitle();
    }
  }, [videoInfo]);

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
              <input required name="videoId" type="text" ref={inputURL} placeholder="Put youtube URL or video ID here" autoFocus />
              <button type="submit">Go</button>
            </div>
          </form>
        </header>

        {videoInfoStatus === "pending" && <h2>Loading...</h2>}

        {videoInfoStatus === "error" && <h2>No Video found!</h2>}

        {videoInfoStatus === "success" && <main>
          <div className="main-grid">
            <div className="player-wrapper">
              <video className='react-player' controls ref={videoRef} autoPlay onTimeUpdate={handleTimeUpdate}></video>
            </div>
          </div>

          {subtitleStatus === "pending" && <h2>Loading...</h2>}
          {subtitleStatus === "error" && <h2>No subtitle found!</h2>}
          {subtitleStatus === "success" && !subtitle && <h2>No subtitle found!</h2>}
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
