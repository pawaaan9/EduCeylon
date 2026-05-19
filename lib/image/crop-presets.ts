export type ImageCropPresetKey =
  | "profile"
  | "cover"
  | "courseThumbnail"
  | "courseBanner";

export type ImageCropPreset = {
  key: ImageCropPresetKey;
  /** width / height for the crop frame */
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  titleKey: string;
  hintKey: string;
};

export const IMAGE_CROP_PRESETS: Record<ImageCropPresetKey, ImageCropPreset> = {
  profile: {
    key: "profile",
    aspect: 1,
    outputWidth: 400,
    outputHeight: 400,
    titleKey: "onboard.crop.profile",
    hintKey: "onboard.crop.profile.hint",
  },
  cover: {
    key: "cover",
    aspect: 3,
    outputWidth: 1200,
    outputHeight: 400,
    titleKey: "onboard.crop.cover",
    hintKey: "onboard.crop.cover.hint",
  },
  courseThumbnail: {
    key: "courseThumbnail",
    aspect: 16 / 9,
    outputWidth: 1280,
    outputHeight: 720,
    titleKey: "lecturer.create.crop.thumbnail",
    hintKey: "lecturer.create.crop.thumbnail.hint",
  },
  courseBanner: {
    key: "courseBanner",
    aspect: 21 / 9,
    outputWidth: 1260,
    outputHeight: 540,
    titleKey: "lecturer.create.crop.banner",
    hintKey: "lecturer.create.crop.banner.hint",
  },
};
