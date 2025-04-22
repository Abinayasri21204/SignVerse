# src/generate_avatar.py
import os
import cv2
import moviepy.editor as mp

# Specify the folder containing extracted videos
video_folder = "src/videos"  # Path to your video dataset

# Function to get the smallest video size for uniform cropping
def get_min_resolution(video_folder):
    min_width, min_height = float('inf'), float('inf')
    for video_file in os.listdir(video_folder):
        if video_file.endswith(".mp4"):
            cap = cv2.VideoCapture(os.path.join(video_folder, video_file))
            if cap.isOpened():
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                min_width = min(min_width, width)
                min_height = min(min_height, height)
            cap.release()
    return min_width, min_height if min_width != float('inf') else (200, 200)  # Match LHS size

# Function to crop videos to the target size
def crop_video(input_path, output_path, target_width, target_height):
    clip = mp.VideoFileClip(input_path)
    cropped_clip = clip.crop(width=target_width, height=target_height, x_center=clip.w / 2, y_center=clip.h / 2)
    cropped_clip.write_videofile(output_path, codec="libx264", fps=clip.fps, verbose=False, logger=None)

# Function to merge videos
def merge_videos(video_paths, output_path):
    clips = [mp.VideoFileClip(v) for v in video_paths]
    final_clip = mp.concatenate_videoclips(clips, method="compose")
    final_clip.write_videofile(output_path, codec="libx264", fps=30, verbose=False, logger=None)

# Main function to generate video from gloss sentence
def generate_avatar_video(gloss_sentence):
    min_width, min_height = get_min_resolution(video_folder)
    print(f"Target video size: {min_width}x{min_height}")

    video_files = gloss_sentence.split()
    cropped_video_paths = []

    for word in video_files:
        video_path = os.path.join(video_folder, f"{word}.mp4")
        cropped_video_path = os.path.join(video_folder, f"cropped_{word}.mp4")
        if os.path.exists(video_path):
            crop_video(video_path, cropped_video_path, min_width, min_height)
            cropped_video_paths.append(cropped_video_path)
        else:
            print(f"Warning: Video for '{word}' not found!")

    if cropped_video_paths:
        final_video_path = "public/videos/final_output.mp4"  # Save to public folder
        os.makedirs("public/videos", exist_ok=True)
        merge_videos(cropped_video_paths, final_video_path)
        print("Merged video saved at:", final_video_path)
    else:
        print("No videos to merge!")

if __name__ == "__main__":
    gloss_sentence = "hello nice to meet you woman"  # Default for testing
    generate_avatar_video(gloss_sentence)