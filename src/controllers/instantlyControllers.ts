import { Request, Response } from "express";
import human from "humanparser";

type InstantlyReq = {
  api_key: string;
  campaign_id: string;
  skip_if_in_workspace: boolean;
  leads: {
    email: string;
    first_name: string;
    last_name?: string;
    company_name?: string;
    personalization?: string;
    phone?: string;
    website?: string;
    custom_variables?: { [key: string]: any };
  }[];
};

type ApolloJSON = {
  Name: string;
  "Linkedin URL": string;
  Title: string;
  "Company Name": string;
  Email: string;
  Phone: string;
  Location: string;
};

type ReoonJSON = {
  can_connect_smtp: boolean;
  domain: string;
  email: string;
  has_inbox_full: boolean;
  is_catch_all: boolean;
  is_deliverable: boolean;
  is_disabled: boolean;
  is_disposable: boolean;
  is_role_account: boolean;
  is_safe_to_send: boolean;
  is_spamtrap: string;
  is_valid_syntax: boolean;
  mx_accepts_mail: boolean;
  mx_records: string[];
  status: string;
  username: string;
  overall_score: number;
};

export const addLeadsToCampaign = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const campaign_id: string = req.body.campaign_id;
    const reoonResults: ReoonJSON[] = req.body.emails;
    const leads: ApolloJSON[] = req.body.leads;

    let instantlyReq: InstantlyReq = {
      api_key: process.env.INSTANTLY_API_KEY as string,
      campaign_id: campaign_id,
      skip_if_in_workspace: false,
      leads: [],
    };

    leads.forEach((lead, idx) => {
      if (reoonResults[idx].overall_score > 60) {
        const nameAtrrs = human.parseName(lead.Name);

        instantlyReq.leads.push({
          first_name: nameAtrrs.firstName as string,
          last_name: nameAtrrs.lastName,
          email: reoonResults[idx]["email"],
          company_name: lead["Company Name"],
          phone: lead.Phone,
          custom_variables: {
            linkedin_url: lead["Linkedin URL"],
            title: lead.Title,
            locations: lead.Location,
          },
        });
      }
    });

    res.status(200).json({ msg: instantlyReq });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};
