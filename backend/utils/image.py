"""
Image validation and processing utilities
for CropGuard AI.

Handles validation of uploaded leaf images
before they are sent to GPT-4o for analysis.

Why validate images?
    Without validation a farmer could accidentally
    upload a corrupt file, a non-image file or an
    image that is too large. This would waste API
    credits and produce confusing error messages.

    Validating early gives clear helpful error
    messages before any API calls are made.

Supported formats:
    - JPEG (image/jpeg)
    - PNG  (image/png)
    - WEBP (image/webp)

Size limits:
    - Maximum: 5MB
    - Minimum: 5KB (too small = likely not useful)

Usage:
    from utils.image import validate_image
    
    is_valid, message = validate_image(
        image_data=base64_string,
        image_type="image/jpeg"
    )
    
    if not is_valid:
        raise HTTPException(400, detail=message)
"""

# backend/utils/image.py
import base64
import logging

logger = logging.getLogger(__name__)

# Supported image MIME types
SUPPORTED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
]

# File size limits in bytes
MAX_SIZE_BYTES = 5 * 1024 * 1024   # 5MB
MIN_SIZE_BYTES = 5 * 1024          # 5KB


def validate_image(
    image_data: str,
    image_type: str
) -> tuple:
    """
    Validate a base64 encoded image before processing.
    
    Checks that the image:
    - Is a supported format (JPEG, PNG, WEBP)
    - Is valid base64 encoded data
    - Is within acceptable size limits
    - Is not empty or corrupted
    
    Args:
        image_data: Base64 encoded image string
        image_type: MIME type of the image
        
    Returns:
        tuple[bool, str]:
            - True, "" if image is valid
            - False, error_message if invalid
            
    Example:
        is_valid, message = validate_image(
            image_data=base64_string,
            image_type="image/jpeg"
        )
        if not is_valid:
            print(message)
            # "Unsupported format. Use JPEG, PNG or WEBP"
    """
    # Check image type is supported
    if image_type.lower() not in SUPPORTED_TYPES:
        message = (
            f"Unsupported image format: {image_type}. "
            f"Please use JPEG, PNG or WEBP."
        )
        logger.warning(message)
        return False, message

    # Check image data is not empty
    if not image_data or len(image_data.strip()) == 0:
        message = "No image data provided."
        logger.warning(message)
        return False, message

    # Validate base64 encoding
    try:
        decoded = base64.b64decode(image_data)
    except Exception:
        message = (
            "Invalid image data. "
            "Image must be base64 encoded."
        )
        logger.warning(message)
        return False, message

    # Check file size
    file_size = len(decoded)

    if file_size < MIN_SIZE_BYTES:
        message = (
            f"Image is too small ({file_size} bytes). "
            f"Please upload a clearer, higher resolution photo."
        )
        logger.warning(message)
        return False, message

    if file_size > MAX_SIZE_BYTES:
        size_mb = file_size / (1024 * 1024)
        message = (
            f"Image is too large ({size_mb:.1f}MB). "
            f"Maximum size is 5MB. "
            f"Please compress the image and try again."
        )
        logger.warning(message)
        return False, message

    logger.debug(
        f"Image validation passed: "
        f"{file_size / 1024:.1f}KB, {image_type}"
    )

    return True, ""


def get_image_size_kb(image_data: str) -> float:
    """
    Get the size of a base64 encoded image in KB.
    
    Args:
        image_data: Base64 encoded image string
        
    Returns:
        float: Image size in kilobytes
        
    Example:
        size = get_image_size_kb(base64_string)
        print(f"Image size: {size:.1f}KB")
    """
    try:
        decoded = base64.b64decode(image_data)
        return len(decoded) / 1024
    except Exception:
        return 0.0