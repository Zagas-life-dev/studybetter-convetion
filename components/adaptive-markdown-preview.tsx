"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { useEffect } from "react"
import type { UserProfile } from "@/hooks/use-user"

interface AdaptiveMarkdownPreviewProps {
  markdown: string
  profile: UserProfile | null
}

// Get adaptive styles based on neurodivergence type
function getAdaptiveStyles(neurodivergenceType: string | null) {
  const baseStyles = {
    fontFamily: "'Lexend', system-ui, sans-serif",
    lineHeight: 1.7,
    color: "#000000",
    padding: "1rem",
  }

  switch (neurodivergenceType) {
    case "dyslexia":
      return {
        ...baseStyles,
        fontFamily: "Arial, Helvetica, sans-serif", // Sans-serif for better readability
        fontSize: "18px", // Larger font size
        lineHeight: 2.0, // Increased line spacing
        letterSpacing: "0.5px", // Letter spacing helps with reading
        color: "#000000", // High contrast black
        backgroundColor: "#ffffff",
        // Avoid italics, use bold instead
      }

    case "adhd":
      return {
        ...baseStyles,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "16px",
        lineHeight: 1.8,
        color: "#1a1a1a",
        backgroundColor: "#fafafa", // Slightly off-white to reduce glare
        // More visual breaks, shorter paragraphs
      }

    case "autism":
      return {
        ...baseStyles,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "17px",
        lineHeight: 1.9,
        color: "#000000",
        backgroundColor: "#ffffff",
        // Clear structure, consistent formatting
      }

    case "audhd":
      return {
        ...baseStyles,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "18px",
        lineHeight: 2.0,
        letterSpacing: "0.5px",
        color: "#000000",
        backgroundColor: "#ffffff",
        // Combines dyslexia and autism needs
      }

    default:
      return baseStyles
  }
}

// Get heading colors based on neurodivergence type
function getHeadingColor(neurodivergenceType: string | null) {
  switch (neurodivergenceType) {
    case "dyslexia":
      return "#4a5568" // Dark gray - high contrast, less harsh than black
    case "adhd":
      return "#7c3aed" // Purple gradient - engaging but not distracting
    case "autism":
      return "#1e40af" // Blue - calming, clear
    case "audhd":
      return "#5b21b6" // Deep purple - clear but not overwhelming
    default:
      return "#000000" // Black
  }
}

// Get border/divider colors
function getAccentColor(neurodivergenceType: string | null) {
  switch (neurodivergenceType) {
    case "dyslexia":
      return "#cbd5e0" // Light gray borders
    case "adhd":
      return "#a78bfa" // Purple accent
    case "autism":
      return "#60a5fa" // Blue accent
    case "audhd":
      return "#8b5cf6" // Purple accent
    default:
      return "#eaeaea" // Default gray
  }
}

