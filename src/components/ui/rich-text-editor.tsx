"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { EMOJI_SET } from "@/lib/catalog";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxTextLength?: number;
  invalid?: boolean;
}

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title="Insert emoji"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-8 items-center justify-center rounded text-sm font-bold text-muted transition-colors hover:bg-border hover:text-text"
      >
        😊
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-20 grid grid-cols-6 gap-1 rounded-xl border border-border bg-bg p-2 shadow-xl">
          {EMOJI_SET.map(([e, label]) => (
            <button
              key={e}
              type="button"
              aria-label={label}
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
              className="flex size-8 items-center justify-center rounded hover:bg-surface text-lg transition-colors cursor-pointer"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-7 w-8 items-center justify-center rounded text-sm font-bold transition-colors ${
        active
          ? "bg-accent text-text"
          : "text-muted hover:bg-border hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxTextLength,
  invalid,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        italic: false,
        strike: false,
        heading: { levels: [2] },
      }),
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value || "",
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: { class: "rte-content outline-none min-h-44" },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && !editor.isFocused) {
      const current = editor.getHTML();
      const incoming = value || "";
      if (current !== incoming) {
        editor.commands.setContent(incoming, { emitUpdate: false });
      }
    }
  }, [editor, value]);

  const textLen = editor?.getText().length ?? 0;
  const overLimit = maxTextLength != null && textLen > maxTextLength;

  return (
    <div
      className={`rounded-xl border bg-surface transition-colors focus-within:border-accent ${
        invalid ? "border-red-500 focus-within:border-red-500" : "border-border"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border px-3 py-2">
        <ToolbarBtn
          title="Heading"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run() ?? undefined}
        >
          H
        </ToolbarBtn>
        <ToolbarBtn
          title="Normal text"
          active={editor?.isActive("paragraph") && !editor?.isActive("heading")}
          onClick={() => editor?.chain().focus().setParagraph().run() ?? undefined}
        >
          P
        </ToolbarBtn>
        <ToolbarBtn
          title="Bullet list"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run() ?? undefined}
        >
          L
        </ToolbarBtn>

        <div className="mx-1.5 h-4 w-px bg-border" />

        <ToolbarBtn
          title="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run() ?? undefined}
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          title="Underline"
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run() ?? undefined}
        >
          <span className="underline">U</span>
        </ToolbarBtn>

        <div className="mx-1.5 h-4 w-px bg-border" />

        <EmojiPicker
          onPick={(e) => editor?.chain().focus().insertContent(e).run()}
        />
      </div>

      {/* Content area */}
      <div className="px-4 py-3 text-sm text-text">
        <EditorContent editor={editor} />
      </div>

      {/* Character count */}
      {maxTextLength != null && (
        <div className="px-4 pb-2 text-right">
          <span className={`text-xs ${overLimit ? "text-red-700" : "text-muted"}`}>
            {textLen}/{maxTextLength}
          </span>
        </div>
      )}
    </div>
  );
}
