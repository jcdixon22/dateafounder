import assert from "assert"
import { z } from "zod"

const API_HOST = "https://api.crustdata.com"

//
//
//

const EmployerStruct = z.object({
  title: z.string(),
  company_name: z.string(),
  company_linkedin_id: z.string().nullable(),
  company_logo_url: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  position_id: z.number(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  rich_media: z.array(z.unknown()),
})

const EducationStruct = z.object({
  degree_name: z.string().nullable(),
  institute_name: z.string(),
  field_of_study: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  institute_linkedin_id: z.string().nullable(),
  institute_linkedin_url: z.string().nullable(),
  institute_logo_url: z.string().nullable(),
})

const ProfileStruct = z.object({
  name: z.string(),
  location: z.string(),
  linkedin_profile_url: z.string(),
  linkedin_profile_urn: z.string(),
  default_position_title: z.string(),
  default_position_company_linkedin_id: z.string().nullable(),
  default_position_is_decision_maker: z.boolean(),
  flagship_profile_url: z.string(),
  profile_picture_url: z.string().nullable(),
  headline: z.string(),
  summary: z.string().nullable(),
  num_of_connections: z.number(),
  related_colleague_company_id: z.number().nullable(),
  skills: z.array(z.string()),
  employer: z.array(EmployerStruct),
  education_background: z.array(EducationStruct),
  emails: z.array(z.string()),
  websites: z.array(z.string()),
  twitter_handle: z.string().nullable(),
  languages: z.array(z.string()),
  pronoun: z.string().nullable(),
  query_person_linkedin_urn: z.string(),
  linkedin_slug_or_urns: z.array(z.string()),
  current_title: z.string(),
})

export type Person = z.infer<typeof ProfileStruct>

const PaginatedResponse = z.object({
  profiles: z.array(ProfileStruct),
  total_display_count: z.string(),
})

type APIResponseType = z.infer<typeof PaginatedResponse>

//
//
//

async function makeAPIRequest(
  apiKey: string,
  path: string,
  body?: object
): Promise<APIResponseType> {
  let res
  try {
    res = await fetch(API_HOST + path, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    console.error("API request error:", error)
    throw error
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `API request failed: ${res.status} ${res.statusText} ${text}`
    )
  }

  const data = await res.json()
  const parsed = PaginatedResponse.safeParse(data)
  if (!parsed.success) {
    console.log(data)
    throw new Error(`API request failed: ${parsed.error}`)
  }
  return parsed.data
}

export async function searchPerson(
  apiKey: string,
  regions: string[],
  titles: string[],
  page: number,
  pageSize: number
): Promise<{ data: Person[]; error: string | null }> {
  assert(page > 0, "Page must be greater than 0")

  const res = await makeAPIRequest(apiKey, "/screener/person/search", {
    filters: [
      {
        filter_type: "CURRENT_TITLE",
        type: "in",
        value: titles,
      },
      {
        filter_type: "REGION",
        type: "in",
        value: regions,
      },
    ],
    page: page,
    limit: pageSize,
  })

  const data: Person[] = []
  for (const result of res.profiles) {
    data.push(ProfileStruct.parse(result))
  }

  return {
    data,
    error: null,
  }
}
