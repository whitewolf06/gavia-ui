import { gaviaRelease } from "../type-study/font";

export const legatoFontDownloadName = "Legato-Sans-" + gaviaRelease + ".zip";
/** BASE_URL keeps the same download working locally and under /legato-ui/. */
export const legatoFontDownloadUrl = import.meta.env.BASE_URL + "downloads/" + legatoFontDownloadName;
