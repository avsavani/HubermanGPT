import os
import json
from datetime import date
import re


# this script is used to merge the data from the summaries and the playlist
# Path: scripts/merge.py
# output file will be saved in data/final_data.json
def remove_special_chars(text):
    """Remove special characters and spaces from the given text."""
    return re.sub(r'[^a-zA-Z0-9]', '', text)


def count_chars_and_tokens(text):
    """Count characters and words(tokens) in a text."""
    return len(text), len(text.split())


def merge_data_to_final_file(summaries_dir, output_path, playlist_path):
    # Initialize HLJSON structure
    hljson = {
        "current_date": str(date.today()),
        "author": "Andrew Huberman",
        "url": "https://www.youtube.com/@hubermanlab",
        "length": 0,
        "tokens": 0,
        "videos": []
    }
    with open(playlist_path, 'r') as pl_file:
        playlist_data = json.load(pl_file)

    for filename in os.listdir(summaries_dir):

        if filename.endswith(".json"):
            with open(os.path.join(summaries_dir, filename), 'r') as file:
                video_data = json.load(file)
            cleaned_filename = remove_special_chars(filename.replace('.json', ''))
            # print(cleaned_filename)

            hlvideo = {
                "title": filename.replace('.json', ''),
                "url": "",
                "date": "",
                "content": [],
                "length": 0,
                "tokens": 0,
                "chapters": []
            }

            for i, title in enumerate([video['title'] for video in playlist_data]):
                if cleaned_filename in remove_special_chars(title):
                    matching_video = playlist_data[i]
                    print("Matched:" + title + " ** " + matching_video.get("id", ""))
                    hlvideo["url"] = matching_video.get("url", "")
                    hlvideo["date"] = matching_video.get("date", "")
                    hlvideo["id"] = matching_video.get("id", "")

            # Build the content for the video by merging all chapters
            for chapter in video_data:
                # Get all conversation segments as a list
                chapter_content = [conv["segment"] for conv in chapter["conversations"]]
                hlvideo["content"].extend(chapter["conversations"])

                chapter_length, chapter_tokens = count_chars_and_tokens(' '.join(chapter_content))
                hlvideo["length"] += chapter_length
                hlvideo["tokens"] += chapter_tokens

                hlchapter = {
                    "video_title": hlvideo["title"],
                    "chapter_title": chapter["title"],
                    "video_date": "",
                    'video_id': hlvideo["id"],
                    "start_time": chapter['conversations'][0]['start'],
                    "end_time": chapter['conversations'][-1]['end'],
                    "conversation": chapter["conversations"],
                    "conversation_length": chapter_length,
                    "conversation_tokens": chapter_tokens,
                    "embedding": []
                }

                hlvideo["chapters"].append(hlchapter)

            hljson["videos"].append(hlvideo)

    # Calculate the overall length and tokens for the entire dataset
    for video in hljson["videos"]:
        hljson["length"] += video["length"]
        hljson["tokens"] += video["tokens"]

    # Save the merged data
    with open(output_path, 'w') as outfile:
        json.dump(hljson, outfile, indent=4)


if __name__ == "__main__":
    # Call the function
    summaries_directory = "/Users/ashishsavani/HubermanGPT/data/summaries"
    final_output_path = "/Users/ashishsavani/HubermanGPT/data/final_data.json"

    merge_data_to_final_file(summaries_directory, final_output_path,
                             playlist_path="/Users/ashishsavani/HubermanGPT/data/playlist/playlist.json")
