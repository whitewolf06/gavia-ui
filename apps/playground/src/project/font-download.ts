import { gaviaRelease } from "../type-study/font";

export const gaviaFontDownloadName = "Gavia-Sans-" + gaviaRelease + ".zip";
/** BASE_URL keeps the same download working locally and under /gavia-ui/. */
export const gaviaFontDownloadUrl = import.meta.env.BASE_URL + "downloads/" + gaviaFontDownloadName;
