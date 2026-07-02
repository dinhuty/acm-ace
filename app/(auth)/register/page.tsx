import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { RegisterForm } from "@/components/organisms/RegisterForm";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xxs text-center">
        <h1 className="text-heading-3 text-ink">Create your account</h1>
        <p className="text-body-sm text-stone">Internal tool — username & password</p>
      </div>
      <RegisterForm />
    </div>
  );
}
