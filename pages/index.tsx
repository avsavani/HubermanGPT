import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { IconArrowRight, IconExternalLink, IconSearch } from "@tabler/icons-react";
import Head from "next/head";

import {searchChapters, fetchAnswer} from '@/services/apiService';
import {loadSettings, saveSettings, clearSettings} from '@/services/settingsService';

import { Answer } from "@/components/Answer/Answer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {HLChapter,HLSegment} from "@/types";

export default function Home(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>("");
  const [chapters, setChapters] = useState<HLChapter[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [mode, setMode] = useState<"search" | "chat">("chat");
  const [matchCount, setMatchCount] = useState<number>(5);
  const [apiKey, setApiKey] = useState<string>("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");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number|null>(null);


  const formatSegment = (segment: HLSegment, index: number,speaker:string) => (
      <React.Fragment key={index}>
        <strong>{segment.speaker === "SPEAKER_01" ? speaker : "Dr. Huberman"}</strong>: {segment.segment} <br /><br />
      </React.Fragment>
  );

  const formatChapterUI = (chapter: HLChapter,speaker:string) => (
      <>
        {chapter.conversation.map((segment, i) => formatSegment(segment, i,speaker))}
      </>
  );

  const handleChapterClick = (index: number) => {
    setSelectedChapterIndex(selectedChapterIndex === index ? null : index);
  };

  const formatChapter = (chapter: HLChapter) => {
    const segments = chapter.conversation.map((segment, index) => formatSegment(segment, index, chapter.video_title.split(':')[0])).join('<br \>');
    return `Video Title: ${chapter.video_title}
              Chapter Title: ${chapter.chapter_title}
              Video Date: ${chapter.video_date}
              Conversation:
              ${segments}`;
  };

  const handleSearch = async (): Promise<void> => {
    if (!apiKey || !query) {
      alert(!apiKey ? 'Please enter an API key.' : 'Please enter a query.');
      return;
    }
    setAnswer('');
    setChapters([]);
    setLoading(true);
    try {
      const results = await searchChapters(apiKey, query, matchCount);
      console.log(results);
      setChapters(results);
      
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };


  const handleAnswer = async (): Promise<void> => {
    if (!apiKey || !query) {
      alert(!apiKey ? 'Please enter an API key.' : 'Please enter a query.');
      return;
    }
    setAnswer('');
    setChapters([]);
    setLoading(true);
    try {
      const results = await searchChapters(apiKey, query, matchCount);
      setChapters(results);
      const prompt = `Use the following passages to provide an answer to the query: "${query}"${results?.map(formatChapter).join('\n\n')}`;
      const stream = await fetchAnswer(apiKey, prompt);
      if (stream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");

        reader.read().then((result) => handleStream(result, reader, decoder));
      }

      setLoading(false);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  // @ts-ignore
  const handleStream = (result: ReadableStreamDefaultReadResult<Uint8Array>, reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder): void => {
    if (result.done) return;

    setAnswer((prev: string) => prev + decoder.decode(result.value));
    reader.read().then((result) => handleStream(result, reader, decoder));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      mode === "search" ? handleSearch() : handleAnswer();
    }
  };

  const handleSave = () => {
    if (apiKey.length !== 51) {
      alert("Please enter a valid API key.");
      return;
    }
    saveSettings(apiKey, matchCount, mode);
    setShowSettings(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    clearSettings();
    setApiKey("");
    setMatchCount(1);
    setMode("search");
  };


  useEffect(() => {
    const { PG_KEY, PG_MATCH_COUNT, PG_MODE } = loadSettings();

    if (PG_KEY) setApiKey(PG_KEY);
    if (PG_MATCH_COUNT) setMatchCount(parseInt(PG_MATCH_COUNT));
    if (PG_MODE) setMode(PG_MODE as "search" | "chat");

    inputRef.current?.focus();
  }, []);

  return (
      <>
        <Head>
          <title>HubermanLab GPT</title>
          <meta
              name="description"
              content={`AI-powered search and chat for Huberman Lab podcast.`}
          />
          <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
          />
          <link
              rel="icon"
              href="/favicon.ico"
          />
        </Head>

        <div className="flex flex-col h-screen">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 sm:pt-8">
              <button
                  className="mt-4 flex cursor-pointer items-center space-x-2 rounded-full border border-zinc-600 px-3 py-1 text-sm hover:opacity-50"
                  onClick={() => setShowSettings(!showSettings)}
              >
                {showSettings ? "Hide" : "Show"} Settings
              </button>

              {showSettings && (
                  <div className="w-[340px] sm:w-[400px]">
                    <div>
                      <div>Mode</div>
                      <select
                          className="max-w-[400px] block w-full cursor-pointer rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                          value={mode}
                          onChange={(e) => setMode(e.target.value as "search" | "chat")}
                      >
                        <option value="search">Search</option>
                        <option value="chat">Chat</option>
                      </select>
                    </div>

                    <div className="mt-2">
                      <div>Results Count</div>
                      <input
                          type="number"
                          min={1}
                          max={10}
                          value={matchCount}
                          onChange={(e) => setMatchCount(Number(e.target.value))}
                          className="max-w-[400px] block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="mt-2">
                      <div>OpenAI API Key</div>
                      <input
                          type="password"
                          placeholder="OpenAI API Key"
                          className="max-w-[400px] block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                          value={apiKey}
                          onChange={(e) => {
                            setApiKey(e.target.value);

                            if (e.target.value.length !== 51) {
                              setShowSettings(true);
                            }
                          }}
                      />
                    </div>

                    <div className="mt-4 flex space-x-2 justify-center">
                      <div
                          className="flex cursor-pointer items-center space-x-2 rounded-full bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                          onClick={handleSave}
                      >
                        Save
                      </div>

                      <div
                          className="flex cursor-pointer items-center space-x-2 rounded-full bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                          onClick={handleClear}
                      >
                        Clear
                      </div>
                    </div>
                  </div>
              )}

              {apiKey.length === 51 ? (
                  <div className="relative w-full mt-4">
                    <IconSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                        ref={inputRef}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 pl-10 pr-12
                        leading-tight focus:outline-none focus:bg-white focus:border-gray-500sm:mt-0 sm:rounded-full
                        sm:pl-10 sm:pr-16"
                        type="text"
                        placeholder="How to fall asleep faster?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />


                    <button className="absolute top-1/2 right-2 transform -translate-y-1/2">
                      <IconArrowRight
                          onClick={mode === "search" ? handleSearch : handleAnswer}
                          className="h-5 w-5 rounded-full bg-blue-500
                          hover:cursor-pointer hover:bg-blue-600 sm:h-8 sm:w-8 text-white"
                      />
                    </button>
                  </div>

              ) : (
                  <div className="text-center font-bold text-3xl mt-7">
                    Please enter your
                    <a
                        className="mx-2 underline hover:opacity-50"
                        href="https://openai.com/product"
                    >
                      OpenAI API key
                    </a>
                    in settings.
                  </div>
              )}

              {loading ? (
                  <div className="mt-6 w-full">
                    {mode === "chat" && (
                        <>
                          <div className="font-bold text-2xl">Answer</div>
                          <div className="animate-pulse mt-2">
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded mt-2"></div>
                            <div className="h-4 bg-gray-300 rounded mt-2"></div>
                            <div className="h-4 bg-gray-300 rounded mt-2"></div>
                            <div className="h-4 bg-gray-300 rounded mt-2"></div>

                          </div>
                        </>
                    )}

                    <div className="font-bold text-2xl mt-6">Passages</div>
                    <div className="animate-pulse mt-2">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                    </div>
                  </div>
              ) : answer ? (
                  <div className="mt-6">
                    <div className="font-bold text-2xl mb-2">Answer</div>
                    <Answer text={answer} />

                    <div className="mt-6 mb-16">
                      <div className="font-bold text-2xl">Passages</div>

                      {chapters.map((chapter, index) => (
                          <div
                              key={index}
                              className={`mt-4 border border-zinc-600 rounded-lg p-4 transition-all duration-500 ${selectedChapterIndex === index ? 'bg-blue-100' : ''} ${answer ? 'animate-slideUp' : ''}`}
                              onClick={() => handleChapterClick(index)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <div className="font-bold text-xl">{chapter.chapter_title}</div>
                                <div className="mt-1 font-bold text-sm">{chapter.video_date}</div>
                                <div className="mt-1 text-sm">
                                  {chapter.video_title.split('|')[0].split('｜')[0]}
                                </div>
                              </div>
                              <a className="hover:opacity-50 ml-2"
                                 href={`https://www.youtube.com/watch?v=${chapter.video_id}&t=${Math.round(parseFloat(chapter.start_time))}s`}
                                 target="_blank"
                                 rel="noreferrer">
                                <IconExternalLink />
                              </a>
                            </div>

                            <div
                                className={`passage-content ${selectedChapterIndex === index ? 'h-auto mt-2' : 'h-0'} overflow-hidden`}
                            >
                              {formatChapterUI(chapter, chapter.video_title.split(':')[0].split('：')[0])}
                            </div>
                          </div>

                      ))}
                    </div>
                  </div>
              ) : chapters.length > 0 ? (
                  <div className="mt-6 pb-16">
                    <div className="font-bold text-2xl">Passages</div>
                    {chapters.map((video, index) => (
                        <div key={index}>
                          <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-bold text-xl">{video.chapter_title}</div>
                                <div className="mt-1 font-bold text-sm">{video.video_date}</div>
                              </div>
                              <a
                                  className="hover:opacity-50 ml-2"
                                  href={video.video_id}
                                  target="_blank"
                                  rel="noreferrer"
                              >
                                <IconExternalLink />
                              </a>
                            </div>
                            <div className="mt-2">{formatChapterUI(video,video.video_title.split(':')[0])}</div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="mt-6 text-center text-lg">{`AI-powered search & chat for HubermanLab Podcast.`}</div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </>
  );
}