import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { LoginForm } from "@/components/organisms/LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xxs text-center">
        <h1 className="text-heading-3 text-ink">Sign in to Zen</h1>
        <p className="text-body-sm text-stone">Developer multi-tool</p>
      </div>
      <LoginForm />
    </div>
  );
}
