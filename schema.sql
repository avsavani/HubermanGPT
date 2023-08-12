-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing



create table if not exists
  chapters (
    id SERIAL primary key,
    video_title text,
    chapter_title text,
    video_date text,
    video_id text,
    start_time float,
    end_time float,
    conversation JSONB,
    conversation_length integer,
    conversation_tokens bigint,
    embedding vector (1536)
  );

create or replace function chapter_search(
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  video_title text,
  chapter_title text,
  video_date text,
  video_id text,
  start_time float,
  end_time float,
  conversation JSONB,
  conversation_length integer,
  conversation_tokens bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    chapters.id,
    chapters.video_title,
    chapters.chapter_title,
    chapters.video_date,
    chapters.video_id,
    chapters.start_time,
    chapters.end_time,
    chapters.conversation,
    chapters.conversation_length,
    chapters.conversation_tokens,
    1 - (chapters.embedding <=> query_embedding) as similarity
  from chapters
  where 1 - (chapters.embedding <=> query_embedding) > similarity_threshold
  order by chapters.embedding <=> query_embedding
  limit match_count;
end;
$$;

create index on chapters
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- RUN 1st create extension vector;