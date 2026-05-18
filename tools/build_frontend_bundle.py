"""Build a browser-disk-safe frontend bundle.

Firefox and Safari are strict about loading ES modules from file:// paths.
This script bundles the local ES-module app into one classic script so
index.html can be opened directly from disk.

Run:
  .venv/bin/python tools/build_frontend_bundle.py
"""

from __future__ import annotations

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
ENTRY = ROOT / "src" / "app.js"
OUT = APP / "dist" / "app.bundle.js"
STYLES_BASE = ROOT / "src" / "styles-base.css"
STYLES_APP = ROOT / "src" / "app.css"
STYLES_OUT = APP / "styles.css"

BARE_IMPORTS = {
    "preact": APP / "lib" / "preact.module.js",
    "preact/hooks": APP / "lib" / "preact-hooks.module.js",
    "htm": APP / "lib" / "htm.module.js",
}

IMPORT_RE = re.compile(
    r"^\s*import\s*([\s\S]*?)\s*\bfrom\b\s*['\"]([^'\"]+)['\"]\s*;",
    re.MULTILINE,
)
EXPORT_LIST_RE = re.compile(r"export\s*\{([^}]*)\}\s*;")


def module_id(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def resolve_import(specifier: str, importer: Path) -> Path:
    if specifier in BARE_IMPORTS:
        return BARE_IMPORTS[specifier]
    if specifier.startswith("."):
        return (importer.parent / specifier).resolve()
    raise ValueError(f"Unsupported import specifier {specifier!r} in {importer}")


def parse_imports(code: str):
    imports = []
    for match in IMPORT_RE.finditer(code):
        clause = match.group(1).strip()
        specifier = match.group(2).strip()
        imports.append((match.group(0), clause, specifier))
    return imports


def import_binding(clause: str, dep_id: str) -> str:
    if clause.startswith("{"):
        destructure = re.sub(r'\b(\w+)\s+as\s+(\w+)\b', r'\1: \2', clause)
        return f"const {destructure} = __wwip_require__({dep_id!r});"
    if clause.startswith("* as "):
        name = clause[5:].strip()
        return f"const {name} = __wwip_require__({dep_id!r});"
    if "," in clause:
        default_name, named = clause.split(",", 1)
        lines = [f"const {default_name.strip()} = __wwip_require__({dep_id!r}).default;"]
        lines.append(f"const {named.strip()} = __wwip_require__({dep_id!r});")
        return "\n".join(lines)
    return f"const {clause} = __wwip_require__({dep_id!r}).default;"


def transform_exports(code: str):
    exports = []

    def record(name: str, local_name: str | None = None):
        exports.append((name, local_name or name))
        return local_name or name

    def replace_default_named(match):
        name = match.group(1)
        record("default", name)
        return f"function {name}("

    code = re.sub(
        r"export\s+default\s+function\s+([A-Za-z_$][\w$]*)\s*\(",
        replace_default_named,
        code,
    )

    def replace_default_anon(match):
        record("default", "__default__")
        return "const __default__ = function("

    code = re.sub(
        r"export\s+default\s+function\s*\(",
        replace_default_anon,
        code,
    )

    def replace_named_function(match):
        prefix = match.group(1) or ""
        name = match.group(2)
        record(name)
        return f"{prefix}function {name}("

    code = re.sub(
        r"export\s+(async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(",
        replace_named_function,
        code,
    )

    def replace_named_decl(match):
        kind = match.group(1)
        name = match.group(2)
        record(name)
        return f"{kind} {name}"

    code = re.sub(
        r"export\s+(const|let|var|class)\s+([A-Za-z_$][\w$]*)",
        replace_named_decl,
        code,
    )

    def replace_export_list(match):
        raw = match.group(1)
        for part in raw.split(","):
            item = part.strip()
            if not item:
                continue
            if " as " in item:
                local_name, export_name = [p.strip() for p in item.split(" as ", 1)]
            else:
                local_name = export_name = item
            record(export_name, local_name)
        return ""

    code = EXPORT_LIST_RE.sub(replace_export_list, code)

    if "export default " in code:
        code = code.replace("export default ", "const __default__ = ", 1)
        record("default", "__default__")

    export_lines = [f"exports[{name!r}] = {local_name};" for name, local_name in exports]
    return code, export_lines


def bundle_module(path: Path, seen: dict[str, str]):
    path = path.resolve()
    mid = module_id(path)
    if mid in seen:
        return

    raw_code = path.read_text()
    imports = parse_imports(raw_code)

    transformed = raw_code
    prelude = []
    for statement, clause, specifier in imports:
        dep = resolve_import(specifier, path)
        bundle_module(dep, seen)
        dep_id = module_id(dep)
        prelude.append(import_binding(clause, dep_id))
        transformed = transformed.replace(statement, "", 1)

    transformed, export_lines = transform_exports(transformed)

    body = "\n".join(
        [
            *prelude,
            transformed.strip(),
            *export_lines,
        ]
    ).strip()
    seen[mid] = body


def build_bundle():
    modules = {}
    bundle_module(ENTRY, modules)
    OUT.parent.mkdir(parents=True, exist_ok=True)

    parts = [
        "(function () {",
        '  "use strict";',
        "  const __wwip_modules__ = Object.create(null);",
        "  const __wwip_cache__ = Object.create(null);",
        "  function __wwip_define__(id, factory) { __wwip_modules__[id] = factory; }",
        "  function __wwip_require__(id) {",
        "    if (__wwip_cache__[id]) return __wwip_cache__[id].exports;",
        '    if (!__wwip_modules__[id]) throw new Error(`Unknown module: ${id}`);',
        "    const module = { exports: {} };",
        "    __wwip_cache__[id] = module;",
        "    __wwip_modules__[id](module, module.exports, __wwip_require__);",
        "    return module.exports;",
        "  }",
        "",
    ]

    for mid, body in modules.items():
        parts.extend(
            [
                f"  __wwip_define__({mid!r}, function (module, exports, __wwip_require__) {{",
                body,
                "  });",
                "",
            ]
        )

    parts.extend(
        [
            f"  __wwip_require__({module_id(ENTRY)!r});",
            "})();",
            "",
        ]
    )

    OUT.write_text("\n".join(parts))
    STYLES_OUT.parent.mkdir(parents=True, exist_ok=True)
    css_parts = [
        STYLES_BASE.read_text().rstrip(),
        "",
        STYLES_APP.read_text().rstrip(),
        "",
    ]
    STYLES_OUT.write_text("\n".join(css_parts))
    print(f"Wrote {OUT.relative_to(ROOT)}")
    print(f"Wrote {STYLES_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    build_bundle()
