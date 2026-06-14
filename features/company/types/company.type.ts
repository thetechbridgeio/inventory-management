import z from "zod";
import { companySchema } from "../validations/company.validation";
import { OnboardUserType } from "@/features/users/types/user.type";
import { companies } from "../schemas/company.schema";

export type CreateCompanyFormType = z.input<typeof companySchema>;
export type updateCompanyFormType = z.infer<typeof companySchema>;

export type CreateCompanyType = z.infer<typeof companySchema>;
export type UpdateCompanyType = z.infer<typeof companySchema>;

export type OnboardCompanyType = {
    company: CreateCompanyFormType,
    users: OnboardUserType[]
}


export type OnboardCompanyServiceType = {
    company: CreateCompanyType,
    users: OnboardUserType[]
}

export type Company = typeof companies.$inferSelect