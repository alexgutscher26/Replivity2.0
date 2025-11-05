import { AuthCard } from "@daveyplate/better-auth-ui";
import { useParams } from "react-router";

export default function Auth() {
  const { pathname } = useParams();

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center">
      <AuthCard pathname={pathname} />
    </div>
  );
}
