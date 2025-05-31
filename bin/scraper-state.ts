import fs from "fs"
import { z } from "zod"

const FILEPATH = "scraping-state.json"

const StateStruct = z.object({
  currentPage: z.number(),
})

type State = z.infer<typeof StateStruct>

export async function getState(): Promise<State> {
  if (!fs.existsSync(FILEPATH)) {
    return { currentPage: 0 }
  }
  return StateStruct.parse(JSON.parse(fs.readFileSync(FILEPATH, "utf8")))
}

export function exportState(state: State) {
  fs.writeFileSync(FILEPATH, JSON.stringify(state, null, 2))
}
