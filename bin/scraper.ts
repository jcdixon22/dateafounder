import fs from "fs"
import { z } from "zod"
import { Person, searchPerson } from "@/lib/api"

const API_KEY = "14eb60a093856a5d09a14d9939fd0ab1f4d0fb0c" // process.env.CRUSTDATA_API_KEY;

if (!API_KEY) {
  throw new Error("CRUSTDATA_API_KEY environment variable is required")
}

const REGIONS = [
  "San Francisco Bay Area",
  "San Francisco, California, United States",
  "San Francisco County, California, United States",
]

const TITLES = ["Founder", "Co-Founder"]

//
//
//
//

export const FILEPATH = "bin/scraping-state.json"

const StateStruct = z.object({
  latestPage: z.number(),
  page1: z.optional(z.array(z.unknown())),
  page2: z.optional(z.array(z.unknown())),
  page3: z.optional(z.array(z.unknown())),
  page4: z.optional(z.array(z.unknown())),
  page5: z.optional(z.array(z.unknown())),
  page6: z.optional(z.array(z.unknown())),
  page7: z.optional(z.array(z.unknown())),
})

type State = z.infer<typeof StateStruct>

export async function getState(): Promise<State> {
  if (!fs.existsSync(FILEPATH)) {
    return { latestPage: 0 }
  }
  return JSON.parse(fs.readFileSync(FILEPATH, "utf8")) as State
}

export function exportState(state: State) {
  fs.writeFileSync(FILEPATH, JSON.stringify(state, null, 2))
}

//
//
//
//
//
//

async function downloadPage(
  page: number
): Promise<{ profiles: Person[]; isLastPage: boolean }> {
  console.log(`downloadPage ${page}`)
  try {
    console.log(`Fetching page ${page}`)
    const { data: profiles } = await searchPerson(
      API_KEY,
      REGIONS,
      TITLES,
      page + 1,
      25
    )

    if (profiles.length < 25) {
      return { profiles, isLastPage: true }
    }

    return { profiles, isLastPage: false }
  } catch (error) {
    console.error(`Error downloading page ${page}:`, error)
    return { profiles: [], isLastPage: true }
  }
}

async function continueDownload() {
  const scraperState = await getState()
  console.log("Loaded saved scraper state", scraperState)

  const latestPage = scraperState.latestPage
  for (let i = latestPage + 1; i < 20; i++) {
    console.log("Page", i)
    const { profiles, isLastPage } = await downloadPage(i)

    const latestState = await getState()
    exportState({
      ...latestState,
      latestPage: i,
      ["page" + i]: profiles,
    })

    if (isLastPage) {
      console.log("Last page of profiles")
      break
    }
  }

  console.log("Done.")
  // console.log("Downloaded", profiles.length, "profiles")

  // // Save to file
  // const outputPath = "founders_data.json"
  // fs.writeFileSync(outputPath, JSON.stringify(uniquePeople, null, 2))
  // console.log(`Results saved to ${outputPath}`)
}

// void continueDownload()
