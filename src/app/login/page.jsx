import LoginForm from "./LoginForm";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Login",
    description: "Sign in to your Tijaar account.",
    path: "/login",
    noIndex: true,
  });
}

export default function LoginPage() {
  return <LoginForm />;
}
