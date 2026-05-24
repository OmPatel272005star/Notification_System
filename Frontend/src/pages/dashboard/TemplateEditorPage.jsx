import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Save, Monitor, Smartphone, Eye } from "lucide-react";
import { useTemplates } from "../../context/TemplateContext";
import { useToast } from "../../hooks/useToast";
import grapesjs from "grapesjs";
import grapesjsPresetNewsletter from "grapesjs-preset-newsletter";
import grapesjsBlocksBasic from "grapesjs-blocks-basic";
import "grapesjs/dist/css/grapes.min.css";

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate } = useTemplates();
  const { addToast } = useToast();
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [deviceMode, setDeviceMode] = useState("desktop");

  const template = getTemplate(id);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      plugins: [grapesjsPresetNewsletter, grapesjsBlocksBasic],
      pluginsOpts: {
        [grapesjsPresetNewsletter]: {},
        [grapesjsBlocksBasic]: { flexGrid: true },
      },
      storageManager: false,
      height: "100%",
      width: "auto",
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Mobile", width: "375px", widthMedia: "480px" },
        ],
      },
      panels: { defaults: [] },
    });

    editorRef.current = editor;

    // Load saved project data if it exists
    if (template?.projectData) {
      try { editor.loadProjectData(template.projectData); } catch (e) { /* ignore */ }
    } else if (template?.htmlContent) {
      editor.setComponents(template.htmlContent);
    }

    return () => {
      editor.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    try {
      const html = editorRef.current.getHtml();
      const css = editorRef.current.getCss();
      const projectData = editorRef.current.getProjectData();
      const fullHtml = `<style>${css}</style>${html}`;
      const textContent = editorRef.current.getWrapper()?.view?.el?.innerText?.slice(0, 200) || "";
      await updateTemplate(id, {
        content: {
          html_body: fullHtml,
          text_preview: textContent,
          grapesjs_data: projectData,
        },
      });
      addToast("Template saved successfully", "success");
    } catch {
      addToast("Failed to save template", "error");
    } finally {
      setSaving(false);
    }
  };


  const handleSaveAndExit = async () => {
    await handleSave();
    navigate("/templates");
  };

  const setDevice = (mode) => {
    if (!editorRef.current) return;
    setDeviceMode(mode);
    editorRef.current.setDevice(mode === "desktop" ? "Desktop" : "Mobile");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      {/* ── Top bar ── */}
      <div style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", background: "#fff", borderBottom: "1px solid #E4E7EC",
        flexShrink: 0, zIndex: 100, gap: 12,
      }}>
        {/* Left: back + breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => navigate("/templates")}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #E4E7EC", borderRadius: 10, background: "none", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>
            <ChevronLeft size={15} /> Templates Gallery
          </button>
          {template && (
            <>
              <span style={{ color: "#d1d5db" }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{template.name}</span>
            </>
          )}
        </div>

        {/* Center: device toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#F7F8FC", border: "1px solid #E4E7EC", borderRadius: 10, padding: 3 }}>
          <button onClick={() => setDevice("desktop")}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: deviceMode === "desktop" ? "#6D5EF5" : "none", color: deviceMode === "desktop" ? "#fff" : "#6b7280" }}>
            <Monitor size={14} /> Desktop
          </button>
          <button onClick={() => setDevice("mobile")}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: deviceMode === "mobile" ? "#6D5EF5" : "none", color: deviceMode === "mobile" ? "#fff" : "#6b7280" }}>
            <Smartphone size={14} /> Mobile
          </button>
        </div>

        {/* Right: save actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "1px solid #E4E7EC", borderRadius: 10, background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
            <Eye size={14} /> Preview
          </button>
          <button onClick={handleSaveAndExit} disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg, #6D5EF5, #8B7CFF)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── GrapesJS canvas ── */}
      <div ref={containerRef} style={{ flex: 1, overflow: "hidden" }} />

      {/* Custom GrapesJS overrides */}
      <style>{`
        /* ── Base editor font ── */
        .gjs-editor, .gjs-editor * { font-family: Inter, system-ui, sans-serif !important; box-sizing: border-box; }

        /* ── Canvas background ── */
        .gjs-cv-canvas { background: #f0f2f7 !important; }

        /* ── RIGHT PANEL (blocks panel) ── */
        .gjs-pn-views-container { background: #ffffff !important; border-left: 1px solid #E4E7EC !important; width: 220px !important; }
        .gjs-pn-views { background: #ffffff !important; border-bottom: 1px solid #E4E7EC !important; }
        .gjs-pn-views .gjs-pn-btn {
          color: #6b7280 !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 8px 10px !important;
          border-radius: 0 !important;
          border-bottom: 2px solid transparent !important;
        }
        .gjs-pn-views .gjs-pn-btn.gjs-pn-active {
          color: #6D5EF5 !important;
          border-bottom-color: #6D5EF5 !important;
          background: transparent !important;
        }
        .gjs-pn-views .gjs-pn-btn:hover { color: #6D5EF5 !important; background: #f9f9ff !important; }

        /* ── Block category header ── */
        .gjs-block-category { border-bottom: 1px solid #F0F0F0 !important; }
        .gjs-block-category .gjs-title {
          font-size: 10px !important;
          font-weight: 700 !important;
          letter-spacing: 0.08em !important;
          color: #9ca3af !important;
          text-transform: uppercase !important;
          padding: 10px 12px 6px !important;
          background: #fafafa !important;
        }

        /* ── Block grid ── */
        .gjs-blocks-c {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          padding: 10px !important;
        }

        /* ── Individual block cell ── */
        .gjs-block {
          width: auto !important;
          height: auto !important;
          min-height: 72px !important;
          padding: 10px 6px 8px !important;
          border: 1px solid #E8EAED !important;
          border-radius: 10px !important;
          background: #fff !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          cursor: grab !important;
          transition: all 0.15s ease !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
        }
        .gjs-block:hover {
          border-color: #6D5EF5 !important;
          box-shadow: 0 2px 8px rgba(109,94,245,0.15) !important;
          transform: translateY(-1px) !important;
        }

        /* ── Block icon (SVG / media area) ── */
        .gjs-block__media {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 28px !important;
          height: 28px !important;
          flex-shrink: 0 !important;
        }
        .gjs-block__media svg { width: 20px !important; height: 20px !important; }

        /* ── KILL all colored text in blocks — force neutral dark ── */
        .gjs-block .gjs-block-label,
        .gjs-block-label,
        .gjs-block .gjs-four-color,
        .gjs-block span,
        .gjs-block div {
          color: #374151 !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          text-align: center !important;
          line-height: 1.3 !important;
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: unset !important;
          word-break: break-word !important;
        }

        /* ── Remove all GrapesJS color utility classes within blocks ── */
        .gjs-block .gjs-four-color { color: #374151 !important; }
        .gjs-block .gjs-three-bg { background: transparent !important; }

        /* ── LEFT toolbar panels ── */
        .gjs-pn-panels { background: #fff !important; border-right: 1px solid #E4E7EC !important; }
        .gjs-pn-options, .gjs-pn-commands {
          background: #ffffff !important;
          border-bottom: 1px solid #E4E7EC !important;
          padding: 6px !important;
          gap: 4px !important;
          display: flex !important;
          align-items: center !important;
        }
        .gjs-pn-btn {
          border-radius: 8px !important;
          padding: 6px !important;
          color: #6b7280 !important;
          transition: all 0.15s !important;
        }
        .gjs-pn-btn:hover { background: #f3f4f6 !important; color: #6D5EF5 !important; }
        .gjs-pn-btn.gjs-pn-active { color: #6D5EF5 !important; background: #ede9fe !important; }

        /* ── Trait/Style manager panel ── */
        .gjs-trt-header, .gjs-sm-header { 
          font-size: 11px !important; 
          font-weight: 700 !important;
          color: #9ca3af !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          padding: 10px 12px !important;
          background: #fafafa !important;
          border-bottom: 1px solid #F0F0F0 !important;
        }

        /* ── Layer manager ── */
        .gjs-layer-name { font-size: 12px !important; color: #374151 !important; }
        .gjs-layer { padding: 5px 8px !important; }
        .gjs-layer.gjs-selected { background: #ede9fe !important; }

        /* ── Selected component highlight ── */
        .gjs-selected { outline: 2px solid #6D5EF5 !important; }

        /* ── Toolbar (the mini floating toolbar above selected elements) ── */
        .gjs-toolbar { background: #1e1e2e !important; border-radius: 8px !important; }
        .gjs-toolbar-item { color: #e5e7eb !important; }
        .gjs-toolbar-item:hover { background: #6D5EF5 !important; border-radius: 6px !important; }

        /* ── Color theme utilities ── */
        .gjs-one-bg { background: #ffffff !important; }
        .gjs-two-bg { background: #f9fafb !important; }
        .gjs-two-color { color: #374151 !important; }
        .gjs-three-color { color: #6b7280 !important; }
        .gjs-four-color { color: #6D5EF5 !important; }
        .gjs-four-color-h:hover { color: #6D5EF5 !important; }
      `}</style>
    </div>
  );
}
