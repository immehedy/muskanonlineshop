import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { Check } from "lucide-react";

const CHECK_MARK = "✅";

function getNodeText(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (node.nodeType === "text") return node.value ?? "";
  if (Array.isArray(node.content)) return getNodeText(node.content);
  return "";
}

const options: Options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => {
      const text = getNodeText(node);

      if (!text.includes(CHECK_MARK)) return <p>{children}</p>;

      const items = text
        .split(CHECK_MARK)
        .map((item) => item.trim())
        .filter(Boolean);

      return (
        <ul className="my-4 list-none space-y-2.5 pl-0">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5 pl-0">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-green-600 bg-green-600">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />
              </span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      );
    },
  },
};

export default function RichTextDescription({ richText }: { richText: any }) {
  if (!richText) return null;
  return <>{documentToReactComponents(richText, options)}</>;
}
