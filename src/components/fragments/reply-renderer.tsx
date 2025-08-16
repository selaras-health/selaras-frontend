import type { ReplyComponent } from "@/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const ReplyRenderer = ({ components }: { components: ReplyComponent[] }) => (
  <div className="space-y-4 text-sm leading-relaxed">
    {components?.map((comp, idx) => {
      const renderMarkdown = (text: string) => (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      )

      switch (comp.type) {
        case "header":
          return (
            <h3 key={idx} className="text-xl font-bold text-slate-800">
              {comp.content}
            </h3>
          )
        case "string":
        case "paragraph":
          return <div key={idx}>{renderMarkdown(comp.content)}</div>
        case "quote":
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-slate-500 pl-4 italic text-slate-700 bg-gray-50 p-3 rounded"
            >
              {renderMarkdown(comp.content)}
            </blockquote>
          )
        case "list":
            return (
                <div key={idx} className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {comp.items.map((item) => `- ${item}`).join("\n")}
                    </ReactMarkdown>
                </div>
            )
        default:
          return null
      }
    })}
  </div>
)


// return (
//   <p className="  leading-relaxed mb-4">
//     <span className="text-xl text-slate-700 font-semibold">{greeting}</span>
//     <div className="text-base text-slate-500 mt-4">{summary}</div>
//   </p>
// );
// };

export default ReplyRenderer