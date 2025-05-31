import { InferSelectModel } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"

export const Profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // LinkedIn profile data
  location: text("location"),
  linkedinProfileUrl: text("linkedin_profile_url"),
  linkedinProfileUrn: text("linkedin_profile_urn"),
  defaultPositionTitle: text("default_position_title"),
  defaultPositionCompanyLinkedinId: text(
    "default_position_company_linkedin_id"
  ),
  defaultPositionIsDecisionMaker: boolean("default_position_is_decision_maker"),
  flagshipProfileUrl: text("flagship_profile_url"),
  profilePictureUrl: text("profile_picture_url"),
  headline: text("headline"),
  summary: text("summary"),
  numOfConnections: integer("num_of_connections"),
  relatedColleagueCompanyId: integer("related_colleague_company_id"),
  skills: jsonb("skills").$type<string[]>(),
  employer: jsonb("employer").$type<
    {
      title: string
      company_name: string
      company_linkedin_id: string | null
      company_logo_url: string | null
      start_date: string
      end_date: string | null
      position_id: number
      description: string
      location: string | null
      rich_media: any[]
    }[]
  >(),
  educationBackground: jsonb("education_background").$type<
    {
      degree_name: string
      institute_name: string
      field_of_study: string
      start_date: string
      end_date: string
      institute_linkedin_id: string | null
      institute_linkedin_url: string | null
      institute_logo_url: string | null
    }[]
  >(),
  emails: jsonb("emails").$type<string[]>(),
  websites: jsonb("websites").$type<string[]>(),
  twitterHandle: text("twitter_handle"),
  languages: jsonb("languages").$type<string[]>(),
  pronoun: text("pronoun"),
  queryPersonLinkedinUrn: text("query_person_linkedin_urn"),
  linkedinSlugOrUrns: jsonb("linkedin_slug_or_urns").$type<string[]>(),
  currentTitle: text("current_title"),
})

export type Profile = InferSelectModel<typeof Profiles>
