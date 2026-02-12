import sys
import cv2
import numpy as np
import json
import os

def analyze_image(image_path):
    try:
        # 1. Check if file exists
        if not os.path.exists(image_path):
            return {"success": False, "error": "File not found"}

        # 2. Load Original Image
        original = cv2.imread(image_path)
        if original is None:
            return {"success": False, "error": "Could not read image"}

        # 3. ERROR LEVEL ANALYSIS (ELA) Logic
        # Save a temporary copy at 90% quality
        temp_filename = "temp_ela.jpg"
        cv2.imwrite(temp_filename, original, [cv2.IMWRITE_JPEG_QUALITY, 90])
        
        # Read the compressed copy
        compressed = cv2.imread(temp_filename)
        
        # 4. Calculate the difference (The "Digital Noise")
        # Real docs have uniform noise. Fake docs have spikes in noise where edited.
        diff = cv2.absdiff(original, compressed)
        
        # Convert to grayscale to measure intensity
        gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        
        # Find the maximum difference value (The "Tamper Score")
        max_diff = np.max(gray_diff)
        
        # Clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        # 5. VERDICT LOGIC
        # Score < 15: Likely Original / Clean Scan
        # Score > 15: High probability of digital manipulation (Photoshop)
        is_fake = int(max_diff) > 15

        return {
            "success": True,
            "tamper_score": int(max_diff),
            "is_tampered": is_fake,
            "verdict": "Likely Fake" if is_fake else "Authentic"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Get the file path sent from Node.js
    input_path = sys.argv[1]
    result = analyze_image(input_path)
    
    # Print JSON so Node.js can read it
    print(json.dumps(result))