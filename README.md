
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#dataset">Dataset</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

# About The Project

AI-powered search and chat for [Dr. Andrew Huberman](https://twitter.com/hubermanlab)'s [Podcast](http://hubermanlab.com).

All code & data used is 100% open-source.

### Buit with 

* [![OpenAI][OpenAI]][OpenAI-url]
* [![Postgres][Postgres]][Postgres-url]
* [![Next][Next.js]][Next-url]
* [![Python][Python]][Python-url]
* [![Tailwind][Tailwind]][Tailwind-url]

## Dataset

The dataset provides comprehensive information for each video chapter, including timestamps, transcripts, and semantic embeddings.

### Dataset Details

- **id**: Unique identifier for each chapter entry.
- **video_title**: Title of the video (e.g., *Tony Hawk: Harnessing Passion, Drive & Persistence*).
- **chapter_title**: Title of each chapter within the video, providing an overview of the topic.
- **video_date**: Date of the video release. Currently NULL.
- **video_id**: Unique identifier for each video.
- **start_time** and **end_time**: Timestamps indicating the beginning and end of each chapter.
- **conversation**: JSON-encoded transcript segments for each chapter.
- **conversation_length**: Length of the conversation in characters.
- **conversation_tokens**: Approximate token count, useful for NLP tasks.
- **embedding**: Vector embeddings for each chapter, representing semantic content.
- **summary**: Text summary of each chapter. Currently NULL
- **summary_embedding**: Embedding vector for each summary. 
  
For a detailed structure of the dataset, including all fields and their types, please check the [`types/index.ts`](./types/index.ts) file.

### Download

The dataset is available for download on [Google Drive](https://drive.google.com/file/d/1iAoAo9Rx1WzcX7WFIDPwEUXbnA4f5Gg3/view?usp=sharing) in CSV format .

To skip the data scraping and embedding steps, you can download the dataset directly and use it for analysis.

## How It Works

Huberman GPT provides 2 things:

1. A search interface.
2. A chat interface.

### Search

Search was created with [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) (`text-embedding-ada-002`).

First, we loop over the transcription files, break each file down into chunks, and generate embeddings for each chunk of text.

Then in the app, we take the user's search query, generate an embedding, and use the result to find the most similar passages from the book.

The comparison is done using cosine similarity across our database of vectors.

Our database is a Postgres database with the [pgvector](https://github.com/pgvector/pgvector) extension hosted on [Supabase](https://supabase.com/).

Results are ranked by similarity score and returned to the user.

### Chat

Chat builds on top of search. It uses search results to create a prompt that is fed into GPT-3.5-turbo.

This allows for a chat-like experience where the user can ask questions about the Podcast and get answers.

## Running Locally

Here's a quick overview of how to run it locally.

### Requirements

1. Set up OpenAI

You'll need an OpenAI API key to generate embeddings.

2. Set up Supabase and create a database

Note: You don't have to use Supabase. Use whatever method you prefer to store your data. But I like Supabase and think it's easy to use.

There is a schema.sql file in the root of the repo that you can use to set up the database.

Run that in the SQL editor in Supabase as directed.

I recommend turning on Row Level Security and setting up a service role to use with the app.

### Repo Setup

3. Clone repo

```bash
git clone https://github.com/avsavani/hubermangpt
```

4. Install dependencies

```bash
npm i
```

5. Set up environment variables

Create a .env.local file in the root of the repo with the following variables:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=
```

We have to prefix the variables with NEXT_PUBLIC_ so that they are available the edge functions on Vercel on deployment.

### Dataset

6. Run scraping script

```bash
npm run scrape
```

You won't need to run this script as I have already scraped the data and uploaded it to Google Drive.

7. Run embedding script

```bash
npm run embed
```

This reads the json file, generates embeddings for each chunk of text, and saves the results to your database.

There is a 200ms delay between each request to avoid rate limiting.

This process will take 2 hours.

To pause the process use ctrl + c. 
To resume the process use npm run embed again. It will start from where it left off.

### App

8. Run app

```bash
npm run dev
```

## Credits

This code base is based on [Mckay Wrigley's](https://twitter.com/mckaywrigley) implementation of [Paul Graham GPT](https://github.com/mckaywrigley/paul-graham-gpt).

Thanks to [Dr. Andrew Huberman](https://x.com/hubermanlab) for putting out great podcast.

I highly recommend listening to the full podcasts from the results.

## Contact

If you have any questions, feel free to reach out to me on [Twitter](https://twitter.com/ashishsavani1)!

<!-- MARKDOWN LINKS & IMAGES -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[Supabase]: https://img.shields.io/badge/Supabase-000000?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.io
[OpenAI]: https://img.shields.io/badge/OpenAI-000000?style=for-the-badge&logo=openai&logoColor=white
[OpenAI-url]: https://openai.com
[Vercel]: https://img.shields.io/badge/vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[Vercel-url]: https://vercel.com
[Postgres]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org
[Python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com
