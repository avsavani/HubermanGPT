import os
import json
from datetime import timedelta

def hh_mm_ss_to_seconds(timestamp):
    """Convert a timestamp in HH:MM:SS format to seconds."""
    hours, minutes, seconds = map(int, timestamp.split(':'))
    return timedelta(hours=hours, minutes=minutes, seconds=seconds).total_seconds()


def process_transcript(transcript, chapters):
    """Process the transcript file according to the chapters."""
    processed_transcript = []
    video_end_time = transcript[-1]['end']

    chapter_index = 0  # Track the current chapter index
    current_speaker = None
    current_segment = None
    conversations = []

    for paragraph in transcript:
        for sentence in paragraph['sentences']:
            sentence_start = sentence['start']
            sentence_end = sentence['end']

            # Move to the next chapter if the sentence is beyond the current chapter's end
            while chapter_index < len(chapters) - 1 and sentence_start >= hh_mm_ss_to_seconds(chapters[chapter_index + 1][0]):
                # Append the last segment of the previous chapter
                if current_segment:
                    conversations.append(current_segment)
                    current_segment = None

                # Add the completed chapter to the processed transcript and start a new chapter
                chapter_title = chapters[chapter_index][1]
                processed_transcript.append({'title': chapter_title, 'conversations': conversations})
                conversations = []
                chapter_index += 1
                current_speaker = None

            # Start a new segment if the speaker changes
            if current_speaker != paragraph['speaker']:
                if current_segment:
                    conversations.append(current_segment)
                current_speaker = paragraph['speaker']
                current_segment = {
                    'start': sentence_start,
                    'end': sentence_end,
                    'speaker': current_speaker,
                    'segment': sentence['text']
                }
            else:
                current_segment['end'] = sentence_end
                current_segment['segment'] += ' ' + sentence['text']

    # Append the last segment and chapter
    if current_segment:
        conversations.append(current_segment)
    if chapter_index < len(chapters):
        chapter_title = chapters[chapter_index][1]
        processed_transcript.append({'title': chapter_title, 'conversations': conversations})

    return processed_transcript

def process_video_files(video_files_directory, playlist_file_path, output_directory):
    """Process all video files and save the results."""
    # Load the playlist data from a .json file
    with open(playlist_file_path, 'r') as file:
        playlist_data = json.load(file)

    # Process each .json file in the video files directory
    for filename in os.listdir(video_files_directory):
        if filename.endswith('.json'):
            video_id = filename[:-5]  # Remove '.json' from filename to get the id
            video_file_path = os.path.join(video_files_directory, filename)

            # Find the video in the playlist by id
            matching_video = next((video for video in playlist_data if video['id'] == video_id), None)
            if matching_video is None:
                print(f"No matching video found for {filename}")
                continue

            # Fetch chapters from the matching video data
            matching_video_chapters = matching_video.get('chapters', [])
            if not matching_video_chapters:
                print(f"No chapters found for video with id {video_id}")
                continue

            # Open and read video data from .json file
            with open(video_file_path, 'r') as file:
                video_data = json.load(file)

            # Process the transcript and create the final structure
            final_structure = process_transcript(video_data, matching_video_chapters)

            # Save the processed data to a .json file
            processed_file_path = os.path.join(output_directory, f"{video_id}.json")
            with open(processed_file_path, 'w') as file:
                json.dump(final_structure, file, indent=4)

            print(f"Processed {filename} and saved to {processed_file_path}")


# Example usage
if __name__ == '__main__':
    video_files_directory = '/Users/ashishsavani/HubermanGPT/data/new_data'
    playlist_file_path = '/Users/ashishsavani/HubermanGPT/data/playlist/playlist.json'
    output_directory = '/Users/ashishsavani/HubermanGPT/data/new_processed'

    # Call the processing function
    process_video_files(video_files_directory, playlist_file_path, output_directory)
