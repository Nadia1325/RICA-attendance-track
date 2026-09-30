import fs from "fs";
import path from "path";

const TYPES = [
  "FormEvent",
  "ChangeEvent",
  "ReactNode",
  "ButtonHTMLAttributes",
  "InputHTMLAttributes",
  "SelectHTMLAttributes",
];

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(f.name)) fix(p);
  }
}

function fix(p) {
  const s = fs.readFileSync(p, "utf8");
  const n = s.replace(
    /import\s+(React,\s*)?\{([^}]*)\}\s+from\s+"react";/g,
    (_m, r, names) => {
      const out = names
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => (TYPES.includes(x) ? `type ${x}` : x));
      return `import ${r ?? ""}{ ${out.join(", ")} } from "react";`;
    },
  );
  if (n !== s) fs.writeFileSync(p, n);
}

walk("src");
