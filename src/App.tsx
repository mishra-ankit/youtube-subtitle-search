import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { SentenceInfo } from './types';
import { getSubtitle, getVideoInfo } from './util';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputURL = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{
    rawVideoURL?: string,
    subtitle?: SentenceInfo[],
    activeSentenceIndex: number
  }>({activeSentenceIndex: 0});

  const handleVideoSearch = async () => {
    const val = inputURL.current?.value;
    if (val) {
      const info = await getVideoInfo(val);
      const rawVideoURL = info.formats[0].url;
      setState((curr) => ({ ...curr, rawVideoURL }));

      // TODO: Handle better
      const subtitle = await getSubtitle(info.tracks[0].baseUrl);
      setState({ rawVideoURL, subtitle, activeSentenceIndex: 0 });
    } else {
      // TODO: handle 
    }
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
    const videoCurrentTime =  videoRef.current?.currentTime;
    // @ts-ignore
    const nextSentenceInfo = (state?.subtitle[state?.activeSentenceIndex + 1]);
    if (videoCurrentTime && nextSentenceInfo && videoCurrentTime >= nextSentenceInfo?.start) {
      setState(curr => ({...curr, activeSentenceIndex: (curr?.activeSentenceIndex ?? 0) + 1}));
    }
  };

  useEffect(() => {
    if (state?.rawVideoURL && videoRef.current) {
      videoRef.current.src = state?.rawVideoURL;
    }
  }, [state?.rawVideoURL]);

  return (
    <>
      <nav>
        <a href="/">
          <img src={logo} className="logo" alt="logo" />
        </a>
      </nav>
      <section className='container'>
        <header>
          <div className="search-grid">
            <input name="videoId" type="text" ref={inputURL} placeholder="Put youtube URL or video ID here" autoFocus />
            <button type="submit" onClick={handleVideoSearch}>Go gu</button>
          </div>
        </header>

        {state && <main>
          <div className="main-grid">
            <video controls ref={videoRef} autoPlay onTimeUpdate={handleTimeUpdate}></video>
          </div>

          <Subtitle handleSentenceClick={handleSentenceClick} subtitle={state.subtitle} activeSentenceIndex={state.activeSentenceIndex} />
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
