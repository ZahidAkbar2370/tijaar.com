import RegisterForm from "./RegisterForm";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Register",
    description: "Create your Tijaar customer account to buy and sell.",
    path: "/register",
    noIndex: true,
  });
}

export default function RegisterPage() {
  return <RegisterForm />;
}
