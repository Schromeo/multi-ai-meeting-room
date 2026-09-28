import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MeetingMarkdown({ text }: { text: string }) {
  return (
    <div className="meeting-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{ img: () => null }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
