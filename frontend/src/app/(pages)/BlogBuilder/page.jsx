"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Settings,
  Plus,
  X,
  Image as ImageIcon,
  Type,
  Video,
  List,
  Minus,
  Quote,
  Highlighter,
  Share2,
  AlignLeft,
  ListOrdered,
  Calendar,
  User,
  Clock,
  Layers,
  AlignCenter,
  AlignRight,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Color Pickers Component
const colors = [
  {
    name: "White",
    value: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
  },
  {
    name: "Gray",
    value: "bg-gray-50",
    text: "text-gray-900",
    border: "border-gray-200",
  },
  {
    name: "Blue",
    value: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
  },
  {
    name: "Green",
    value: "bg-green-50",
    text: "text-green-900",
    border: "border-green-200",
  },
  {
    name: "Yellow",
    value: "bg-yellow-50",
    text: "text-yellow-900",
    border: "border-yellow-200",
  },
  {
    name: "Red",
    value: "bg-red-50",
    text: "text-red-900",
    border: "border-red-200",
  },
  {
    name: "Purple",
    value: "bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-200",
  },
  {
    name: "Pink",
    value: "bg-pink-50",
    text: "text-pink-900",
    border: "border-pink-200",
  },
  {
    name: "Dark",
    value: "bg-gray-900",
    text: "text-white",
    border: "border-gray-700",
  },
];

const textColors = [
  { name: "Default", value: "text-gray-900" },
  { name: "Muted", value: "text-gray-500" },
  { name: "Blue", value: "text-blue-600" },
  { name: "Green", value: "text-green-600" },
  { name: "Red", value: "text-red-600" },
  { name: "Purple", value: "text-purple-600" },
  { name: "White", value: "text-white" },
];

const BackgroundColorPicker = ({ value, onChange, label }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase">
      {label || "Background"}
    </label>
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => onChange(color.value)}
          className={`w-6 h-6 rounded-full border ${color.border} ${color.value} ${value === color.value ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
          title={color.name}
        />
      ))}
    </div>
  </div>
);

const TextColorPicker = ({ value, onChange, label }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase">
      {label || "Text Color"}
    </label>
    <div className="flex flex-wrap gap-2">
      {textColors.map((color) => (
        <button
          key={color.name}
          onClick={() => onChange(color.value)}
          className={`w-6 h-6 rounded-full border border-gray-200 ${color.value === "text-white" ? "bg-gray-900" : "bg-white"} flex items-center justify-center ${value === color.value ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
          title={color.name}
        >
          <div
            className={`w-3 h-3 rounded-full ${color.value === "text-white" ? "bg-white" : color.value.replace("text-", "bg-")}`}
          />
        </button>
      ))}
    </div>
  </div>
);

const AccentColorPicker = ({ value, onChange, label }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase">
      {label || "Accent Color"}
    </label>
    <div className="flex flex-wrap gap-2">
      {[
        "border-blue-500",
        "border-green-500",
        "border-red-500",
        "border-purple-500",
        "border-yellow-500",
        "border-pink-500",
        "border-gray-500",
        "border-black",
      ].map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-6 h-6 rounded-full border-2 bg-white ${color.replace("border-", "border-")} ${value === color ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
          title={color.replace("border-", "")}
        >
          <div
            className={`w-full h-full rounded-full ${color.replace("border-", "bg-")}`}
          />
        </button>
      ))}
    </div>
  </div>
);

