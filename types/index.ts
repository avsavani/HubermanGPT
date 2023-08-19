export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo",
  GPT_3_16K = "gpt-3.5-turbo-16k"
}

export type HLVideo = {
  title: string;
  url: string;
  date: string;
  thanks: string;
  content: string;
  length: number;
  tokens: number;
  chapters: HLChapter[];
};

export type HLChapter = {
  video_title: string;
  chapter_title: string;
  video_date: string;
  video_id: string;
  start_time: string;
  end_time: string;
  conversation: HLSegment[];
  conversation_length: number;
  conversation_tokens: number;
  embedding: number[];
  summary: string;
};


export type HLSegment = {
  start: number; // float in seconds
  end: number;
  speaker: string;
  segment: string;
}

export type HLJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  videos: HLVideo[];
};

export type Settings = {
  PG_KEY: string | null,
  PG_MATCH_COUNT: string | null,
  PG_MODE: string | null,
}

