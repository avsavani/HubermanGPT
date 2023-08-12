import os
import re
import json
from datetime import timedelta
from concurrent.futures import ThreadPoolExecutor
import yt_dlp
from youtubesearchpython import Playlist


def download_description(video):
    ydl_opts = {}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(video['id'], download=False)
        description = info_dict.get('description', None)
        if description:
            pattern = re.compile(r'(\d{2}:\d{2}:\d{2}) (.*)')
            chapters = pattern.findall(description)
            video['chapters'] = chapters
        else:
            video['chapters'] = None
    return video


def clean_title(title):
    return re.sub(r'[^a-zA-Z0-9]', '', title)


def chapter_time_to_seconds_hh_mm_ss(timestamp):
    time_parts = list(map(int, timestamp.split(':')))
    return timedelta(hours=time_parts[0], minutes=time_parts[1],
                     seconds=time_parts[2] if len(time_parts) > 2 else 0).total_seconds()


def merge_consecutive_segments(data):
    merged_segments = []
    current_speaker = None
    current_segment = ""
    start_time = None

    for segment in data['segments']:
        # Check if 'speaker' key exists in the segment
        if 'speaker' not in segment:
            print(f"Warning: 'speaker' key missing in segment: {segment}")
            continue  # Skip this segment

        speaker = segment['speaker']
        end_time = segment['end']

        if speaker == current_speaker:
            current_segment += " " + segment['text'].strip()
        else:
            if current_speaker:
                merged_segments.append({
                    "start": start_time,
                    "end": end_time,
                    "speaker": current_speaker,
                    "segment": current_segment.strip()
                })
            current_speaker = speaker
            current_segment = segment['text'].strip()
            start_time = segment['start']

    if current_speaker:
        merged_segments.append({
            "start": start_time,
            "end": end_time,
            "speaker": current_speaker,
            "segment": current_segment.strip()
        })

    return merged_segments


def process_video_files(video_files_directory, playlist_file_path):
    # Loading the playlist.json file
    with open(playlist_file_path, 'r') as file:
        playlist_data = json.load(file)

    # Looping through all .json files in the video files directory
    for filename in os.listdir(video_files_directory):
        if filename.endswith('.json'):
            video_file_path = os.path.join(video_files_directory, filename)
            with open(video_file_path, 'r') as file:
                video_data = json.load(file)

            cleaned_video_title = clean_title(filename.replace('.json', ''))
            matching_video_chapters = None

            # Finding the matching video chapters from the playlist
            for video in playlist_data:
                cleaned_playlist_title = clean_title(video['title'])
                if cleaned_video_title in cleaned_playlist_title:
                    matching_video_chapters = video['chapters']
                    break

            if not matching_video_chapters:
                print(f"No matching chapters found for {filename}")
                continue

            # Extracting the segments from the video data
            segments = video_data['segments']

            # Dividing the segments into chapters
            chapters_segments = [[] for _ in range(len(matching_video_chapters))]

            for segment in segments:
                segment_start_time_seconds = float(segment['start'])
                current_chapter_idx = 0
                while current_chapter_idx < len(matching_video_chapters) - 1 and \
                      segment_start_time_seconds >= chapter_time_to_seconds_hh_mm_ss(matching_video_chapters[current_chapter_idx + 1][0]):
                    current_chapter_idx += 1

                chapters_segments[current_chapter_idx].append(segment)

            # Creating conversations within each chapter
            chapters_conversations = [merge_consecutive_segments({"segments": chapter}) for chapter in chapters_segments]

            # Combining the chapters and conversations
            final_structure = [{"title": matching_video_chapters[i][1], "conversations": chapters_conversations[i]} for i in range(len(chapters_conversations))]

            # Saving the processed file with "_processed" appended to the filename
            processed_file_path = os.path.join("/Users/ashishsavani/HubermanGPT/data/processed", filename)
            with open(processed_file_path, 'w') as file:
                json.dump(final_structure, file, indent=4)

            print(f"Processed {filename} and saved to {processed_file_path}")


if __name__ == '__main__':
    # Provide the directory containing all the video files and the path to playlist.json
    video_files_directory = '/Users/ashishsavani/Library/CloudStorage/GoogleDrive-avsavani@gmail.com/My Drive/YouTube (1)/x'
    playlist_file_path = '/Users/ashishsavani/HubermanGPT/data/playlist/playlist.json'
    output_directory = '/Users/ashishsavani/HubermanGPT/data/processed'
    hl_playlist_full = "https://www.youtube.com/playlist?list=PLPNW_gerXa4Pc8S2qoUQc5e8Ir97RLuVW"

    playlist = Playlist(hl_playlist_full)
    print(f'Videos Retrieved: {len(playlist.videos)}')

    while playlist.hasMoreVideos:
        print('Getting more videos...')
        playlist.getNextVideos()
        print(f'Videos Retrieved: {len(playlist.videos)}')
    print('Found all the videos.')

    titles = [video['title'] for video in playlist.videos]

    pattern = re.compile(r'\bDr\.?\s?[A-Z][a-z]+ [A-Z][a-z]+:|\b[A-Z][a-z]+ [A-Z][a-z]+:')


    def filter_titles_with_guests(titles):
        filtered_titles = []
        for title in titles:
            if pattern.search(title):
                filtered_titles.append(title)
        return filtered_titles


    filtered_titles = filter_titles_with_guests(titles)

    for title in filtered_titles:
        print(title)

    # check if playlist.json exists
    if not os.path.exists(playlist_file_path):
        playlist_videos = playlist.videos
        with ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(download_description, playlist_videos))

        with open('/processed/playlist.json', 'w') as f:
            json.dump([x for x in playlist.videos], f)

    process_video_files(video_files_directory, playlist_file_path)

    # total files under video_files_dir
    total_files = len([name for name in os.listdir(video_files_directory) if os.path.isfile(os.path.join(video_files_directory, name))])
    print(f"Total files under {video_files_directory}: {total_files}")

    # total files processed
    total_files_processed = len([name for name in os.listdir(output_directory) if os.path.isfile(os.path.join(output_directory, name))])
    print(f"Total files processed: {total_files_processed}")

    # remaining files
    print(f"Remaining files: {total_files - total_files_processed}")

    # list of remaining files
    remaining_files = [name for name in os.listdir(video_files_directory) if os.path.isfile(os.path.join(video_files_directory, name)) and name not in os.listdir(output_directory)]
    print("List of remaining files:")
    for file in remaining_files:
        print(file)