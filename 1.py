from PIL import Image
import os


if __name__ == '__main__':
    source_icon_filename = 'icon.png'
    # Standard PWA icon sizes, now including 1024x1024
    output_sizes = [192, 512, 1024]

    # Determine the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_icon_path = os.path.join(script_dir, source_icon_filename)

    try:
        if not os.path.exists(source_icon_path):
            raise FileNotFoundError(f"Source icon '{source_icon_path}' not found.")

        with Image.open(source_icon_path) as img:
            original_width, original_height = img.size
            print(f"Read '{source_icon_filename}', dimensions: {original_width}x{original_height}.")

            # Convert image to RGBA if it's not already in a suitable mode (RGB/RGBA)
            # This helps handle various source image formats and transparency correctly.
            if img.mode == 'P':  # Palette mode (common for GIFs, some PNGs)
                print('Converting source image from mode P (Palette) to RGBA.')
                img = img.convert('RGBA')
            elif img.mode == 'L':  # Grayscale
                if 'transparency' in img.info:  # Grayscale with transparency
                    print('Converting source image from mode L (Grayscale with transparency) to LA then RGBA.')
                    img = img.convert('LA').convert('RGBA')  # LA is L with Alpha
                else:
                    print('Converting source image from mode L (Grayscale) to RGB then RGBA.')
                    img = img.convert('RGB').convert('RGBA')  # Convert to RGB first, then RGBA
            elif img.mode not in ('RGB', 'RGBA'):
                print(f'Converting source image from mode {img.mode} to RGBA for compatibility.')
                img = img.convert('RGBA')

            # This will make sure the list of output sizes is unique and sorted
            all_target_sizes = sorted(list(set(output_sizes)))

            for target_size in all_target_sizes:
                # Output filename will be in the same directory as the script
                output_filename = f'icon-{target_size}x{target_size}.png'
                output_icon_path = os.path.join(script_dir, output_filename)

                print(f"Resizing '{source_icon_filename}' to {target_size}x{target_size} and saving as '{output_filename}'...")

                # Resize the image. Image.Resampling.LANCZOS is a high-quality downsampling filter.
                # This will make the icon square {target_size}x{target_size}.
                # If the original icon.png is not square, its aspect ratio will be changed.
                resized_img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)

                # Save the resized image, always as PNG for web icons
                resized_img.save(output_icon_path, 'PNG')
                print(f"Successfully generated '{output_filename}' at '{output_icon_path}'.")

    except FileNotFoundError as fnf_error:
        print(f'Error: {fnf_error}')
        print(f"No icons were generated. Please ensure '{source_icon_filename}' exists in the script's directory: '{script_dir}'.")
    except Exception as e:
        print(f'An unexpected error occurred during icon resizing: {e}')
        print('Icon resizing failed.')
