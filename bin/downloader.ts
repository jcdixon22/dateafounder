import { Person, searchPerson } from "@/lib/api"
import { exportState, getState } from "./scraper-state"

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

//
//
//
//
//
//

async function downloadNPages(numPages: number): Promise<Person[]> {
  console.log(`downloadNPages`)
  const allPeople: Person[] = []

  let currentPage = 0
  for (let i = 0; i < numPages; i++) {
    try {
      console.log(`Fetching page ${currentPage + 1}/${numPages}`)
      const { data: profiles } = await searchPerson(
        API_KEY,
        REGIONS,
        TITLES,
        currentPage + 1,
        25
      )

      allPeople.push(...profiles)
      currentPage++

      console.log(
        `Downloaded ${profiles.length} people (total: ${allPeople.length})`
      )

      if (profiles.length < 25) {
        console.log(`Last page of profiles`)
        break
      }

      // Rate limiting: wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error downloading page ${currentPage + 1}:`, error)
      break
    }
  }

  return allPeople
}

async function downloadForAllRegions() {
  await exportState({ currentPage: 0 })
  const scraperState = await getState()
  console.log("scraperState", scraperState)
  const data = await downloadNPages(1)

  console.log("data", data)

  // // Save to file
  // const outputPath = "founders_data.json"
  // fs.writeFileSync(outputPath, JSON.stringify(uniquePeople, null, 2))
  // console.log(`Results saved to ${outputPath}`)
}

void downloadForAllRegions()
