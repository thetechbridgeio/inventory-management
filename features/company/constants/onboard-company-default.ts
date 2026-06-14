import { ROLES } from "@/features/auth/constants/user-role";
import { OnboardCompanyType } from "../types/company.type";

export const onBoardCompanyDefaultValues: OnboardCompanyType = {
  company: {
    name: "",
    gst: "",
    address: "",
    description: "",
    logoUrl: "",
    website: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
  },

  users: [
    {
      name: "",
      email: "",
      phone: "",
      role: ROLES.SUPER_ADMIN,
      password: "",
      confirmPassword: "",
    },
  ],
};