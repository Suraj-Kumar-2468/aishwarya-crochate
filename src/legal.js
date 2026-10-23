// Business details shown on the legal pages. The owner MUST fill these in before launch:
// the DPDP Act, IT (SPDI) Rules 2011 and Consumer Protection (E-Commerce) Rules 2020 all
// require the legal name, address and a named grievance officer to be published.
// Any value left as an empty string renders as a visible "to be provided" marker.
export const LEGAL = {
  legalName: "",
  address: "",
  contactEmail: "",
  grievanceOfficerName: "",
  grievanceOfficerEmail: "",
  grievanceOfficerPhone: "",
  // Must match CONSENT_VERSION in server/routes/customers.js
  lastUpdated: "23 October 2026",
};
