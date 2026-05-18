export type ImageCropPresetKey = "profile" | "cover";

export type ImageCropPreset = {
  key: ImageCropPresetKey;
  /** width / height for the crop frame */
  aspect: number;
  outputWidth: number;
  outputHeight: number;
};

export const IMAGE_CROP_PRESETS: Record<ImageCropPresetKey, ImageCropPreset> = {
  profile: {
    key: "profile",
    aspect: 1,
    outputWidth: 400,
    outputHeight: 400,
  },
  cover: {
    key: "cover",
    aspect: 3,
    outputWidth: 1200,
    outputHeight: 400,
  },
};
