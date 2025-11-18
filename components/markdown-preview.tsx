"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import { useEffect } from "react"

interface MarkdownPreviewProps {
  markdown: string
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  // Load KaTeX CSS from CDN
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
    link.integrity = "sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
    link.crossOrigin = "anonymous"

    // Check if the stylesheet is already loaded
    if (!document.querySelector('link[href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"]')) {
      document.head.appendChild(link)
    }

    // Add custom styles for formatting and KaTeX
    const style = document.createElement("style")
    style.textContent = `
      /* General formatting */
.markdown-content {
  font-family: 'Lexend', system-ui, sans-serif;
  line-height: 1.7;
  color: rgb(0, 0, 0) !important;
  max-width: 800px;
  margin: auto;
  padding: 1rem;
}

/* Headings */
.markdown-content h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1.2rem;
  text-align: center;
  color: rgb(0, 0, 0) !important;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: rgb(0, 0, 0) !important;
  border-left: 4px solid #ddd;
  padding-left: 0.75rem;
}

.markdown-content h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.6rem;
  color: rgb(0, 0, 0) !important;
}

.markdown-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 1.2rem;
  margin-bottom: 0.4rem;
  font-style: italic;
  color: rgb(0, 0, 0) !important;
}

/* Lists */
.markdown-content ul {
  list-style-type: disc;
  padding-left: 1.8rem;
  margin: 1rem 0;
}

.markdown-content ol {
  list-style-type: decimal;
  padding-left: 1.8rem;
  margin: 1rem 0;
}

.markdown-content li {
  margin-bottom: 0.5rem;
  color: rgb(0, 0, 0) !important;
}

/* Text formatting */
.markdown-content strong {
  font-weight: 700;
  color: rgb(0, 0, 0) !important;
}

.markdown-content em {
  font-style: italic;
  color: rgb(0, 0, 0) !important;
}

.markdown-content p {
  margin: 1rem 0;
  color: rgb(0, 0, 0) !important;
}

/* Links */
.markdown-content a {
  color: #0070f3 !important;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

/* Horizontal rules for section breaks */
.markdown-content hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 2rem 0;
}

/* KaTeX specific styling */
.katex {
  color: rgb(0, 0, 0) !important;
  display: block;
  text-align: center;
  margin: 1.5rem 0;
}

.katex * {
  color: rgb(0, 0, 0) !important;
}

.katex-display {
  display: block;
  text-align: center;
  margin: 1.5rem 0;
}

/* Fractions and Math Details */
.katex .mfrac .frac-line {
  border-bottom-width: 1px !important;
  border-bottom-style: solid !important;
  border-bottom-color: #000000 !important;
  position: relative !important;
  top: 0.5em !important;
  margin: 0.15em 0 !important;
}

.katex .mfrac .mfracnum,
.katex .mfrac .mfracden {
  display: inline-block !important;
  margin: 0.2em 0 !important;
}

.katex .mfrac {
  display: inline-block !important;
  vertical-align: middle !important;
  margin: 0.2em 0 !important;
}

/* Code blocks */
.markdown-content pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.35rem;
  overflow-x: auto;
  margin: 2rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.markdown-content code {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  padding: 0.2rem 0.4rem;
  background-color: #f5f5f5;
  border-radius: 0.25rem;
  color: rgb(0, 0, 0) !important;
}

    `
    document.head.appendChild(style)

