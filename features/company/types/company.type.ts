import z from "zod";
import {
  companySchema,
  companyFormSchema,
  updateCompanySchema,
  updateCompanyFormSchema,
} from "../validations/company.validation";
import { OnboardUserType } from "@/features/users/types/user.type";
import { companies } from "../schemas/company.schema";

export type CreateCompanyFormType = z.input<typeof companySchema>;
export type CompanyFormType = z.infer<typeof companyFormSchema>;
// react-hook-form's useForm generic must match zodResolver's expected input
// type, which differs from the output type above because of companySchema's
// preprocess/transform pipeline.
export type CompanyFormValues = z.input<typeof companyFormSchema>;

export type CreateCompanyType = z.infer<typeof companySchema>;
export type UpdateCompanyType = z.infer<typeof updateCompanySchema>;
export type UpdateCompanyFormType = z.infer<typeof updateCompanyFormSchema>;

export type OnboardCompanyType = {
    company: CreateCompanyFormType,
    users: OnboardUserType[]
}


export type OnboardCompanyServiceType = {
    company: CreateCompanyType,
    users: OnboardUserType[]
}

export type Company = typeof companies.$inferSelect