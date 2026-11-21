export type CreateOrganizationInput = {
  name: string;
  slug: string;
};

export type CreatedOrganization = {
  id: string;
  name: string;
  slug: string;
};