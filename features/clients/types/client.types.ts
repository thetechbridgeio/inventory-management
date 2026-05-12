export interface Client {
  // Platform Identity
  id: string

  // Spreadsheet Mapping
  sheetId: string

  // Company Information
  companyName: string
  gstNumber: string
  address: string
  description?: string

  // Branding
  logoUrl?: string
  website?: string

  // Primary Contact
  contactPersonName: string
  contactPersonEmail: string
  contactPersonPhone: string

  // Super Admin
  superAdminName: string
  superAdminEmail: string
  superAdminPhoneNumber: string

  // Authentication
  username: string
  password: string

  // Status
  isActive: boolean

  // Metadata
  createdAt: string
}
