"use client"
import "@remirror/styles/all.css";
import { css } from "@emotion/css";
import { createContextState } from "create-context-state";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import jsx from "refractor/lang/jsx.js";
import md from "refractor/lang/markdown.js";
import typescript from "refractor/lang/typescript.js";
import { ExtensionPriority, RemirrorContentType, RemirrorJSON } from "remirror";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  DocExtension, 
  HardBreakExtension,
  HeadingExtension, 
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
  UnderlineExtension
} from "remirror/extensions";
import {
  EditorComponent,
  ReactExtensions,
  Remirror,
  ThemeProvider,
  useRemirror,
  UseRemirrorReturn
} from "@remirror/react";  
import { Json } from "@/utils/supabase/supabase";   
import html2pdf from "html2pdf.js"; 
import { VisualToolbar } from "../MarkdownToolbar"; 

/* Text Editor component built using Remirror. Provides synced Markdown & Visual (WYSIWYG) editing fields */ 

interface DualProps {
  visual: UseRemirrorReturn<ReactExtensions<ReturnType<typeof extensions>[number]>>;
  markdown: UseRemirrorReturn<ReactExtensions<DocExtension | CodeBlockExtension>>; 
};

interface DualContext extends DualProps {
  setMarkdown: (markdown: string) => void;
  setVisual: (markdown: string) => void; 
};

const [DualEditorProvider, useDualEditor] = createContextState<DualContext, DualProps>(({ props }) => (
  {
    ...props, 
    setMarkdown: (text: string) => {
      props.markdown.getContext()?.setContent({
        type: "doc",
        content: [
          {
            type: "codeBlock",
            attrs: { language: "markdown" },
            content: text ? [{ type: "text", text }] : undefined
          }
        ]
      })
    },
    setVisual: (markdown: string) => props.visual.getContext()?.setContent(markdown)
  }
));   

const MarkdownEditor = ({ isFirstRender }: { isFirstRender: React.MutableRefObject<boolean> }) => { 
  const { markdown, setVisual } = useDualEditor();

  return (
    <Remirror
      manager={markdown.manager} 
      autoRender="end" 
      onChange={({ helpers, state }) => {  
        if (!isFirstRender.current) { 
          return setVisual(helpers.getText({ state }));
        } else {
          isFirstRender.current = false;
        }
      }}
      classNames={[
        css`
          &.ProseMirror {     
            background-color: var(--modal-background) !important; 
            pre { 
              background-color: var(--modal-background) !important;
              font-size: 0.95rem !important;  
            }   
            code {   
              font-family: var(--font-jetbrains-mono), sans-serif;    
              color: var(--foreground) !important; 
            }                 
            padding: 0.75rem 1rem !important;
          }
        ` 
      ]}
    >      
    </Remirror>
  );
};  

type VisualEditorProps = { 
  initialContent: RemirrorContentType;
  onDownload: () => void; 
};

const VisualEditor = ({ initialContent, onDownload }: VisualEditorProps) => {
  const { visual, setMarkdown } = useDualEditor();   

  return (
    <Remirror 
      manager={visual.manager}  
      initialContent={initialContent}  
      onChange={({ helpers, state }) => setMarkdown(helpers.getMarkdown(state)) } 
      classNames={[
        css`
          &.ProseMirror {        
            font-size: 0.95rem !important;   
            padding: 2rem 2rem 0.75rem 2rem !important;
            background-color: var(--modal-background) !important; 
            h1, h2, h3, h4, h5, h6 {
              color: var(--foreground) !important;   
              padding: 0.5rem 0;
            } 
            pre { 
              background: var(--light-modal-background) !important; 
              margin: 1rem 0 !important; 
            }
            code {   
              font-family: var(--font-jetbrains-mono), sans-serif;    
              color: var(--foreground) !important; 
            }      
            ol, ul, li { margin: 0.5rem 0 }  
            blockquote { margin: 1.5rem 0 }  
          }
        `
      ]} 
    >
      <div className="sticky z-100 top-0 left-0 ml-2 w-fit p-1">
        <VisualToolbar onDownload={onDownload} />     
      </div>
      <div id="editor-print-area" className="-mt-8">
        <EditorComponent />   
      </div>
    </Remirror>
  );
};