    return () => {
      // Clean up the custom style
      document.head.removeChild(style)
      // No need to remove the stylesheet as it might be used by other components
    }
  }, [])

  return (
    <div className="prose max-w-none dark:prose-invert markdown-content" style={{ color: "rgb(0,0,0)" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
            // Paragraphs
            p: ({ node, ...props }) => (
              <p style={{ color: "rgb(0,0,0)", margin: "1rem 0", lineHeight: "1.7" }} {...props} />
            ),
          
            // Headings
            h1: ({ node, ...props }) => (
              <h1
                style={{
                  color: "rgb(0,0,0)",
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  marginTop: "2rem",
                  marginBottom: "1.2rem",
                  textAlign: "center",
                  borderBottom: "2px solid #eaeaea",
                  paddingBottom: "0.5rem",
                }}
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                style={{
                  color: "rgb(0,0,0)",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  marginTop: "2rem",
                  marginBottom: "1rem",
                  borderLeft: "4px solid #ddd",
                  paddingLeft: "0.75rem",
                }}
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                style={{
                  color: "rgb(0,0,0)",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  marginTop: "1.5rem",
                  marginBottom: "0.6rem",
                }}
                {...props}
              />
            ),
            h4: ({ node, ...props }) => (
              <h4
                style={{
                  color: "rgb(0,0,0)",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginTop: "1.2rem",
                  marginBottom: "0.4rem",
                  fontStyle: "italic",
                }}
                {...props}
              />
            ),
          
            // Lists
            ul: ({ node, ...props }) => (
              <ul style={{ listStyleType: "disc", paddingLeft: "1.8rem", margin: "1rem 0" }} {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol style={{ listStyleType: "decimal", paddingLeft: "1.8rem", margin: "1rem 0" }} {...props} />
            ),
            li: ({ node, ...props }) => (
              <li style={{ color: "rgb(0,0,0)", marginBottom: "0.5rem" }} {...props} />
            ),
          
            // Text formatting
            strong: ({ node, ...props }) => (
              <strong style={{ color: "rgb(0,0,0)", fontWeight: 700 }} {...props} />
            ),
            em: ({ node, ...props }) => (
              <em style={{ color: "rgb(0,0,0)", fontStyle: "italic" }} {...props} />
            ),
          
            // Links - with special handling for PDFs
            a: ({ node, href, children, ...props }: { node?: any; href?: string; children?: any; [key: string]: any }) => {
              const isPdfLink = href?.toLowerCase().endsWith('.pdf') || href?.toLowerCase().includes('.pdf')
              
              if (isPdfLink) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#0070f3",
                      textDecoration: "none",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                    onClick={(e) => {
                      // Allow default link behavior (opens in new tab)
                      // But also allow embedding if user wants
                    }}
                    {...props}
                  >
                    {children}
                    <span style={{ fontSize: "0.85em", marginLeft: "0.25rem" }}>📄</span>
                  </a>
                )
              }
              
              return (
                <a
                  href={href}
                  style={{ color: "#0070f3", textDecoration: "none" }}
                  target={href?.startsWith('http') ? "_blank" : undefined}
                  rel={href?.startsWith('http') ? "noopener noreferrer" : undefined}
                  {...props}
                >
                  {children}
                </a>
              )
            },
          
            // Inline and block code
            code: ({ node, inline, ...props }: { node?: any; inline?: boolean; [key: string]: any }) =>
              inline ? (
                <code
                  style={{
                    color: "rgb(0,0,0)",
                    fontFamily: "monospace",
                    fontSize: "0.9em",
                    padding: "0.2rem 0.4rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "0.25rem",
                  }}
                  {...props}
                />
              ) : (
                <code style={{ color: "rgb(0,0,0)" }} {...props} />
              ),
          
            pre: ({ node, ...props }) => (
              <pre
                style={{
                  color: "rgb(0,0,0)",
                  backgroundColor: "#f5f5f5",
                  padding: "1rem",
                  borderRadius: "0.35rem",
                  overflowX: "auto",
                  margin: "2rem 0",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                }}
                {...props}
              />
            ),
          
            // Horizontal rules
            hr: () => (
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #ccc",
                  margin: "2rem 0",
                }}
              />
            ),
          
            // Images - supports URLs, data URLs, and base64
            // Also handles PDF files that were incorrectly inserted as images
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
                      margin: "1.5rem auto",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      border: "2px dashed #eaeaea",
                      textAlign: "center",
                      color: "rgb(0,0,0)",
                    }}
                  >
                    {alt || "Image not available"}
                  </span>
                )
              }

              // Check if this is a PDF file - convert to link/embed instead of image
              const isPdf = imageSrc.toLowerCase().endsWith('.pdf') || imageSrc.toLowerCase().includes('.pdf')
              
              if (isPdf) {
                // Render PDF as an embedded viewer with link option
                return (
                  <div style={{ 
                    margin: "1.5rem auto", 
                    maxWidth: "100%",
                    border: "2px solid #eaeaea",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    backgroundColor: "#ffffff"
                  }}>
                    <div style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "#f5f5f5",
                      borderBottom: "1px solid #eaeaea",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "rgb(0,0,0)" }}>
                        📄 {alt || "PDF Document"}
                      </span>
                      <a
                        href={imageSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.85rem",
                          color: "#0070f3",
                          textDecoration: "none",
                          fontWeight: 500
                        }}
                      >
                        Open in new tab →
                      </a>
                    </div>
                    <iframe
                      src={imageSrc}
                      style={{
                        width: "100%",
                        height: "600px",
                        border: "none",
                        display: "block"
                      }}
                      title={alt || "PDF Document"}
                      onError={(e) => {
                        console.error("Failed to load PDF:", imageSrc)
                        // Fallback to link if iframe fails
                        const target = e.target as HTMLIFrameElement
                        target.style.display = "none"
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div style="padding: 2rem; text-align: center;">
                              <p style="margin-bottom: 1rem; color: rgb(0,0,0);">PDF could not be embedded. Please open the link below.</p>
                              <a href="${imageSrc}" target="_blank" rel="noopener noreferrer" style="color: #0070f3; text-decoration: none; font-weight: 500;">
                                Open PDF: ${alt || imageSrc}
                              </a>
                            </div>
                          `
                        }
                      }}
                    />
                  </div>
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
                      margin: "1.5rem auto",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      border: "2px dashed #eaeaea",
                      textAlign: "center",
                      color: "rgb(0,0,0)",
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
                    margin: "1.5rem auto",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "2px solid #eaeaea",
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

            // Centered KaTeX blocks (requires katex rendered separately)
            div: ({ node, className, ...props }: { node?: any; className?: string; [key: string]: any }) => {
              if (className === "katex-display") {
                return (
                  <div
                    className={className}
                    style={{
                      textAlign: "center",
                      margin: "1.5rem 0",
                      color: "rgb(0,0,0)",
                    }}
                    {...props}
                  />
                );
              }
              // Support YouTube video embeds (divs with iframes)
              if (props.children && typeof props.children === 'object' && 'props' in props.children) {
                const children = props.children.props?.children
                if (Array.isArray(children)) {
                  const hasIframe = children.some((child: any) => 
                    child?.props?.src?.includes('youtube.com/embed')
                  )
                  if (hasIframe) {
                    // This is a YouTube embed, render as-is
                    return <div {...props} />;
                  }
                }
              }
              return <div className={className} {...props} />;
            },
            
            // Support iframe for YouTube embeds and PDF embeds
            iframe: ({ node, src, ...props }: { node?: any; src?: string; [key: string]: any }) => {
              if (src?.includes('youtube.com/embed')) {
                return (
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", maxWidth: "100%", margin: "1.5rem auto", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <iframe
                      src={src}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      {...props}
                    />
                  </div>
                );
              }
              
              // Handle PDF embeds
              if (src?.toLowerCase().endsWith('.pdf') || src?.toLowerCase().includes('.pdf')) {
                return (
                  <div style={{ 
                    margin: "1.5rem auto", 
                    maxWidth: "100%",
                    border: "2px solid #eaeaea",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    backgroundColor: "#ffffff"
                  }}>
                    <div style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "#f5f5f5",
                      borderBottom: "1px solid #eaeaea",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "rgb(0,0,0)" }}>
                        PDF Viewer
                      </span>
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.85rem",
                          color: "#0070f3",
                          textDecoration: "none",
                          fontWeight: 500
                        }}
                      >
                        Open in new tab →
                      </a>
                    </div>
                    <iframe
                      src={src}
                      style={{
                        width: "100%",
                        height: "600px",
                        border: "none",
                        display: "block"
                      }}
                      title="PDF Document"
                      {...props}
                    />
                  </div>
                );
              }
              
              return <iframe src={src} {...props} />;
            }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
