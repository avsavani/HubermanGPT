import openai
import json
import os

openai.api_key = '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'
CHECKPOINT_FILE = "/Users/ashishsavani/HubermanGPT/data/checkpoint.json"
SUMMARIES_DIR = "/Users/ashishsavani/HubermanGPT/data/summaries"

def replace_non_ascii_chars(filename):
    # print(f"Replacing non-ascii characters in filename: {filename}")
    char_map = {
        '：': ':',
        '’': "'",
        'ø': 'o',
        '｜': '|'
    }
    for char, replacement in char_map.items():
        filename = filename.replace(char, replacement)
    return filename

def save_checkpoint(processed_files, current_file, chapter_index):
    with open(CHECKPOINT_FILE, 'w') as f:
        data = {
            "processed_files": processed_files,
            "current_file_progress": {
                "filename": current_file,
                "chapter_index": chapter_index
            }
        }
        json.dump(data, f)


def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r') as f:
            return json.load(f)
    return {"processed_files": [], "current_file_progress": None}


def create_summary(prompt, system_prompt, max_retries=3):
    retries = 0
    while retries < max_retries:
        try:
            system_prompt_message = {
                "role": "system",
                "content": system_prompt
            }
            user_message = {
                "role": "user",
                "content": prompt
            }

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    system_prompt_message,
                    user_message
                ]
            )
            response_content = response.choices[0].message["content"]
            # print(f"Response: {response}")
            # Attempt to decode the response content as JSON
            json.loads(response_content)
            return response_content

        except json.JSONDecodeError:
            print(f"Failed to decode OpenAI response to JSON. Retry {retries + 1}/{max_retries}")
            retries += 1

    # If we reached this point, we've failed all the retries
    raise ValueError("Failed to get valid JSON from OpenAI after max retries.")


system_prompt = "You are an AI podcast summarization assistant. \n" \
                "Guidelines: \n" \
                "Users provide: \n" \
                "   1) Current transcript snippets from podcast that needs to be summarize\n" \
                "   2) A previous snippet's summary\n" \
                "- Conversations can be: host-audience, host-guest\n" \
                "- Turn conversations into a detailed topic summary. Limit: 300 words or three paragraphs\n" \
                "- If a snippet is about sponsors, return 'True' for is_sponsor\n" \
                "- Do not mention podcast title, chapter title, or that it's a conversation summary\n" \
                "- RESPONSE MUST FORMATTED IN COMPLETE JSON with keys: {is_sponsor:'val', summary:'val'}"


def process_video_files_with_summary(output_directory):
    whole_file = False
    checkpoint = load_checkpoint()
    processed_files = checkpoint["processed_files"]
    current_file_progress = checkpoint["current_file_progress"]

    files = os.listdir(output_directory)

    for filename in files:
        if filename in processed_files:
            continue  # skip already processed files

        if current_file_progress and filename != current_file_progress["filename"]:
            continue  # skip files until we reach the file in the checkpoint

        start_from = 0 if not current_file_progress else current_file_progress["chapter_index"] + 1

        print(f"Processing file {filename}")
        # Before opening a file
        filename = replace_non_ascii_chars(filename)

        if filename.endswith('.json'):
            processed_file_path = os.path.join(output_directory, filename)

            with open(processed_file_path, 'r') as file:
                processed_video_data = json.load(file)

            for i, chapter in enumerate(processed_video_data):
                if i < start_from:  # if we're using a checkpoint, skip already processed chapters
                    continue

                prompt = f"Podcast episode title: {filename.split('|')[0]} \n" \
                         f"Summary from previous chapter(just for continuous context) : " \
                         f"     {chapter['summary']['summary'] if 'summary' in chapter else 'None'} \n\n"

                prompt += f"Current chapter conversation snippet: \n" \
                          f"    Title: {chapter['title']} \n" \
                          f"        Conversation: \n"

                for conversation in chapter['conversations']:
                    prompt += f"{conversation['speaker']}: {conversation['segment']} \n"

                # print(f"Prompt: {prompt}")
                # print(f"System Prompt: {system_prompt}")

                summary = create_summary(prompt, system_prompt)
                print(f"Summary: {summary}")
                processed_video_data[i]['summary'] = json.loads(summary)

                save_checkpoint(processed_files, filename, i)  # update checkpoint

            with open(processed_file_path, 'w') as file:
                json.dump(processed_video_data, file, indent=4)
        if whole_file:
            print(f"Processed {filename} and saved to {processed_file_path}")

        summary_file_path = os.path.join(SUMMARIES_DIR, filename)
        with open(summary_file_path, 'w') as file:
            json.dump(processed_video_data, file, indent=4)

        processed_files.append(filename)
        current_file_progress = None  # Reset for the next file
        save_checkpoint(processed_files, None, 0)  # update checkpoint


if __name__ == "__main__":
    playlist_file_path = '/Users/ashishsavani/HubermanGPT/data/playlist/playlist.json'
    output_directory = '/Users/ashishsavani/HubermanGPT/data/processed'
    hl_playlist_full = "https://www.youtube.com/playlist?list=PLPNW_gerXa4Pc8S2qoUQc5e8Ir97RLuVW"
    process_video_files_with_summary(output_directory)
