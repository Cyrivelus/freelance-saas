"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { spec } from "@/lib/swagger";

// On charge Swagger-UI dynamiquement car il ne supporte pas le rendu serveur (SSR)
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDoc() {
  return (
    <div className="bg-white min-h-screen">
      <SwaggerUI spec={spec} />
    </div>
  );
}
