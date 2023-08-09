# Applying the final script to the data to test the merging of consecutive segments from the same speaker
import json
import os
def merge_consecutive_segments(data):
    merged_segments = []
    current_speaker = None
    current_segment = ""
    start_time = None

    for segment in data['segments']:
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

if __name__ == "__main__":
    for file in os.listdir('/Users/ashishsavani/HubermanGPT/data'):
        with open('/Users/ashishsavani/HubermanGPT/data/' + file) as f:
            data = json.load(f)
            merged_segments = merge_consecutive_segments(data)

        # wrire merged segments to a new file named "merged_segments.json"
        with open('/Users/ashishsavani/HubermanGPT/data/' + file, 'w') as f:
            json.dump(merged_segments, f, indent=4)
        
