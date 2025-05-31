import fs from "fs"
import { db } from "../db"
import { Profiles } from "../db/schema"
import { z } from "zod"
import { FILEPATH } from "./scraper"

// Define the person schema from scraping data
const ScrapedPersonSchema = z.object({
  name: z.string(),
  location: z.string().nullish(),
  linkedin_profile_url: z.string().nullish(),
  linkedin_profile_urn: z.string().nullish(),
  default_position_title: z.string().nullish(),
  default_position_company_linkedin_id: z.string().nullish(),
  default_position_is_decision_maker: z.boolean().nullish(),
  flagship_profile_url: z.string().nullish(),
  profile_picture_url: z.string().nullish(),
  headline: z.string().nullish(),
  summary: z.string().nullish(),
  num_of_connections: z.number().nullish(),
  related_colleague_company_id: z.number().nullish(),
  skills: z.array(z.string()).nullish(),
  employer: z.array(z.record(z.unknown())).nullish(),
  education_background: z.array(z.record(z.unknown())).nullish(),
  emails: z.array(z.string()).nullish(),
  websites: z.array(z.string()).nullish(),
  twitter_handle: z.string().nullish(),
  languages: z.array(z.string()).nullish(),
  pronoun: z.string().nullish(),
  query_person_linkedin_urn: z.string().nullish(),
  linkedin_slug_or_urns: z.array(z.string()).nullish(),
  current_title: z.string().nullish(),
})

type ScrapedPerson = z.infer<typeof ScrapedPersonSchema>

function generateEmailFromName(name: string): string {
  // Generate a basic email from the name for the required email field
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, ".")
  return `${cleanName}@placeholder.com`
}

function transformScrapedPersonToDbPerson(person: ScrapedPerson) {
  // Generate an email since it's required but not always available in scraped data
  const email = person.emails?.[0] || generateEmailFromName(person.name)

  return {
    name: person.name,
    email: email,
    location: person.location || null,
    linkedinProfileUrl: person.linkedin_profile_url || null,
    linkedinProfileUrn: person.linkedin_profile_urn || null,
    defaultPositionTitle: person.default_position_title || null,
    defaultPositionCompanyLinkedinId:
      person.default_position_company_linkedin_id || null,
    defaultPositionIsDecisionMaker:
      person.default_position_is_decision_maker || null,
    flagshipProfileUrl: person.flagship_profile_url || null,
    profilePictureUrl: person.profile_picture_url || null,
    headline: person.headline || null,
    summary: person.summary || null,
    numOfConnections: person.num_of_connections || null,
    relatedColleagueCompanyId: person.related_colleague_company_id || null,
    skills: person.skills || null,
    employer: (person.employer as any) || null,
    educationBackground: (person.education_background as any) || null,
    emails: person.emails || null,
    websites: person.websites || null,
    twitterHandle: person.twitter_handle || null,
    languages: person.languages || null,
    pronoun: person.pronoun || null,
    queryPersonLinkedinUrn: person.query_person_linkedin_urn || null,
    linkedinSlugOrUrns: person.linkedin_slug_or_urns || null,
    currentTitle: person.current_title || null,
  }
}

async function importScrapingData() {
  console.log("Starting import of scraping data...")

  // Read the scraping state file
  let scrapingData: Record<string, unknown>
  try {
    const fileContent = fs.readFileSync(FILEPATH, "utf8")
    scrapingData = JSON.parse(fileContent) as Record<string, unknown>
  } catch (error) {
    console.error(`Error reading ${FILEPATH}:`, error)
    process.exit(1)
  }

  // Extract all persons from all pages
  const allPersons: ScrapedPerson[] = []

  Object.keys(scrapingData).forEach((key) => {
    if (key.startsWith("page") && Array.isArray(scrapingData[key])) {
      const pagePersons = scrapingData[key] as unknown[]
      console.log(`Found ${pagePersons.length} persons in ${key}`)

      pagePersons.forEach((person: unknown) => {
        try {
          const validatedPerson = ScrapedPersonSchema.parse(person)
          allPersons.push(validatedPerson)
        } catch (error) {
          console.warn(`Skipping invalid person data:`, error)
        }
      })
    }
  })

  console.log(`Total persons to import: ${allPersons.length}`)

  // Import persons in batches to avoid overwhelming the database
  const batchSize = 50
  let imported = 0
  let skipped = 0

  for (let i = 0; i < allPersons.length; i += batchSize) {
    const batch = allPersons.slice(i, i + batchSize)
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        allPersons.length / batchSize
      )}`
    )

    for (const person of batch) {
      try {
        const dbPerson = transformScrapedPersonToDbPerson(person)

        // Insert with conflict resolution - update if email already exists
        await db
          .insert(Profiles)
          .values(dbPerson)
          .onConflictDoUpdate({
            target: Profiles.email,
            set: {
              name: dbPerson.name,
              location: dbPerson.location,
              linkedinProfileUrl: dbPerson.linkedinProfileUrl,
              linkedinProfileUrn: dbPerson.linkedinProfileUrn,
              defaultPositionTitle: dbPerson.defaultPositionTitle,
              defaultPositionCompanyLinkedinId:
                dbPerson.defaultPositionCompanyLinkedinId,
              defaultPositionIsDecisionMaker:
                dbPerson.defaultPositionIsDecisionMaker,
              flagshipProfileUrl: dbPerson.flagshipProfileUrl,
              profilePictureUrl: dbPerson.profilePictureUrl,
              headline: dbPerson.headline,
              summary: dbPerson.summary,
              numOfConnections: dbPerson.numOfConnections,
              relatedColleagueCompanyId: dbPerson.relatedColleagueCompanyId,
              skills: dbPerson.skills,
              employer: dbPerson.employer as any,
              educationBackground: dbPerson.educationBackground as any,
              emails: dbPerson.emails,
              websites: dbPerson.websites,
              twitterHandle: dbPerson.twitterHandle,
              languages: dbPerson.languages,
              pronoun: dbPerson.pronoun,
              queryPersonLinkedinUrn: dbPerson.queryPersonLinkedinUrn,
              linkedinSlugOrUrns: dbPerson.linkedinSlugOrUrns,
              currentTitle: dbPerson.currentTitle,
              updatedAt: new Date(),
            },
          })

        imported++
      } catch (error) {
        console.warn(`Failed to import person ${person.name}:`, error)
        skipped++
      }
    }
  }

  console.log(`Import completed!`)
  console.log(`- Imported: ${imported} persons`)
  console.log(`- Skipped: ${skipped} persons`)
}

// Run the import
importScrapingData().catch(console.error)
