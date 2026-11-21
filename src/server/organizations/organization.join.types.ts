export type JoinOrganizationInput = {
  organizationId: string;
};

export type JoinedOrganization = {
  organizationId: string;
  role: "MEMBER";
  status: "PENDING";
};