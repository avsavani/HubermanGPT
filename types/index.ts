export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type HLVideo = {
  title: string;
  url: string;
  date: string;
  thanks: string;
  content: string;
  length: number;
  tokens: number;
  chunks: HLChapters[];
};

export type HLChapters = {
  video_url: string;
  video_date: string;
  video_title: string;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};

export type HLJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  essays: HLVideo[];
};