// Style Controls Component
const StyleControls = ({ styles, onChange, type }) => {
  if (!styles) return null;

  const handleChange = (key, value) => {
    onChange({ ...styles, [key]: value });
  };

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <BackgroundColorPicker
        value={styles.backgroundColor}
        onChange={(val) => handleChange("backgroundColor", val)}
      />

      {type !== "image" && type !== "video" && type !== "divider" && (
        <TextColorPicker
          value={styles.textColor}
          onChange={(val) => handleChange("textColor", val)}
        />
      )}

      {(type === "heading" ||
        type === "subheading" ||
        type === "highlight" ||
        type === "step" ||
        type === "quote") && (
        <AccentColorPicker
          value={styles.accentColor}
          onChange={(val) => handleChange("accentColor", val)}
        />
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Padding
        </label>
        <div className="flex bg-white rounded-md border border-gray-200 p-1">
          {["p-2", "p-4", "p-8", "p-12"].map((p) => (
            <button
              key={p}
              onClick={() => handleChange("padding", p)}
              className={`flex-1 py-1 rounded text-xs font-medium ${styles.padding === p ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              {p.replace("p-", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Rounded
        </label>
        <div className="flex bg-white rounded-md border border-gray-200 p-1">
          {["rounded-none", "rounded-md", "rounded-xl", "rounded-3xl"].map(
            (r) => (
              <button
                key={r}
                onClick={() => handleChange("rounded", r)}
                className={`flex-1 py-1 rounded text-xs font-medium ${styles.rounded === r ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {r.replace("rounded-", "") || "0"}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="md:col-span-2 flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={styles.shadow === "shadow-md"}
            onChange={(e) =>
              handleChange(
                "shadow",
                e.target.checked ? "shadow-md" : "shadow-none",
              )
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Drop Shadow</span>
        </label>

        {(type === "heading" || type === "subheading") && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={styles.underline}
              onChange={(e) => handleChange("underline", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Underline</span>
          </label>
        )}
      </div>

      {(type === "heading" ||
        type === "subheading" ||
        type === "paragraph") && (
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Text Align
          </label>
          <div className="flex gap-2">
            {["text-left", "text-center", "text-right"].map((align) => (
              <button
                key={align}
                onClick={() => handleChange("textAlign", align)}
                className={`p-2 rounded border ${styles.textAlign === align ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500"}`}
              >
                {align === "text-left" && <AlignLeft size={16} />}
                {align === "text-center" && <AlignCenter size={16} />}
                {align === "text-right" && <AlignRight size={16} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Table of Contents Component
const TableOfContents = ({ blocks }) => {
  const [activeId, setActiveId] = useState("");

  const headings = blocks.filter(
    (block) =>
      block.type === "heading" ||
      block.type === "subheading" ||
      block.type === "h3",
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -35% 0px" },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
        Table of Contents
      </h3>
      <div className="space-y-1 border-l-2 border-gray-100">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToSection(heading.id)}
            className={`block text-left w-full pl-4 py-1 text-sm transition-all border-l-2 -ml-[2px] ${
              activeId === heading.id
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            } ${heading.type === "subheading" ? "ml-4" : ""} ${heading.type === "h3" ? "ml-8" : ""}`}
          >
            {heading.content || "Untitled Section"}
          </button>
        ))}
      </div>
    </nav>
  );
};

// Header Editor Component
const HeaderEditor = ({ header, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...header, [field]: value });
  };

  return (
    <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        Hero Section
      </h3>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500">Title</label>
        <input
          type="text"
          value={header.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg text-sm"
          placeholder="Blog title..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500">Subtitle</label>
        <textarea
          value={header.subtitle}
          onChange={(e) => handleChange("subtitle", e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg text-sm min-h-[60px]"
          placeholder="Blog subtitle..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500">Tag</label>
          <input
            type="text"
            value={header.tag}
            onChange={(e) => handleChange("tag", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Category..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500">Author</label>
          <input
            type="text"
            value={header.author}
            onChange={(e) => handleChange("author", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Author name..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500">Date</label>
          <input
            type="text"
            value={header.publishDate}
            onChange={(e) => handleChange("publishDate", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            placeholder="2026"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500">
            Read Time
          </label>
          <input
            type="text"
            value={header.readTime}
            onChange={(e) => handleChange("readTime", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            placeholder="5 min read"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500">
          Background Image URL
        </label>
        <input
          type="text"
          value={header.bgImage}
          onChange={(e) => handleChange("bgImage", e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg text-sm"
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500">
          Overlay Opacity: {header.overlayOpacity}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={header.overlayOpacity}
          onChange={(e) =>
            handleChange("overlayOpacity", parseFloat(e.target.value))
          }
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500">
            Text Align
          </label>
          <select
            value={header.align}
            onChange={(e) => handleChange("align", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="text-left">Left</option>
            <option value="text-center">Center</option>
            <option value="text-right">Right</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500">
            Text Color
          </label>
          <select
            value={header.textColor}
            onChange={(e) => handleChange("textColor", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="text-white">White</option>
            <option value="text-gray-900">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Block Editor Component
const BlockEditor = ({
  block,
  index,
  updateBlock,
  removeBlock,
  moveBlock,
  isFirst,
  isLast,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleChange = (value) => {
    updateBlock(block.id, value);
  };

  const handleStyleChange = (newStyles) => {
    updateBlock(block.id, undefined, newStyles);
  };

  const renderInput = () => {
    switch (block.type) {
      case "paragraph":
        return (
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
            placeholder="Start writing your paragraph..."
            value={block.content}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "subheading":
        return (
          <input
            type="text"
            className="w-full p-3 text-xl font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Subheading (H2)..."
            value={block.content}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "h3":
        return (
          <input
            type="text"
            className="w-full p-2.5 text-lg font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Small Subheading (H3)..."
            value={block.content}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "step":
        const stepContent =
          typeof block.content === "object"
            ? block.content
            : { title: "", description: "" };
        return (
          <div className="space-y-2">
            <input
              type="text"
              className="w-full p-2.5 font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Step Title (e.g., Gather Ingredients)..."
              value={stepContent.title}
              onChange={(e) =>
                handleChange({ ...stepContent, title: e.target.value })
              }
            />
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
              placeholder="Step description..."
              value={stepContent.description}
              onChange={(e) =>
                handleChange({ ...stepContent, description: e.target.value })
              }
            />
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            <input
              type="text"
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste image URL..."
              value={block.content}
              onChange={(e) => handleChange(e.target.value)}
            />
            {block.content && (
              <img
                src={block.content}
                alt="Preview"
                className="max-h-40 rounded-lg object-cover"
              />
            )}
            <div className="text-xs text-gray-500">
              Supported formats: JPG, PNG, WEBP
            </div>
          </div>
        );
      case "video":
        return (
          <div className="space-y-2">
            <input
              type="text"
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste YouTube or video URL..."
              value={block.content}
              onChange={(e) => handleChange(e.target.value)}
            />
            {block.content && (
              <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                Video Preview
              </div>
            )}
          </div>
        );
      case "highlight":
        return (
          <textarea
            className="w-full p-4 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
            placeholder="Highlight text..."
            value={block.content}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "quote":
        const quoteContent =
          typeof block.content === "object"
            ? block.content
            : { text: block.content || "", author: "" };
        return (
          <div className="space-y-2">
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
              placeholder="Quote text..."
              value={quoteContent.text}
              onChange={(e) =>
                handleChange({ ...quoteContent, text: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Author name (optional)"
              value={quoteContent.author}
              onChange={(e) =>
                handleChange({ ...quoteContent, author: e.target.value })
              }
            />
          </div>
        );
      case "social":
        const socialLinks = Array.isArray(block.content) ? block.content : [];

        const addLink = () => {
          handleChange([...socialLinks, { platform: "website", url: "" }]);
        };

        const updateLink = (idx, field, val) => {
          const newLinks = [...socialLinks];
          newLinks[idx][field] = val;
          handleChange(newLinks);
        };

        const removeLink = (idx) => {
          handleChange(socialLinks.filter((_, i) => i !== idx));
        };

        return (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">
              Social links will always appear at the bottom of the blog post.
            </p>
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={link.platform}
                  onChange={(e) => updateLink(i, "platform", e.target.value)}
                  className="p-2 border border-gray-200 rounded-md"
                >
                  <option value="website">Website</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="youtube">YouTube</option>
                </select>
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-200 rounded-md"
                  placeholder="URL..."
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                />
                <button
                  onClick={() => removeLink(i)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addLink}
              className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
            >
              <Plus size={16} /> Add Link
            </button>
          </div>
        );
      case "list":
      case "numbered-list":
        return (
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            placeholder={`${block.type === "numbered-list" ? "Numbered" : "Bullet"} list items (one per line)...`}
            value={block.content}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "divider":
        return (
          <div className="py-4">
            <hr className="border-gray-300" />
            <div className="text-center text-xs text-gray-400 mt-1">
              Divider
            </div>
          </div>
        );
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-4 group ${block.type === "social" ? "border-l-4 border-l-purple-500" : ""}`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          {block.type !== "social" && (
            <button
              {...attributes}
              {...listeners}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </button>
          )}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {block.type.replace("-", " ")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded transition-colors ${showSettings ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-200"}`}
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          {block.type !== "social" && (
            <>
              <button
                onClick={() => moveBlock(index, -1)}
                disabled={isFirst}
                className={`p-1.5 rounded transition-colors ${isFirst ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                title="Move Up"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => moveBlock(index, 1)}
                disabled={isLast}
                className={`p-1.5 rounded transition-colors ${isLast ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                title="Move Down"
              >
                <ArrowDown size={16} />
              </button>
            </>
          )}

          <button
            onClick={() => removeBlock(block.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-2"
            title="Delete Block"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">{renderInput()}</div>
      {showSettings && (
        <StyleControls
          styles={block.styles}
          onChange={handleStyleChange}
          type={block.type}
        />
      )}
    </div>
  );
};

// Main Blog Builder Component
const BlogBuilder = () => {
  const [header, setHeader] = useState({
    title: "How to Rank Your Website on Google in 2026",
    subtitle: "A Complete SEO Guide That Actually Works",
    tag: "Digital Marketing",
    author: "Jane Doe",
    publishDate: new Date().getFullYear().toString(),
    readTime: "5 min read",
    bgImage:
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=2070&auto=format&fit=crop",
    overlayOpacity: 0.6,
    align: "text-center",
    textColor: "text-white",
  });

  const [blocks, setBlocks] = useState([
    {
      id: "intro-1",
      type: "paragraph",
      content:
        "Learn proven SEO strategies that improve visibility, traffic, and conversions in 2026. This guide covers everything you need to know.",
      styles: {
        backgroundColor: "bg-white",
        textColor: "text-gray-900",
        padding: "p-4",
        rounded: "rounded-lg",
        shadow: "shadow-none",
        textAlign: "text-left",
        accentBorder: false,
        accentColor: "border-blue-500",
        underline: false,
      },
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getDefaultStyles = (type) => {
    const base = {
      backgroundColor: "bg-white",
      textColor: "text-gray-900",
      accentColor: "border-blue-500",
      padding: "p-6",
      rounded: "rounded-lg",
      shadow: "shadow-none",
      textAlign: "text-left",
    };
    if (type === "highlight")
      return {
        ...base,
        backgroundColor: "bg-blue-50",
        textColor: "text-blue-900",
        accentBorder: true,
        padding: "p-8",
        rounded: "rounded-xl",
      };
    if (type === "subheading" || type === "h3")
      return { ...base, padding: "p-0", accentBorder: false };
    if (type === "quote")
      return {
        ...base,
        backgroundColor: "bg-gray-50",
        textColor: "text-gray-700",
        accentBorder: true,
        padding: "p-8",
      };
    if (type === "step") return { ...base, padding: "p-6", accentBorder: true };
    return base;
  };

  const addBlock = (type) => {
    if (type === "social" && blocks.some((b) => b.type === "social")) {
      alert("You can only have one Social Links block.");
      return;
    }

    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content:
        type === "social"
          ? []
          : type === "quote" || type === "step"
            ? { title: "", description: "", text: "", author: "" }
            : "",
      styles: getDefaultStyles(type),
    };

    if (type === "social") {
      setBlocks([...blocks, newBlock]);
    } else {
      const socialIndex = blocks.findIndex((b) => b.type === "social");
      if (socialIndex !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(socialIndex, 0, newBlock);
        setBlocks(newBlocks);
      } else {
        setBlocks([...blocks, newBlock]);
      }
    }
  };

  const updateBlock = (id, content, styles) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id !== id) return block;
        return {
          ...block,
          content: content !== undefined ? content : block.content,
          styles: styles !== undefined ? styles : block.styles,
        };
      }),
    );
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  const moveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    if (blocks[newIndex].type === "social" || blocks[index].type === "social")
      return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((item) => item.id === active.id);
      const newIndex = blocks.findIndex((item) => item.id === over.id);

      if (
        blocks[oldIndex].type === "social" ||
        blocks[newIndex].type === "social"
      )
        return;

      setBlocks((items) => {
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handlePublish = async (publishNow = true) => {
    try {
      const blogData = {
        title: header.title,
        subtitle: header.subtitle,
        tag: header.tag,
        author: header.author,
        publish_date: header.publishDate,
        read_time: header.readTime,
        bg_image: header.bgImage,
        overlay_opacity: header.overlayOpacity,
        align: header.align,
        text_color: header.textColor,
        blocks: blocks,
        is_published: publishNow, // true = publish, false = save draft
      };

     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blogData),
});

      const result = await response.json();

      if (result.success) {
        alert(
          publishNow
            ? `✅ Blog published! Slug: ${result.data.slug}`
            : `✅ Draft saved! ID: ${result.data.id}`,
        );
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Failed to save: ${error.message}`);
    }
  };

  const renderBlockPreview = (block, index) => {
    const { styles } = block;
    const containerClasses = `${styles.backgroundColor} ${styles.textColor} ${styles.padding} ${styles.rounded} ${styles.shadow} ${styles.textAlign} transition-all duration-300 mb-8 w-full`;

    switch (block.type) {
      case "subheading":
        return (
          <div key={block.id} id={block.id} className={containerClasses}>
            <h2
              className={`text-3xl font-bold text-gray-800 ${styles.underline ? "underline decoration-gray-300 decoration-2 underline-offset-4" : ""} ${styles.accentBorder ? `border-l-4 ${styles.accentColor} pl-4` : ""}`}
            >
              {block.content}
            </h2>
          </div>
        );
      case "h3":
        return (
          <div key={block.id} id={block.id} className={containerClasses}>
            <h3
              className={`text-xl font-bold text-gray-800 ${styles.accentBorder ? `border-l-4 ${styles.accentColor} pl-4` : ""}`}
            >
              {block.content}
            </h3>
          </div>
        );
      case "paragraph":
        return (
          <div key={block.id} className={containerClasses}>
            <p className="text-lg leading-loose text-gray-700 whitespace-pre-wrap">
              {block.content}
            </p>
          </div>
        );
      case "highlight":
        return (
          <div
            key={block.id}
            className={`${containerClasses} ${styles.accentBorder ? `border-l-8 ${styles.accentColor}` : ""}`}
          >
            <p className="text-lg font-medium leading-relaxed">
              {block.content}
            </p>
          </div>
        );
      case "step":
        const stepContent =
          typeof block.content === "object"
            ? block.content
            : { title: "", description: "" };
        const stepIndex =
          blocks
            .filter((b) => b.type === "step")
            .findIndex((b) => b.id === block.id) + 1;
        return (
          <div
            key={block.id}
            className={`${containerClasses} ${styles.accentBorder ? `border-l-4 ${styles.accentColor}` : ""}`}
          >
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
              Step {stepIndex}
            </h4>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {stepContent.title}
            </h3>
            <p className="text-lg leading-relaxed text-gray-600">
              {stepContent.description}
            </p>
          </div>
        );
      case "quote":
        const { text, author } =
          typeof block.content === "object"
            ? block.content
            : { text: block.content, author: "" };
        return (
          <div key={block.id} className={`${containerClasses} relative`}>
            <Quote
              size={48}
              className={`absolute -top-4 -left-4 opacity-10 ${styles.textColor}`}
            />
            <blockquote
              className={`relative z-10 ${styles.accentBorder ? `border-l-4 ${styles.accentColor} pl-6` : ""} italic`}
            >
              <p className="text-2xl font-serif leading-relaxed mb-4">
                "{text}"
              </p>
              {author && (
                <cite className="block text-base font-semibold not-italic opacity-75">
                  — {author}
                </cite>
              )}
            </blockquote>
          </div>
        );
      case "image":
        return block.content ? (
          <figure
            key={block.id}
            className={`${styles.padding} ${styles.backgroundColor} ${styles.rounded} ${styles.shadow} mb-8`}
          >
            <img
              src={block.content}
              alt="Blog Content"
              className={`w-full object-cover ${styles.rounded}`}
            />
            <figcaption className="text-center text-sm text-gray-500 mt-3 italic">
              Image Caption
            </figcaption>
          </figure>
        ) : null;
      case "video":
        return block.content ? (
          <div
            key={block.id}
            className={`${styles.padding} ${styles.backgroundColor} ${styles.rounded} ${styles.shadow} mb-8`}
          >
            <div
              className={`aspect-video w-full overflow-hidden bg-black ${styles.rounded}`}
            >
              {block.content.includes("youtube") ||
              block.content.includes("youtu.be") ? (
                <iframe
                  src={block.content
                    .replace("watch?v=", "embed/")
                    .replace("youtu.be/", "www.youtube.com/embed/")}
                  title="Video"
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                <video src={block.content} controls className="w-full h-full" />
              )}
            </div>
          </div>
        ) : null;
      case "list":
        return (
          <div key={block.id} className={containerClasses}>
            <ul
              className={`list-disc pl-6 space-y-3 marker:${styles.textColor} text-lg`}
            >
              {block.content
                .split("\n")
                .filter((line) => line.trim())
                .map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          </div>
        );
      case "numbered-list":
        return (
          <div key={block.id} className={containerClasses}>
            <ol
              className={`list-decimal pl-6 space-y-3 marker:${styles.textColor} text-lg`}
            >
              {block.content
                .split("\n")
                .filter((line) => line.trim())
                .map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
            </ol>
          </div>
        );
      case "social":
        return (
          <div
            key={block.id}
            className={`${containerClasses} flex flex-col items-center justify-center border-t border-gray-100 pt-8 mt-12`}
          >
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
              Share this post
            </p>
            <div className="flex gap-6">
              {block.content.map((link, i) => {
                const Icon =
                  {
                    twitter: Twitter,
                    instagram: Instagram,
                    linkedin: Linkedin,
                    youtube: Youtube,
                    website: Globe,
                  }[link.platform] || Globe;

                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-gray-100 rounded-full transition-all hover:scale-110 hover:bg-blue-50 hover:text-blue-600 ${styles.textColor}`}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        );
      case "divider":
        return <hr key={block.id} className="border-gray-200 my-12" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-gray-900">
      <div className="w-full lg:w-4/12 xl:w-3/12 p-4 lg:p-6 overflow-y-auto h-screen border-r border-gray-200 bg-gray-50 shadow-inner z-20 scrollbar-thin">
        <div className="space-y-6 pb-32">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-gray-900">Editor</h1>
            <p className="text-xs text-gray-500">Build your story.</p>
          </div>

          <HeaderEditor header={header} onChange={setHeader} />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 min-h-[100px]">
                {blocks.map((block, index) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    index={index}
                    updateBlock={updateBlock}
                    removeBlock={removeBlock}
                    moveBlock={moveBlock}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="grid grid-cols-2 gap-2 sticky bottom-4 bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-2xl">
            <button
              onClick={() => addBlock("subheading")}
              className="block-btn"
            >
              <Type size={14} className="font-bold" /> H2
            </button>
            <button onClick={() => addBlock("h3")} className="block-btn">
              <Type size={14} /> H3
            </button>
            <button onClick={() => addBlock("paragraph")} className="block-btn">
              <AlignLeft size={14} /> Text
            </button>
            <button onClick={() => addBlock("image")} className="block-btn">
              <ImageIcon size={14} /> Image
            </button>
            <button onClick={() => addBlock("step")} className="block-btn">
              <Layers size={14} /> Step
            </button>
            <button onClick={() => addBlock("highlight")} className="block-btn">
              <Highlighter size={14} /> Box
            </button>
            <button onClick={() => addBlock("quote")} className="block-btn">
              <Quote size={14} /> Quote
            </button>
            <button onClick={() => addBlock("list")} className="block-btn">
              <List size={14} /> UL
            </button>
            <button
              onClick={() => addBlock("numbered-list")}
              className="block-btn"
            >
              <ListOrdered size={14} /> OL
            </button>
            <button onClick={() => addBlock("video")} className="block-btn">
              <Video size={14} /> Video
            </button>
            <button onClick={() => addBlock("divider")} className="block-btn">
              <Minus size={14} /> Line
            </button>
            <button onClick={() => addBlock("social")} className="block-btn">
              <Share2 size={14} /> Social
            </button>

            <button
              onClick={() => handlePublish(false)}
              className="col-span-2 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all text-sm"
            >
              Save Draft
            </button>
            <button
              onClick={() => handlePublish(true)}
              className="col-span-2 py-3 bg-black text-white font-bold rounded-lg shadow-md hover:bg-gray-800 transition-all mt-2 text-sm"
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-8/12 xl:w-9/12 bg-white overflow-y-auto h-screen scroll-smooth">
        <div
          className={`relative w-full h-[500px] flex items-center justify-center ${header.align}`}
          style={{
            backgroundImage: `url(${header.bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: header.overlayOpacity }}
          ></div>
          <div
            className={`relative z-10 p-8 max-w-4xl mx-auto ${header.textColor}`}
          >
            {header.tag && (
              <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm font-medium tracking-wide">
                {header.tag}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-4 tracking-tight drop-shadow-sm">
              {header.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90 font-light mb-8 leading-relaxed max-w-2xl mx-auto">
              {header.subtitle}
            </p>
            <p className="text-sm font-medium uppercase tracking-widest opacity-80">
              {header.publishDate} • {header.readTime}
            </p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto flex flex-col-reverse xl:flex-row gap-12 p-6 lg:p-12">
          <article className="w-full xl:max-w-[800px] xl:mx-auto">
            {blocks.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                <p>Content Blocks Start Here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block, index) => renderBlockPreview(block, index))}
              </div>
            )}
          </article>

          <aside className="w-full xl:w-64 xl:shrink-0 hidden xl:block">
            <div className="sticky top-12">
              <TableOfContents blocks={blocks} />
            </div>
          </aside>
        </div>
      </div>

      <style>{`
                .block-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    background-color: rgb(249 250 251);
                    border: 1px solid rgb(229 231 235);
                    border-radius: 0.375rem;
                    transition: all 0.2s;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: rgb(75 85 99);
                }
                .block-btn:hover {
                    background-color: rgb(239 246 255);
                    border-color: rgb(191 219 254);
                    color: rgb(29 78 216);
                }
            `}</style>
    </div>
  );
};

export default BlogBuilder;
