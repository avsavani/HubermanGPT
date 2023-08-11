export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type HLVidoe = {
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
  chapter_title: string;
  hl_url: string;
  hl_date: string;
  hl_id: string;
  start_time: string;
  end_time: string;
  conversation: HLSegment[];
  conversation_length: number;
  content_tokens: number;
  embedding: number[];
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
  videos: HLVidoe[];
};