export function AdaptiveMarkdownPreview({ markdown, profile }: AdaptiveMarkdownPreviewProps) {
  const neurodivergenceType = profile?.neurodivergence_type || null
  const adaptiveStyles = getAdaptiveStyles(neurodivergenceType)
  const headingColor = getHeadingColor(neurodivergenceType)
  const accentColor = getAccentColor(neurodivergenceType)
  const isDyslexia = neurodivergenceType === "dyslexia" || neurodivergenceType === "audhd"
  const isADHD = neurodivergenceType === "adhd" || neurodivergenceType === "audhd"
  const isAutism = neurodivergenceType === "autism" || neurodivergenceType === "audhd"

  // Load KaTeX CSS from CDN
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
    link.integrity = "sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
    link.crossOrigin = "anonymous"

    if (!document.querySelector('link[href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"]')) {
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div
      className="prose max-w-none adaptive-markdown-content"
      style={{
        ...adaptiveStyles,
        backgroundColor: adaptiveStyles.backgroundColor || "transparent",
        width: "100%",
        maxWidth: "none",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Paragraphs - adaptive spacing
          p: ({ node, ...props }) => (
            <p
              style={{
                color: adaptiveStyles.color,
                margin: isADHD ? "1.5rem 0" : "1rem 0", // More spacing for ADHD
                lineHeight: adaptiveStyles.lineHeight,
                fontSize: adaptiveStyles.fontSize,
                letterSpacing: adaptiveStyles.letterSpacing || "normal",
                maxWidth: "100%",
              }}
              {...props}
            />
          ),

          // Headings with adaptive colors and spacing
          h1: ({ node, ...props }) => (
            <h1
              style={{
                color: headingColor,
                fontSize: isDyslexia ? "2.5rem" : "2.25rem",
                fontWeight: 700,
                marginTop: isADHD ? "3rem" : "2rem",
                marginBottom: isADHD ? "1.5rem" : "1.2rem",
                textAlign: "center",
                borderBottom: `3px solid ${accentColor}`,
                paddingBottom: "0.75rem",
                letterSpacing: isDyslexia ? "0.5px" : "normal",
              }}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              style={{
                color: headingColor,
                fontSize: isDyslexia ? "2rem" : "1.75rem",
                fontWeight: 700,
                marginTop: isADHD ? "2.5rem" : "2rem",
                marginBottom: isADHD ? "1.25rem" : "1rem",
                borderLeft: `5px solid ${accentColor}`,
                paddingLeft: "1rem",
                backgroundColor: isADHD ? `${accentColor}10` : "transparent", // Subtle background for ADHD
                paddingTop: isADHD ? "0.5rem" : "0",
                paddingBottom: isADHD ? "0.5rem" : "0",
                borderRadius: isADHD ? "4px" : "0",
                letterSpacing: isDyslexia ? "0.3px" : "normal",
              }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              style={{
                color: headingColor,
                fontSize: isDyslexia ? "1.6rem" : "1.4rem",
                fontWeight: 600,
                marginTop: isADHD ? "2rem" : "1.5rem",
                marginBottom: isADHD ? "1rem" : "0.6rem",
                letterSpacing: isDyslexia ? "0.3px" : "normal",
              }}
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              style={{
                color: headingColor,
                fontSize: isDyslexia ? "1.4rem" : "1.2rem",
                fontWeight: 600,
                marginTop: isADHD ? "1.75rem" : "1.2rem",
                marginBottom: isADHD ? "0.75rem" : "0.4rem",
                fontStyle: isDyslexia ? "normal" : "italic", // Avoid italics for dyslexia
                letterSpacing: isDyslexia ? "0.3px" : "normal",
              }}
              {...props}
            />
          ),

          // Lists with adaptive spacing
          ul: ({ node, ...props }) => (
            <ul
              style={{
                listStyleType: "disc",
                paddingLeft: isDyslexia ? "2rem" : "1.8rem",
                margin: isADHD ? "1.5rem 0" : "1rem 0",
                lineHeight: adaptiveStyles.lineHeight,
              }}
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              style={{
                listStyleType: "decimal",
                paddingLeft: isDyslexia ? "2rem" : "1.8rem",
                margin: isADHD ? "1.5rem 0" : "1rem 0",
                lineHeight: adaptiveStyles.lineHeight,
              }}
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              style={{
                color: adaptiveStyles.color,
                marginBottom: isADHD ? "0.75rem" : "0.5rem",
                fontSize: adaptiveStyles.fontSize,
                lineHeight: adaptiveStyles.lineHeight,
                letterSpacing: adaptiveStyles.letterSpacing || "normal",
              }}
              {...props}
            />
          ),

          // Text formatting - avoid italics for dyslexia
          strong: ({ node, ...props }) => (
            <strong
              style={{
                color: adaptiveStyles.color,
                fontWeight: 700,
                fontSize: isDyslexia ? "1.1em" : "1em", // Slightly larger for dyslexia
              }}
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em
              style={{
                color: adaptiveStyles.color,
                fontStyle: isDyslexia ? "normal" : "italic", // No italics for dyslexia
                fontWeight: isDyslexia ? 600 : "normal", // Use bold instead
              }}
              {...props}
            />
          ),

          // Links with adaptive colors
          a: ({ node, ...props }) => (
            <a
              style={{
                color: accentColor,
                textDecoration: "underline",
                textDecorationColor: accentColor,
                fontWeight: 600,
              }}
              {...props}
            />
          ),

          // Code blocks
          code: ({ node, inline, ...props }: { node?: any; inline?: boolean; [key: string]: any }) =>
            inline ? (
              <code
                style={{
                  color: adaptiveStyles.color,
                  fontFamily: "monospace",
                  fontSize: isDyslexia ? "1em" : "0.9em",
                  padding: "0.3rem 0.5rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "0.25rem",
                  letterSpacing: isDyslexia ? "0.5px" : "normal",
                }}
                {...props}
              />
            ) : (
              <code style={{ color: adaptiveStyles.color }} {...props} />
            ),

          pre: ({ node, ...props }) => (
            <pre
              style={{
                color: adaptiveStyles.color,
                backgroundColor: "#f5f5f5",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                overflowX: "auto",
                margin: isADHD ? "2.5rem 0" : "2rem 0",
                fontSize: isDyslexia ? "1rem" : "0.95rem",
                lineHeight: adaptiveStyles.lineHeight,
                border: `2px solid ${accentColor}40`, // Subtle border
              }}
              {...props}
            />
          ),

          // Horizontal rules with adaptive colors
          hr: () => (
            <hr
              style={{
                border: "none",
                borderTop: `2px solid ${accentColor}`,
                margin: isADHD ? "3rem 0" : "2rem 0",
                opacity: 0.5,
              }}
            />
          ),

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                borderLeft: `4px solid ${accentColor}`,
                paddingLeft: "1.5rem",
                margin: isADHD ? "2rem 0" : "1.5rem 0",
                fontStyle: isDyslexia ? "normal" : "italic",
                backgroundColor: `${accentColor}10`,
                padding: "1rem 1.5rem",
                borderRadius: "4px",
              }}
              {...props}
            />
          ),

          // Images with adaptive styling - supports URLs, data URLs, and base64
          img: ({ node, src, alt, ...props }: { node?: any; src?: string; alt?: string; [key: string]: any }) => {
            // Handle various image URL formats
            const imageSrc = src?.trim() || null
            
            // Don't render if src is empty or invalid - use span with block display to avoid nesting issues
            if (!imageSrc || imageSrc === "") {
              return (
                <span
                  style={{
                    display: "block",
                    padding: "1rem",
                    margin: isADHD ? "2rem auto" : "1.5rem auto",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: `2px dashed ${accentColor}40`,
                    textAlign: "center",
                    color: adaptiveStyles.color,
                    fontSize: adaptiveStyles.fontSize,
                  }}
                >
                  {alt || "Image not available"}
                </span>
              )
            }

            const isValidImageUrl = imageSrc.startsWith("http://") || 
                                   imageSrc.startsWith("https://") || 
                                   imageSrc.startsWith("data:image/") ||
                                   imageSrc.startsWith("/") ||
                                   imageSrc.startsWith("./")
            
            if (!isValidImageUrl) {
              // If it's not a valid URL format, show placeholder - use span with block display
              return (
                <span
                  style={{
                    display: "block",
                    padding: "1rem",
                    margin: isADHD ? "2rem auto" : "1.5rem auto",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: `2px dashed ${accentColor}40`,
                    textAlign: "center",
                    color: adaptiveStyles.color,
                    fontSize: adaptiveStyles.fontSize,
                  }}
                >
                  {alt || "Invalid image URL"}
                </span>
              )
            }

            return (
              <img
                src={imageSrc}
                alt={alt || "Image"}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  margin: isADHD ? "2rem auto" : "1.5rem auto",
                  borderRadius: "8px",
                  boxShadow: `0 2px 8px ${accentColor}30`,
                  border: `2px solid ${accentColor}20`,
                  backgroundColor: "#ffffff",
                  padding: "0.5rem",
                }}
                loading="lazy"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  console.error("Failed to load image:", imageSrc)
                }}
                {...props}
              />
            )
          },

          // KaTeX display blocks
          div: ({ node, className, ...props }: { node?: any; className?: string; [key: string]: any }) => {
            if (className === "katex-display") {
              return (
                <div
                  className={className}
                  style={{
                    textAlign: "center",
                    margin: isADHD ? "2.5rem 0" : "1.5rem 0",
                    color: adaptiveStyles.color,
                    padding: isADHD ? "1rem" : "0.5rem",
                    backgroundColor: `${accentColor}05`,
                    borderRadius: "4px",
                  }}
                  {...props}
                />
              )
            }
            return <div className={className} {...props} />
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

