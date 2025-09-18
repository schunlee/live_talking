import { toaster } from "./components/ui/toaster";

  const notify = (message: string, status: "success" | "error" | "info" | "warning" = "info") => {
    toaster.create({
          description: message,
          type: status,
          closable: true,
        });
  };

  export default notify