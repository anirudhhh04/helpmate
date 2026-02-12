import sys
import cv2
import numpy as np
import json
import os
import uuid
from pdf2image import convert_from_path

def convert_pdf_to_image(pdf_path):
    images = convert_from_path(
        pdf_path,
        dpi=200,
        poppler_path=r"C:\poppler\poppler-25.12.0\Library\bin"
    )
    temp_image = f"pdf_{uuid.uuid4().hex}.jpg"
    images[0].save(temp_image, "JPEG")
    return temp_image

def analyze_image(image_path):
    temp_pdf_image = None

    try:
        # 1️⃣ Check file exists
        if not os.path.exists(image_path):
            return {"success": False, "error": "File not found"}

        # 2️⃣ Convert PDF if needed
        if image_path.lower().endswith(".pdf"):
            temp_pdf_image = convert_pdf_to_image(image_path)
            image_path = temp_pdf_image

        # 3️⃣ Load image
        original = cv2.imread(image_path)
        if original is None:
            return {"success": False, "error": "Could not read image"}

        # 4️⃣ ELA
        temp_filename = f"temp_ela_{uuid.uuid4().hex}.jpg"
        cv2.imwrite(temp_filename, original, [cv2.IMWRITE_JPEG_QUALITY, 90])

        compressed = cv2.imread(temp_filename)
        diff = cv2.absdiff(original, compressed)
        gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        max_diff = int(np.max(gray_diff))

        # Remove ELA temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        is_fake = max_diff > 15

        return {
            "success": True,
            "tamper_score": max_diff,
            "is_tampered": is_fake,
            "converted_image": temp_pdf_image if temp_pdf_image else None,
            "verdict": "Integrity issue detected" if is_fake else "No strong tampering evidence"
        }

    except Exception as e:
        return {
            "success": False,
            "is_tampered": True,  # safer fallback
            "error": str(e)
        }

if __name__ == "__main__":
    input_path = sys.argv[1]
    result = analyze_image(input_path)
    print(json.dumps(result))
