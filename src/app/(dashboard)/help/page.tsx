import { redirect } from "next/navigation";

export default function HelpRedirectPage() {
  redirect("/settings?tab=help");
}
