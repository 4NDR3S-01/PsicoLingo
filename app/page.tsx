"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers";
import { Splash } from "@/components/ui";

export default function Root() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) router.replace(user ? "/inicio" : "/login");
  }, [user, loading, router]);
  return <Splash />;
}
