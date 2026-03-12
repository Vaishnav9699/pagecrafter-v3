import { Button } from "@chaibuilder/components/ui/button";
import { useLanguages } from "@chaibuilder/hooks/use-languages";
import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { useMutation } from "@tanstack/react-query";
import { Loader, Wand2Icon } from "lucide-react";

const getPageContent = () => {
  const iframe = document.getElementById("canvas-iframe") as HTMLIFrameElement;
  const content = iframe.contentDocument?.body.innerHTML;
  if (!content) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");

  // Remove all <style> and <script> tags
  doc
    .querySelectorAll("style, script, link, svg, [data-block-type='PartialBlock']")
    .forEach((element) => element.remove());
  // Remove all class attributes from all tags
  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attr) => element.removeAttribute(attr.name));
  });
  // Pick all heading and paragraph elements
  const headingsAndParagraphs = doc.querySelectorAll("h1, h2, h3, h4, h5, h6, p");
  const extractedContent = Array.from(headingsAndParagraphs)
    .map((element) => `<${element.tagName.toLowerCase()}>${element.innerHTML}</${element.tagName.toLowerCase()}>`)
    .join(" ");

  return extractedContent.replace(/<p>Partial block. Double click to edit.<\/p>/, "");
};

export const AISEOButton = ({
  keyword,
  onComplete,
  field,
}: {
  keyword?: string | undefined;
  onComplete: ({ fieldValue, error }: { fieldValue: string | null; error?: string }) => void;
  field:
    | "title"
    | "description"
    | "ogTitle"
    | "ogDescription"
    | "searchTitle"
    | "searchDescription"
    | "jsonLD"
    | "metaOther";
}) => {
  const fetch = useFetch();
  const apiUrl = useApiUrl();
  const { selectedLang, fallbackLang } = useLanguages();
  const { mutate: generateContent, isPending } = useMutation({
    mutationFn: async () => {
      const pageContent = getPageContent();
      const response = await fetch(apiUrl, {
        action: ACTIONS.GENERATE_SEO_FIELD,
        data: {
          pageContext: "",
          dynamic: false,
          field,
          lang: !selectedLang ? fallbackLang : selectedLang,
          pageContent,
          keyword,
        },
      });
      return response as { field: string };
    },
    onSuccess: (data) => {
      onComplete({ fieldValue: data.field });
    },
    onError: (error) => {
      onComplete({ fieldValue: null, error: error.message });
    },
  });

  return (
    <Button
      disabled={isPending}
      type="button"
      className="h-5 w-5"
      variant="ghost"
      size="sm"
      onClick={() => generateContent()}>
      {isPending ? (
        <Loader className="h-3 w-3 animate-spin text-yellow-500" />
      ) : (
        <Wand2Icon className="text-yellow-500" />
      )}
    </Button>
  );
};