// cleans visual editor content before exporting (fixes alignment/spacing issues)
const prepareForPDF = (editor: HTMLElement) => {
  const clone = editor.cloneNode(true) as HTMLElement;

  // replace <ol> with manual numbering
  clone.querySelectorAll("ol").forEach(ol => {
    const items = Array.from(ol.querySelectorAll("li"));
    const newList = document.createElement("div");
    items.forEach((li, index) => {
      const newItem = document.createElement("div");
      newItem.style.display = "flex";
      newItem.style.gap = "0.5rem";
      const number = document.createElement("span");
      number.textContent = `${index + 1}.`;
      const content = document.createElement("span");
      content.innerHTML = li.innerHTML;
      newItem.appendChild(number);
      newItem.appendChild(content); 
      newList.appendChild(newItem);
    });
    ol.replaceWith(newList);
  });

  // restyle <label> with manual bullet points
  clone.querySelectorAll("ul").forEach(ul => {     
    const labels = Array.from(ul.querySelectorAll("label"));  
    labels.forEach(label => {  
      const oldBullet = label.querySelector("div");
      if (oldBullet) {
        const newBullet = document.createElement("div");   
        newBullet.className = "bullet-point";
        oldBullet.replaceWith(newBullet);
      }
    })
  });
  return clone;
};    

// format/saves visual editor content as pdf
const exportEditorToPDF = (onError: () => void) => {    
  try { 
    const editor = document.getElementById("editor-print-area"); 
    if (!editor) throw new Error();
    const content = prepareForPDF(editor);
    html2pdf().from(content).set({
      margin: 0.5,
      filename: "file.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    }).save();
  } catch { 
    onError(); 
  }
}; 

const extensions = () => [
  new LinkExtension({ autoLink: true }),
  new BoldExtension({}), 
  new StrikeExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
  new HeadingExtension({}),
  new BlockquoteExtension(),
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: true }),
  new CodeExtension(),
  new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
  new TrailingNodeExtension({}),
  new TableExtension({}),
  new MarkdownExtension({ copyAsMarkdown: false }),
  new HardBreakExtension()
];  

const DEFAULT_CONTENT = `
# noted 💻🪴🌃
> "lofi notes and chill" -Socrates
### Tips
*   **Bold** your key points
*   _Italicize_ for subtle emphasis   
*   ~Strikethrough~ to mark items as complete/irrelevant
*   Create lists to organize ideas:
    1.  apples
    2.  oranges
    3.  bananas

  \`\`\`ts
  const theme = "🌙 Dracula mode engaged";
  \`\`\`
`; 

export type DualEditorProps = { 
  content?: Json | RemirrorJSON[] | undefined 
  onError: () => void;
};
 
export type EditorHandle = { getContent: () => Json | RemirrorJSON[] | undefined };

export const DualEditorImpl = forwardRef<EditorHandle, DualEditorProps>(
  function DualEditorImpl(props, ref) { 
    const isFirstRender = useRef(true);
    const editorRef  = useRef<HTMLDivElement>(null); 
    const initialContent = props.content ? ({ type: "doc", content: props.content } as unknown as RemirrorJSON) : DEFAULT_CONTENT;   

    const visual = useRemirror({ extensions, stringHandler: "markdown" });  
    const markdown = useRemirror({
      extensions: () => [
        new DocExtension({ content: "codeBlock" }),
        new CodeBlockExtension({
          supportedLanguages: [md, typescript],
          defaultLanguage: "markdown",
          syntaxTheme: "base16_ateliersulphurpool_light",
          defaultWrap: true
        })
      ],
      builtin: { exitMarksOnArrowPress: false },
      stringHandler: "html"
    });   

    // fowarded ref from parent used to access editor content
    useImperativeHandle(ref, () => ({
      getContent: () => { 
        const visualContext = visual.getContext();
        if (visualContext) {  
          const visualState = visualContext.helpers.getJSON(visualContext.getState());   
          return visualState.content; 
        }  
      }
    }));

    return (
      <DualEditorProvider visual={visual} markdown={markdown}>
        <ThemeProvider
          theme={{ fontFamily: { default: "var(--font-jetbrains-mono), sans-serif", mono: "monospace" }}}   
        >       
          <div ref={editorRef} className="w-full h-full grid grid-rows-2 md:grid-cols-2 gap-4 md:gap-4 pl-4 pr-0 md:pr-4 overflow-y-auto custom-scrollbar">  
            <div className="md:h-fit pl-0.5 pr-4 md:p-2 !pb-5 md:pt-4 overflow-y-auto custom-scrollbar ">
              <MarkdownEditor isFirstRender={isFirstRender} />    
            </div>      
            <div className="md:h-fit pl-0.5 pr-4 md:p-2 !pb-5 overflow-y-auto custom-scrollbar md:overflow-visible">
              <VisualEditor 
                initialContent={initialContent} 
                onDownload={() => exportEditorToPDF(props.onError)} 
              />
            </div>    
          </div>    
        </ThemeProvider>  
      </DualEditorProvider>
    );
  }
);   