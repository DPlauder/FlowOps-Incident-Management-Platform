export type OrganizationMembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER";

export type OrganizationMembershipStatus =
  | "PENDING"
  | "ACTIVE"
  | "DISABLED";

export type OrganizationAdminContext = {
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN";
};

export type MembershipAuthorizationRecord = {
  organization_id: string;
  role: OrganizationMembershipRole;
  status: OrganizationMembershipStatus;
};

export type PendingOrganizationMembership = {
  membershipId: string;
  organizationId: string;
  userId: string;
  email: string;
  displayName: string;
  role: OrganizationMembershipRole;
  status: "PENDING";
  createdAt: string;
};

export type ApprovedOrganizationMembership = {
  membershipId: string;
  organizationId: string;
  userId: string;
  role: "MEMBER";
  status: "ACTIVE";
};

export type ApproveOrganizationMembershipInput = {
  membershipId: string;
};