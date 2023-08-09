import os
import json
from datetime import date

def count_chars_and_tokens(text):
    """Count characters and words(tokens) in a text."""
    return len(text), len(text.split())

def merge_data_to_final_file(summaries_dir, output_path):
    # Initialize HLJSON structure
    hljson = {
        "current_date": str(date.today()),
        "author": "Andrew Huberman",
        "url": "https://www.youtube.com/@hubermanlab",
        "length": 0,
        "tokens": 0,
        "essays": []
    }

    for filename in os.listdir(summaries_dir):
        if filename.endswith(".json"):
            with open(os.path.join(summaries_dir, filename), 'r') as file:
                video_data = json.load(file)

            hlvideo = {
                "title": filename.replace('.json', ''),
                "url": "",
                "date": "",
                "content": [],
                "length": 0,
                "tokens": 0,
                "chunks": []
            }

            # Build the content for the video by merging all chapters
            for chapter in video_data:
                # Get all conversation segments as a list
                chapter_content = [conv["segment"] for conv in chapter["conversations"]]
                hlvideo["content"].extend(chapter["conversations"])

                chapter_length, chapter_tokens = count_chars_and_tokens(' '.join(chapter_content))
                hlvideo["length"] += chapter_length
                hlvideo["tokens"] += chapter_tokens

                hlchapter = {
                    "hl_title": chapter["title"],
                    "hl_url": "",
                    "hl_date": "",
                    "content": chapter_content,
                    "content_length": chapter_length,
                    "content_tokens": chapter_tokens,
                    "embedding": []
                }

                hlvideo["chunks"].append(hlchapter)

            hljson["essays"].append(hlvideo)

    # Calculate the overall length and tokens for the entire dataset
    for video in hljson["essays"]:
        hljson["length"] += video["length"]
        hljson["tokens"] += video["tokens"]

    # Save the merged data
    with open(output_path, 'w') as outfile:
        json.dump(hljson, outfile, indent=4)

# Call the function
summaries_directory = "/Users/ashishsavani/HubermanGPT/data/summaries"
final_output_path = "/Users/ashishsavani/HubermanGPT/data/final_data.json"

merge_data_to_final_file(summaries_directory, final_output_path)
