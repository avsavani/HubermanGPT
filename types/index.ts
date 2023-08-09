export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type PGEssay = {
  title: string;
  url: string;
  date: string;
  thanks: string;
  content: string;
  length: number;
  tokens: number;
  chunks: PGChunk[];
};

export type PGChunk = {
  hl_title: string;
  hl_url: string;
  hl_date: string;
  hl_thanks: string;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};

export type PGJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  essays: PGEssay[];
};

