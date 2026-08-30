import type { SrdData } from "../data.js";
import { z } from "zod";

export const licenseTool = {
  name: "license",
  description:
    "Returns the full CC BY 4.0 attribution block for this dataset, including WotC and Open5e credits.",
  inputSchema: z.object({}),
};

const FULL_ATTRIBUTION = `
Title:   D&D System Reference Document v5.2.1
Author:  Wizards of the Coast LLC
Source:  https://www.dndbeyond.com/sources/dnd/srd-5.2.1
License: https://creativecommons.org/licenses/by/4.0/

This dataset was built from the Open5e API (https://api.open5e.com/, document slug: wotc-srd),
which re-publishes the SRD under the same CC BY 4.0 license. Both sources are credited per
CC BY 4.0 TASL requirements.

Dataset maintained by Adam Kinney (https://adamkinney.com).
GitHub: https://github.com/adkinn/srd-5.2.1
`.trim();

export function handleLicense(data: SrdData) {
  return { _license: data.license, attribution: FULL_ATTRIBUTION };
}
