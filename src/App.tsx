import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

type SentenceInfo = { start: number, text: string };
type VideoInfo = {
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
  ]
};

async function getVideoInfo(input: string): Promise<VideoInfo> {
  const url = `https://youtube-video-info-fvxkv650trvd.runkit.sh/?url=${input}`;
  const videoInfo = await fetch(url).then(t => t.json()) as VideoInfo;
  return videoInfo;
}

async function getSubtitle(url: string): Promise<SentenceInfo[]> {
  const resp = await fetch(url)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))

  const sentenceNodes = Array.from(resp.getElementsByTagName("text"));

  return sentenceNodes.map(sentence => ({
    start: parseFloat(sentence.getAttribute("start") as string),
    duration: parseFloat(sentence.getAttribute("dur") as string),
    text: sentence.textContent as string
  }));
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{
    videoURL: string,
    subtitle?: SentenceInfo[],
  }>();

  const handleVideoSearch = async () => {
    const val = inputRef.current?.value;
    if (val) {
      const info = await getVideoInfo(val);

      const videoURL = info.formats[0].url;
      setState({ videoURL });

      // TODO: Handle better
      const subtitle = await getSubtitle(info.tracks[0].baseUrl);
      setState({ videoURL, subtitle });

    } else {
      // TODO: handle 
    }
  }

  useEffect(() => {
    if (state?.videoURL && videoRef.current) {
      videoRef.current.src = state?.videoURL;
    }
  }, [state?.videoURL]);

  const handleSentenceClick = (sentenceInfo: SentenceInfo) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sentenceInfo.start;
    }
  }

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
            <input type="text" ref={inputRef} />
            <button type="submit" onClick={handleVideoSearch}>Go</button>
          </div>
        </header>

        {state && <main>
          <div className="main-grid">
            <video controls ref={videoRef}></video>
            <section>
              <input type="search" id="search" name="search" placeholder="Search" />
            </section>
          </div>

          <section>
            {state.subtitle?.map((sentenceInfo, index) => {
              return <span key={index} className='sentence' onClick={() => {
                handleSentenceClick(sentenceInfo);
              }}>{sentenceInfo.text + " "}</span>
            })}
          </section>
        </main>}
      </section>
    </>
  );
}

export default App;
