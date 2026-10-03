/* @ds-bundle: {"format":4,"namespace":"OrbitDesignSystem_5c1997","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Input.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"ActionRequest","sourcePath":"components/orbit/ActionRequest.jsx"},{"name":"ChatMessage","sourcePath":"components/orbit/ChatMessage.jsx"},{"name":"RuleCard","sourcePath":"components/orbit/RuleCard.jsx"},{"name":"StudentTile","sourcePath":"components/orbit/StudentTile.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"441351ffd2b7","components/core/Avatar.jsx":"b98f3dc37b6d","components/core/Badge.jsx":"d53fc7e27c4c","components/core/Button.jsx":"06f3fdd9af5a","components/core/Card.jsx":"afa5627b5e1b","components/core/Icon.jsx":"a9b8bf997536","components/core/IconButton.jsx":"b51b51b453b5","components/core/Tag.jsx":"c175ca8e02a5","components/feedback/Dialog.jsx":"0548713613d7","components/feedback/Toast.jsx":"776f18f14850","components/feedback/Tooltip.jsx":"ec42d1618fd4","components/forms/Checkbox.jsx":"4488941c2d27","components/forms/Input.jsx":"f60db777a648","components/forms/Radio.jsx":"6b3a5301663e","components/forms/Select.jsx":"7e27ca88dc4e","components/forms/Switch.jsx":"29f6b719fc81","components/forms/Textarea.jsx":"7245c5342988","components/navigation/Tabs.jsx":"76d740df5081","components/orbit/ActionRequest.jsx":"210b479109c8","components/orbit/ChatMessage.jsx":"20061e41dcac","components/orbit/RuleCard.jsx":"ff8d14743fc3","components/orbit/StudentTile.jsx":"1ec9bb0c752e","ui_kits/student-tutor/Files.jsx":"8eef148035e6","ui_kits/student-tutor/StudentApp.jsx":"b687e2e2e6bc","ui_kits/student-tutor/TutorChat.jsx":"67d4d4f47410","ui_kits/teacher-console/ClassroomLive.jsx":"1e106246597b","ui_kits/teacher-console/RulesView.jsx":"2ffbc93dacc6","ui_kits/teacher-console/SessionPanel.jsx":"c36a4473f0c8","ui_kits/teacher-console/Sidebar.jsx":"b3166e247d34","ui_kits/teacher-console/TeacherApp.jsx":"024275a08ce7","ui_kits/teacher-console/data.js":"9ab90c44e3c3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OrbitDesignSystem_5c1997 = window.OrbitDesignSystem_5c1997 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
const C = {
  plum: ['var(--plum-700)', 'var(--plum-600)', 'var(--sun-500)'],
  white: ['#fff', '#fff', 'var(--sun-300)'],
  ink: ['var(--sand-900)', 'var(--sand-900)', 'var(--sun-500)']
};
function Cap({
  ink,
  sun
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 40 30",
    style: {
      display: 'block',
      width: '100%',
      overflow: 'visible',
      transform: 'rotate(-10deg)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 4L38 11L20 18L2 11Z",
    fill: ink
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 11L32 14V21",
    fill: "none",
    stroke: sun,
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "24",
    r: "3.5",
    fill: sun
  }));
}
function Logo({
  variant = 'full',
  size = 32,
  tone = 'plum',
  style
}) {
  const [word, ink, sun] = C[tone] || C.plum;
  if (variant === 'mark') {
    const ring = size * .44,
      bw = Math.max(2, size * .11);
    return /*#__PURE__*/React.createElement("span", {
      role: "img",
      "aria-label": "Orbit",
      style: {
        position: 'relative',
        display: 'inline-block',
        width: size,
        height: size,
        flex: 'none',
        ...style
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: '50%',
        bottom: size * .08,
        width: ring,
        height: ring,
        marginLeft: -ring / 2,
        borderRadius: '50%',
        border: bw + 'px solid ' + ink,
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: '50%',
        top: size * .06,
        width: size * .78,
        marginLeft: -size * .39
      }
    }, /*#__PURE__*/React.createElement(Cap, {
      ink: ink,
      sun: sun
    })));
  }
  return /*#__PURE__*/React.createElement("span", {
    role: "img",
    "aria-label": "Orbit",
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      font: '700 ' + size + 'px/1 var(--font-sans)',
      letterSpacing: '-.045em',
      color: word,
      whiteSpace: 'nowrap',
      paddingTop: size * .3,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'relative',
      display: 'inline-block',
      lineHeight: 1
    }
  }, "o", /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: '.48em',
      width: '.66em',
      marginLeft: '-.33em'
    }
  }, /*#__PURE__*/React.createElement(Cap, {
    ink: tone === 'plum' ? ink : word,
    sun: sun
  }))), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "rbit"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
const P = [['var(--plum-100)', 'var(--plum-700)'], ['var(--green-100)', 'var(--green-700)'], ['var(--blue-100)', 'var(--blue-700)'], ['var(--amber-100)', 'var(--amber-700)'], ['var(--sand-100)', 'var(--sand-700)']];
const SC = {
  working: 'var(--state-working)',
  stuck: 'var(--state-stuck)',
  approval: 'var(--state-approval)',
  paused: 'var(--state-paused)',
  offline: 'var(--sand-300)'
};
function Avatar({
  name = '',
  size = 32,
  status,
  teacher,
  style
}) {
  const ini = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  const [bg, fg] = teacher ? ['var(--sun-300)', 'var(--sand-900)'] : P[n % P.length];
  const d = Math.max(8, Math.round(size * .3));
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-grid',
      placeItems: 'center',
      flex: 'none',
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      color: fg,
      font: 'var(--fw-semibold) ' + Math.round(size * .38) + 'px/1 var(--font-sans)',
      ...style
    }
  }, ini, status && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: -1,
      bottom: -1,
      width: d,
      height: d,
      borderRadius: '50%',
      background: SC[status],
      boxShadow: '0 0 0 2px var(--surface-card)'
    }
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const T = {
  neutral: ['var(--sand-100)', 'var(--sand-700)', 'var(--sand-400)'],
  brand: ['var(--plum-50)', 'var(--plum-700)', 'var(--plum-500)'],
  working: ['var(--state-working-bg)', 'var(--state-working-ink)', 'var(--state-working)'],
  stuck: ['var(--state-stuck-bg)', 'var(--state-stuck-ink)', 'var(--state-stuck)'],
  approval: ['var(--state-approval-bg)', 'var(--state-approval-ink)', 'var(--state-approval)'],
  paused: ['var(--state-paused-bg)', 'var(--state-paused-ink)', 'var(--state-paused)'],
  danger: ['var(--state-danger-bg)', 'var(--state-danger-ink)', 'var(--state-danger)'],
  teacher: ['var(--sun-100)', 'var(--sun-700)', 'var(--sun-500)']
};
function Badge({
  tone = 'neutral',
  dot,
  pulse,
  children,
  style
}) {
  const [bg, fg, dc] = T[tone] || T.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 22,
      padding: '0 8px',
      borderRadius: 'var(--radius-full)',
      background: bg,
      color: fg,
      font: 'var(--fw-medium) 12px/1 var(--font-sans)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: dc,
      animation: pulse || pulse !== false && tone === 'stuck' ? 'orbit-pulse 1.8s infinite' : 'none'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  eyebrow,
  title,
  actions,
  padding = 16,
  interactive,
  selected,
  onClick,
  children,
  style
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid ' + (selected ? 'var(--plum-500)' : 'var(--border-1)'),
      borderRadius: 'var(--radius-md)',
      boxShadow: selected ? '0 0 0 1px var(--plum-500)' : interactive && h ? 'var(--shadow-md)' : 'var(--shadow-xs)',
      padding,
      cursor: interactive ? 'pointer' : undefined,
      transition: 'box-shadow var(--dur-base) var(--ease-out)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minWidth: 0,
      ...style
    }
  }, (eyebrow || title || actions) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: 'var(--fg-3)',
      marginBottom: 4
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-h3)',
      color: 'var(--fg-1)'
    }
  }, title)), actions), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const BASE = 'https://unpkg.com/lucide-static@0.469.0/icons/';
function Icon({
  name,
  size = 16,
  color = 'currentColor',
  style,
  title
}) {
  const url = 'url(' + BASE + name + '.svg)';
  return /*#__PURE__*/React.createElement("span", {
    role: title ? 'img' : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    style: {
      display: 'inline-block',
      flex: 'none',
      width: size,
      height: size,
      backgroundColor: color,
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useHP() {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);
  return [{
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setP(false);
    },
    onMouseDown: () => setP(true),
    onMouseUp: () => setP(false)
  }, h, p];
}
const V = {
  primary: {
    bg: 'var(--accent)',
    h: 'var(--accent-hover)',
    p: 'var(--accent-press)',
    fg: 'var(--fg-on-brand)',
    bd: 'transparent'
  },
  secondary: {
    bg: 'var(--surface-card)',
    h: 'var(--sand-50)',
    p: 'var(--sand-100)',
    fg: 'var(--fg-1)',
    bd: 'var(--border-2)'
  },
  ghost: {
    bg: 'transparent',
    h: 'var(--sand-100)',
    p: 'var(--sand-200)',
    fg: 'var(--fg-1)',
    bd: 'transparent'
  },
  teacher: {
    bg: 'var(--sun-300)',
    h: '#ecc35e',
    p: 'var(--sun-500)',
    fg: 'var(--sand-900)',
    bd: 'transparent'
  },
  danger: {
    bg: 'var(--red-500)',
    h: 'var(--red-700)',
    p: 'var(--red-700)',
    fg: '#fff',
    bd: 'transparent'
  }
};
const S = {
  sm: {
    h: 28,
    px: 10,
    fs: 13,
    ic: 14,
    g: 6
  },
  md: {
    h: 36,
    px: 14,
    fs: 14,
    ic: 16,
    g: 8
  },
  lg: {
    h: 44,
    px: 18,
    fs: 15,
    ic: 18,
    g: 8
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  full,
  type = 'button',
  onClick,
  children,
  style
}) {
  const [ev, h, p] = useHP();
  const v = V[variant] || V.primary;
  const s = S[size] || S.md;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick
  }, ev, {
    style: {
      display: full ? 'flex' : 'inline-flex',
      width: full ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.g,
      height: s.h,
      padding: '0 ' + s.px + 'px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid ' + v.bd,
      background: disabled ? 'var(--sand-100)' : p ? v.p : h ? v.h : v.bg,
      color: disabled ? 'var(--fg-3)' : v.fg,
      font: 'var(--fw-medium) ' + s.fs + 'px/1 var(--font-sans)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap',
      transform: p && !disabled ? 'translateY(1px)' : 'none',
      transition: 'background var(--dur-fast) var(--ease-out),transform var(--dur-fast)',
      boxShadow: variant === 'secondary' ? 'var(--shadow-xs)' : 'none',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.ic
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.ic
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useHP() {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);
  return [{
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setP(false);
    },
    onMouseDown: () => setP(true),
    onMouseUp: () => setP(false)
  }, h, p];
}
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  active,
  disabled,
  onClick,
  style
}) {
  const [ev, h, p] = useHP();
  const d = {
    sm: 28,
    md: 36,
    lg: 44
  }[size] || 36;
  const ic = {
    sm: 14,
    md: 16,
    lg: 18
  }[size] || 16;
  const bg = variant === 'primary' ? h ? 'var(--accent-hover)' : 'var(--accent)' : variant === 'secondary' ? h ? 'var(--sand-50)' : 'var(--surface-card)' : active ? 'var(--plum-50)' : h ? 'var(--sand-100)' : 'transparent';
  const fg = variant === 'primary' ? '#fff' : active ? 'var(--fg-brand)' : 'var(--fg-2)';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick
  }, ev, {
    style: {
      width: d,
      height: d,
      display: 'inline-grid',
      placeItems: 'center',
      borderRadius: 'var(--radius-sm)',
      border: variant === 'secondary' ? '1px solid var(--border-2)' : '1px solid transparent',
      background: bg,
      color: h && variant === 'ghost' && !active ? 'var(--fg-1)' : fg,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .45 : 1,
      transform: p ? 'translateY(1px)' : 'none',
      transition: 'background var(--dur-fast)',
      padding: 0,
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: ic
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  children,
  icon,
  onRemove,
  mono,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: 24,
      padding: onRemove ? '0 4px 0 8px' : '0 8px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--surface-sunken)',
      color: 'var(--fg-1)',
      font: mono ? 'var(--fw-regular) 12px/1 var(--font-mono)' : 'var(--fw-medium) 12px/1 var(--font-sans)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13,
    color: "var(--fg-2)"
  }), children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Remove",
    onClick: onRemove,
    style: {
      border: 0,
      background: 'transparent',
      padding: 2,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      color: 'var(--fg-3)',
      borderRadius: 3
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 12
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open = true,
  title,
  description,
  children,
  actions,
  onClose,
  width = 440,
  inline
}) {
  if (!open) return null;
  const panel = /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": !inline,
    style: {
      width,
      maxWidth: '100%',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-1)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'orbit-fade-up var(--dur-slow) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '20px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-h2)',
      fontSize: 18,
      color: 'var(--fg-1)'
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--fg-2)',
      marginTop: 6
    }
  }, description)), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Close",
    size: "sm",
    onClick: onClose
  })), children && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 0'
    }
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      padding: 20
    }
  }, actions));
  if (inline) return panel;
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--overlay-scrim)',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      zIndex: 100
    }
  }, panel);
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const I = {
  info: ['info', 'var(--plum-300)'],
  success: ['check-circle-2', '#7cc49f'],
  warning: ['triangle-alert', 'var(--sun-300)'],
  teacher: ['sticky-note', 'var(--sun-300)']
};
function Toast({
  tone = 'info',
  title,
  message,
  action,
  onClose
}) {
  const [ic, c] = I[tone] || I.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      width: 360,
      maxWidth: '100%',
      padding: '12px 14px',
      background: 'var(--surface-inverse)',
      color: 'var(--fg-inverse)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      animation: 'orbit-fade-up var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ic,
    size: 18,
    color: c,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      fontSize: 14
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body)',
      fontSize: 13,
      color: 'var(--plum-200)',
      marginTop: 2
    }
  }, message)), action && /*#__PURE__*/React.createElement("button", {
    onClick: action.onClick,
    style: {
      border: 0,
      background: 'transparent',
      color: 'var(--sun-300)',
      font: 'var(--type-label)',
      cursor: 'pointer',
      padding: '2px 4px'
    }
  }, action.label), onClose && /*#__PURE__*/React.createElement("button", {
    "aria-label": "Dismiss",
    onClick: onClose,
    style: {
      border: 0,
      background: 'transparent',
      color: 'var(--plum-300)',
      cursor: 'pointer',
      padding: 2,
      display: 'grid'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 14
  })));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  content,
  children,
  side = 'top',
  open
}) {
  const [h, setH] = React.useState(false);
  const show = open !== undefined ? open : h;
  const pos = side === 'bottom' ? {
    top: '100%',
    marginTop: 6
  } : {
    bottom: '100%',
    marginBottom: 6
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      ...pos,
      whiteSpace: 'nowrap',
      padding: '5px 8px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--sand-900)',
      color: 'var(--sand-25)',
      font: 'var(--type-caption)',
      pointerEvents: 'none',
      zIndex: 50,
      animation: 'orbit-fade-up var(--dur-fast) var(--ease-out)'
    }
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
  name,
  value
}) {
  const [c, setC] = React.useState(!!defaultChecked);
  const on = checked !== undefined ? checked : c;
  const t = () => {
    if (disabled) return;
    if (checked === undefined) setC(!on);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", {
    onClick: e => {
      e.preventDefault();
      t();
    },
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "checkbox",
    "aria-checked": on,
    tabIndex: 0,
    onKeyDown: e => {
      if (e.key === ' ') {
        e.preventDefault();
        t();
      }
    },
    style: {
      flex: 'none',
      width: 18,
      height: 18,
      marginTop: 1,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 'var(--radius-xs)',
      border: '1.5px solid ' + (on ? 'var(--accent)' : 'var(--sand-400)'),
      background: on ? 'var(--accent)' : 'var(--surface-card)',
      transition: 'all var(--dur-fast)'
    }
  }, on && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    color: "#fff"
  })), (label || description) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontWeight: 400,
      fontSize: 14,
      color: 'var(--fg-1)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--fg-3)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Field({
  label,
  hint,
  error,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--fg-1)'
    }
  }, label), children, (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: error ? 'var(--state-danger-ink)' : 'var(--fg-3)'
    }
  }, error || hint));
}
function Input({
  label,
  hint,
  error,
  icon,
  size = 'md',
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  style
}) {
  const [f, setF] = React.useState(false);
  const h = {
    sm: 28,
    md: 36,
    lg: 44
  }[size] || 36;
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint,
    error: error
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      padding: '0 10px',
      background: disabled ? 'var(--sand-50)' : 'var(--surface-card)',
      border: '1px solid ' + (error ? 'var(--red-500)' : f ? 'var(--border-focus)' : 'var(--border-2)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: f ? 'var(--ring-focus)' : 'none',
      transition: 'box-shadow var(--dur-fast)',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16,
    color: "var(--fg-3)"
  }), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setF(true),
    onBlur: () => setF(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      font: 'var(--type-body)',
      color: 'var(--fg-1)'
    }
  })));
}
Object.assign(__ds_scope, { Field, Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
  name,
  value
}) {
  const [c, setC] = React.useState(!!defaultChecked);
  const on = checked !== undefined ? checked : c;
  const t = () => {
    if (disabled) return;
    if (checked === undefined) setC(true);
    onChange && onChange(true);
  };
  return /*#__PURE__*/React.createElement("label", {
    onClick: e => {
      e.preventDefault();
      t();
    },
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "radio",
    "aria-checked": on,
    tabIndex: 0,
    onKeyDown: e => {
      if (e.key === ' ') {
        e.preventDefault();
        t();
      }
    },
    style: {
      flex: 'none',
      width: 18,
      height: 18,
      marginTop: 1,
      display: 'grid',
      placeItems: 'center',
      borderRadius: '50%',
      border: '1.5px solid ' + (on ? 'var(--accent)' : 'var(--sand-400)'),
      background: 'var(--surface-card)',
      transition: 'all var(--dur-fast)'
    }
  }, on && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--accent)'
    }
  })), (label || description) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontWeight: 400,
      fontSize: 14,
      color: 'var(--fg-1)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--fg-3)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  hint,
  error,
  options = [],
  value,
  defaultValue,
  onChange,
  size = 'md',
  disabled,
  style
}) {
  const h = {
    sm: 28,
    md: 36,
    lg: 44
  }[size] || 36;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled,
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      width: '100%',
      height: h,
      padding: '0 32px 0 10px',
      background: 'var(--surface-card)',
      border: '1px solid ' + (error ? 'var(--red-500)' : 'var(--border-2)'),
      borderRadius: 'var(--radius-sm)',
      font: 'var(--type-body)',
      color: 'var(--fg-1)',
      cursor: 'pointer',
      outline: 0,
      ...style
    }
  }, options.map(o => typeof o === 'string' ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16,
    color: "var(--fg-3)",
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      marginTop: -8,
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled,
  size = 'md'
}) {
  const [c, setC] = React.useState(!!defaultChecked);
  const on = checked !== undefined ? checked : c;
  const w = size === 'sm' ? 28 : 36,
    h = size === 'sm' ? 16 : 20,
    k = h - 4;
  const t = () => {
    if (disabled) return;
    if (checked === undefined) setC(!on);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1
    },
    onClick: e => {
      e.preventDefault();
      t();
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": on,
    tabIndex: 0,
    onKeyDown: e => {
      if (e.key === ' ') {
        e.preventDefault();
        t();
      }
    },
    style: {
      position: 'relative',
      flex: 'none',
      width: w,
      height: h,
      borderRadius: h,
      background: on ? 'var(--accent)' : 'var(--sand-300)',
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? w - k - 2 : 2,
      width: k,
      height: k,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--fg-1)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function Textarea({
  label,
  hint,
  error,
  rows = 3,
  mono,
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled,
  style
}) {
  const [f, setF] = React.useState(false);
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error
  }, /*#__PURE__*/React.createElement("textarea", {
    rows: rows,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setF(true),
    onBlur: () => setF(false),
    style: {
      resize: 'vertical',
      padding: '8px 10px',
      background: 'var(--surface-card)',
      border: '1px solid ' + (error ? 'var(--red-500)' : f ? 'var(--border-focus)' : 'var(--border-2)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: f ? 'var(--ring-focus)' : 'none',
      outline: 0,
      font: mono ? 'var(--type-rule)' : 'var(--type-body)',
      color: 'var(--fg-1)',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items = [],
  value,
  onChange,
  variant = 'underline'
}) {
  if (variant === 'segmented') return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'inline-flex',
      gap: 2,
      padding: 2,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-sm)'
    }
  }, items.map(it => {
    const a = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      role: "tab",
      "aria-selected": a,
      onClick: () => onChange && onChange(it.id),
      style: {
        height: 28,
        padding: '0 12px',
        border: 0,
        borderRadius: 4,
        background: a ? 'var(--surface-card)' : 'transparent',
        boxShadow: a ? 'var(--shadow-sm)' : 'none',
        font: 'var(--type-label)',
        color: a ? 'var(--fg-1)' : 'var(--fg-2)',
        cursor: 'pointer'
      }
    }, it.label);
  }));
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'flex',
      gap: 20,
      borderBottom: '1px solid var(--border-1)'
    }
  }, items.map(it => {
    const a = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      role: "tab",
      "aria-selected": a,
      onClick: () => onChange && onChange(it.id),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 40,
        padding: 0,
        marginBottom: -1,
        border: 0,
        borderBottom: '2px solid ' + (a ? 'var(--accent)' : 'transparent'),
        background: 'transparent',
        font: 'var(--type-label)',
        fontSize: 14,
        color: a ? 'var(--fg-1)' : 'var(--fg-2)',
        cursor: 'pointer'
      }
    }, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 18,
        height: 18,
        padding: '0 5px',
        borderRadius: 9,
        display: 'inline-grid',
        placeItems: 'center',
        background: a ? 'var(--plum-100)' : 'var(--sand-100)',
        color: a ? 'var(--plum-700)' : 'var(--fg-2)',
        font: 'var(--fw-medium) 11px/1 var(--font-sans)'
      }
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/orbit/ActionRequest.jsx
try { (() => {
function ActionRequest({
  student,
  action,
  detail,
  time,
  state = 'pending',
  onApprove,
  onDeny
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 14,
      background: 'var(--surface-card)',
      border: '1px solid ' + (state === 'pending' ? 'var(--blue-500)' : 'var(--border-1)'),
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, student && /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: student,
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--fg-1)'
    }
  }, student ? student + '’s tutor' : 'Tutor', " wants to ", action), time && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      font: 'var(--type-caption)',
      color: 'var(--fg-3)'
    }
  }, time)), detail && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-rule)',
      fontSize: 12,
      padding: '8px 10px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--fg-1)',
      whiteSpace: 'pre-wrap'
    }
  }, detail), state === 'pending' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    icon: "check",
    onClick: onApprove
  }, "Approve"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "secondary",
    onClick: onDeny
  }, "Deny")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-caption)',
      color: state === 'approved' ? 'var(--state-working-ink)' : 'var(--state-danger-ink)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: state === 'approved' ? 'check' : 'x',
    size: 13
  }), state === 'approved' ? 'Approved' : 'Denied'));
}
Object.assign(__ds_scope, { ActionRequest });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/orbit/ActionRequest.jsx", error: String((e && e.message) || e) }); }

// components/orbit/ChatMessage.jsx
try { (() => {
function ChatMessage({
  role = 'tutor',
  author,
  time,
  meta,
  children
}) {
  if (role === 'system') return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'center',
      font: 'var(--type-caption)',
      color: 'var(--fg-3)',
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "info",
    size: 13
  }), children);
  if (role === 'teacher') return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: '12px 14px',
      background: 'var(--surface-teacher)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: author || 'Teacher',
    teacher: true,
    size: 26
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--sun-700)'
    }
  }, author || 'Your teacher'), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: 'var(--sun-700)'
    }
  }, "Teacher"), time && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--fg-3)',
      marginLeft: 'auto'
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--fg-1)',
      marginTop: 3
    }
  }, children)));
  const me = role === 'student';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: me ? 'flex-end' : 'flex-start',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      font: 'var(--type-caption)',
      color: 'var(--fg-3)'
    }
  }, !me && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: 'var(--plum-600)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sparkle",
    size: 10,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-2)',
      fontWeight: 500
    }
  }, author || (me ? 'You' : 'Tutor')), time && /*#__PURE__*/React.createElement("span", null, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '82%',
      padding: me ? '9px 13px' : '2px 0',
      background: me ? 'var(--plum-600)' : 'transparent',
      color: me ? '#fff' : 'var(--fg-1)',
      borderRadius: me ? '14px 14px 4px 14px' : 0,
      font: me ? 'var(--type-body)' : 'var(--type-body-lg)',
      fontSize: me ? 14 : 15,
      whiteSpace: 'pre-wrap'
    }
  }, children), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: 'var(--fw-regular) 11px/1.3 var(--font-mono)',
      color: 'var(--fg-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "shield-check",
    size: 12
  }), meta));
}
Object.assign(__ds_scope, { ChatMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/orbit/ChatMessage.jsx", error: String((e && e.message) || e) }); }

// components/orbit/RuleCard.jsx
try { (() => {
function RuleCard({
  rule,
  scope = 'All students',
  kind = 'behavior',
  enabled,
  defaultEnabled = true,
  onToggle,
  onEdit
}) {
  const [e, setE] = React.useState(defaultEnabled);
  const on = enabled !== undefined ? enabled : e;
  const ic = {
    behavior: 'message-circle-question',
    permission: 'shield',
    mode: 'timer'
  }[kind] || 'scroll-text';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: '14px 16px',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-1)',
      borderRadius: 'var(--radius-md)',
      opacity: on ? 1 : .62
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--plum-50)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ic,
    size: 15,
    color: "var(--plum-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-rule)',
      color: 'var(--fg-1)'
    }
  }, rule), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-caption)',
      color: 'var(--fg-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "users",
    size: 12
  }), scope, onEdit && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      border: 0,
      padding: 0,
      background: 'transparent',
      font: 'inherit',
      color: 'var(--text-link)',
      cursor: 'pointer'
    }
  }, "Edit")))), /*#__PURE__*/React.createElement(__ds_scope.Switch, {
    size: "sm",
    checked: on,
    onChange: v => {
      if (enabled === undefined) setE(v);
      onToggle && onToggle(v);
    }
  }));
}
Object.assign(__ds_scope, { RuleCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/orbit/RuleCard.jsx", error: String((e && e.message) || e) }); }

// components/orbit/StudentTile.jsx
try { (() => {
const L = {
  working: 'Working',
  stuck: 'Stuck',
  approval: 'Needs approval',
  paused: 'Paused',
  offline: 'Offline'
};
function StudentTile({
  name,
  status = 'working',
  topic,
  minutes,
  lastMessage,
  hasNote,
  selected,
  onClick
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 14,
      background: status === 'offline' ? 'var(--sand-50)' : 'var(--surface-card)',
      border: '1px solid ' + (selected ? 'var(--plum-500)' : 'var(--border-1)'),
      boxShadow: selected ? '0 0 0 1px var(--plum-500)' : h ? 'var(--shadow-md)' : 'var(--shadow-xs)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'box-shadow var(--dur-base) var(--ease-out)',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    size: 28
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      font: 'var(--type-h3)',
      fontSize: 14,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: status === 'offline' ? 'var(--fg-3)' : 'var(--fg-1)'
    }
  }, name), hasNote && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sticky-note",
    size: 14,
    color: "var(--teacher)",
    title: "Teacher note"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: status === 'offline' ? 'neutral' : status,
    dot: true
  }, L[status]), minutes != null && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) 11px/1 var(--font-mono)',
      color: 'var(--fg-3)'
    }
  }, minutes, " min")), topic && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--fg-2)'
    }
  }, topic), lastMessage && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body)',
      fontSize: 13,
      color: 'var(--fg-1)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, "\u201C", lastMessage, "\u201D"));
}
Object.assign(__ds_scope, { StudentTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/orbit/StudentTile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/student-tutor/Files.jsx
try { (() => {
(() => {
  const {
    Logo,
    Icon,
    Tag,
    Button
  } = window.OrbitDesignSystem_5c1997;
  function Files({
    files,
    active,
    setActive
  }) {
    return /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 260,
        flex: 'none',
        background: 'var(--surface-page)',
        borderRight: '1px solid var(--border-1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 14px',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 10px'
      }
    }, /*#__PURE__*/React.createElement(Logo, {
      size: 26
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-eyebrow)',
        letterSpacing: 'var(--ls-caps)',
        textTransform: 'uppercase',
        color: 'var(--fg-3)',
        padding: '0 6px 4px'
      }
    }, "Algebra I \xB7 Ms. Ortega"), ['Problem set 4.2', 'Factoring quadratics', 'Unit 3 review'].map((x, i) => /*#__PURE__*/React.createElement("button", {
      key: x,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 34,
        padding: '0 8px',
        border: 0,
        borderRadius: 'var(--radius-sm)',
        background: i === 1 ? 'var(--plum-50)' : 'transparent',
        color: i === 1 ? 'var(--plum-700)' : 'var(--fg-2)',
        font: 'var(--type-label)',
        fontSize: 14,
        textAlign: 'left',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "message-square",
      size: 15
    }), x))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-eyebrow)',
        letterSpacing: 'var(--ls-caps)',
        textTransform: 'uppercase',
        color: 'var(--fg-3)',
        padding: '0 6px'
      }
    }, "Files your tutor can read"), files.map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      onClick: () => setActive(f),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px',
        border: '1px solid ' + (active === f ? 'var(--border-2)' : 'transparent'),
        borderRadius: 'var(--radius-sm)',
        background: active === f ? 'var(--surface-card)' : 'transparent',
        font: 'var(--type-rule)',
        fontSize: 12,
        color: 'var(--fg-1)',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: f.endsWith('.jpg') ? 'image' : 'file-text',
      size: 15,
      color: "var(--fg-2)"
    }), f)), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      icon: "paperclip"
    }, "Add a file")));
  }
  window.Files = Files;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/student-tutor/Files.jsx", error: String((e && e.message) || e) }); }

// ui_kits/student-tutor/StudentApp.jsx
try { (() => {
(() => {
  const {
    Switch: Sw
  } = window.OrbitDesignSystem_5c1997;
  function StudentApp() {
    const [msgs, setMsgs] = React.useState([{
      role: 'system',
      text: 'Ms. Ortega set this tutor to give hints only.'
    }, {
      role: 'student',
      time: '10:38',
      text: 'How do I factor x² + x − 6?'
    }, {
      role: 'tutor',
      time: '10:38',
      text: 'Start by looking for two numbers. What should they multiply to, and what should they add to?',
      meta: 'Hint given · answer withheld'
    }, {
      role: 'student',
      time: '10:40',
      text: 'Multiply to −6 and add to 1. So 3 and −2?'
    }, {
      role: 'tutor',
      time: '10:40',
      text: 'Good. Now write it as two binomials and expand them to check. What do you get for the middle term?'
    }]);
    const [thinking, setThinking] = React.useState(false);
    const [paused, setPaused] = React.useState(false);
    const [active, setActive] = React.useState('worksheet-4.2.pdf');
    const n = React.useRef(0);
    const replies = [['Look at the outer and inner products separately. What is x·(−2)? What is 3·x?', 'Hint given · answer withheld'], ['Close. Add those two together. Does the sum match the middle term in your original expression?', 'Hint given · answer withheld'], ['I can’t give you the final answer, but you’re one step away. Try writing out the expansion line by line.', 'Rule: Give hints, but never reveal the final answer.']];
    const send = t => {
      setMsgs(m => [...m, {
        role: 'student',
        time: 'now',
        text: t
      }]);
      setThinking(true);
      const r = replies[n.current++ % replies.length];
      setTimeout(() => {
        setThinking(false);
        setMsgs(m => [...m, {
          role: 'tutor',
          time: 'now',
          text: r[0],
          meta: r[1]
        }]);
        if (n.current === 2) setTimeout(() => setMsgs(m => [...m, {
          role: 'teacher',
          author: 'Ms. Ortega',
          time: 'now',
          text: 'Nice persistence, Maya. Check the sign on your second number.'
        }]), 1200);
      }, 900);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement(Files, {
      files: ['worksheet-4.2.pdf', 'my-work.jpg'],
      active: active,
      setActive: setActive
    }), /*#__PURE__*/React.createElement(TutorChat, {
      msgs: paused ? [...msgs, {
        role: 'system',
        text: 'Your teacher paused the tutor.'
      }] : msgs,
      onSend: send,
      paused: paused,
      thinking: thinking
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        right: 16,
        bottom: 16,
        padding: '8px 12px',
        background: 'var(--surface-card)',
        border: '1px dashed var(--border-2)',
        borderRadius: 'var(--radius-sm)',
        font: 'var(--type-caption)',
        color: 'var(--fg-3)',
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, "Demo: ", /*#__PURE__*/React.createElement(Sw, {
      size: "sm",
      checked: paused,
      onChange: setPaused,
      label: "Teacher paused"
    })));
  }
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(StudentApp, null));
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/student-tutor/StudentApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/student-tutor/TutorChat.jsx
try { (() => {
(() => {
  const {
    ChatMessage,
    Button,
    IconButton,
    Icon,
    Badge,
    Tag
  } = window.OrbitDesignSystem_5c1997;
  function TutorChat({
    msgs,
    onSend,
    paused,
    thinking
  }) {
    const [v, setV] = React.useState('');
    const ref = React.useRef();
    React.useEffect(() => {
      if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }, [msgs, thinking]);
    const send = () => {
      if (!v.trim() || paused) return;
      onSend(v);
      setV('');
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)'
      }
    }, /*#__PURE__*/React.createElement("header", {
      style: {
        height: 'var(--topbar-h)',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 28px',
        borderBottom: '1px solid var(--border-1)'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        font: 'var(--type-h1)',
        fontSize: 24,
        letterSpacing: 'var(--ls-display)'
      }
    }, "Factoring quadratics"), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        font: 'var(--type-caption)',
        color: 'var(--fg-2)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "eye",
      size: 14
    }), "Your teacher can see this session")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 28px',
        borderBottom: '1px solid var(--border-1)',
        background: 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-eyebrow)',
        letterSpacing: 'var(--ls-caps)',
        textTransform: 'uppercase',
        color: 'var(--fg-3)'
      }
    }, "Your tutor will"), /*#__PURE__*/React.createElement(Tag, {
      mono: true
    }, "Give hints, not final answers"), /*#__PURE__*/React.createElement(Tag, {
      mono: true
    }, "Read your files"), /*#__PURE__*/React.createElement(Tag, {
      mono: true
    }, "Not run code")), /*#__PURE__*/React.createElement("div", {
      ref: ref,
      style: {
        flex: 1,
        overflow: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 720,
        margin: '0 auto',
        padding: '28px 28px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, msgs.map((m, i) => /*#__PURE__*/React.createElement(ChatMessage, {
      key: i,
      role: m.role,
      time: m.time,
      author: m.author,
      meta: m.meta
    }, m.text)), thinking && /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--fg-3)',
        display: 'flex',
        gap: 6,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkle",
      size: 12,
      color: "var(--plum-500)"
    }), "Tutor is thinking\u2026"))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 720,
        width: '100%',
        margin: '0 auto',
        padding: '0 28px 24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: 8,
        background: paused ? 'var(--sand-100)' : 'var(--surface-card)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: "paperclip",
      label: "Attach file",
      disabled: paused
    }), /*#__PURE__*/React.createElement("textarea", {
      rows: 1,
      value: v,
      disabled: paused,
      onChange: e => setV(e.target.value),
      onKeyDown: e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      },
      placeholder: paused ? 'Your teacher paused the tutor.' : 'Ask your tutor…',
      style: {
        flex: 1,
        resize: 'none',
        border: 0,
        outline: 0,
        background: 'transparent',
        font: 'var(--type-body)',
        fontSize: 15,
        padding: '8px 4px',
        color: 'var(--fg-1)'
      }
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "arrow-up",
      label: "Send",
      variant: "primary",
      onClick: send,
      disabled: paused || !v.trim()
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--fg-3)',
        textAlign: 'center',
        marginTop: 8
      }
    }, "Your tutor helps you think it through. It won\u2019t do the work for you.")));
  }
  window.TutorChat = TutorChat;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/student-tutor/TutorChat.jsx", error: String((e && e.message) || e) }); }

// ui_kits/teacher-console/ClassroomLive.jsx
try { (() => {
(() => {
  const {
    StudentTile,
    Tabs,
    Card,
    Badge,
    Input,
    Tabs: T2
  } = window.OrbitDesignSystem_5c1997;
  function ClassroomLive({
    students,
    selected,
    onSelect,
    sticking
  }) {
    const [f, setF] = React.useState('all');
    const c = s => students.filter(x => x.status === s).length;
    const shown = students.filter(s => f === 'all' || s.status === f);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
        gap: 12
      }
    }, [['Working', c('working'), 'working'], ['Stuck', c('stuck'), 'stuck'], ['Needs approval', c('approval'), 'approval'], ['Paused', c('paused'), 'paused']].map(([l, n, t]) => /*#__PURE__*/React.createElement(Card, {
      key: l,
      padding: 14
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: t,
      dot: true,
      pulse: false
    }, l)), /*#__PURE__*/React.createElement("div", {
      style: {
        font: '400 36px/1 var(--font-serif)',
        color: 'var(--fg-1)'
      }
    }, n)))), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Live \xB7 last 15 min",
      title: "Where students are stuck"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, sticking.map(([t, n]) => /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: '0 0 260px',
        font: 'var(--type-body)'
      }
    }, t), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        background: 'var(--sand-100)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        height: 6,
        borderRadius: 3,
        width: n / 12 * 100 + '%',
        background: 'var(--amber-500)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-regular) 12px/1 var(--font-mono)',
        color: 'var(--fg-2)',
        width: 70,
        textAlign: 'right'
      }
    }, n, " students"))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      items: [{
        id: 'all',
        label: 'All',
        count: students.length
      }, {
        id: 'stuck',
        label: 'Stuck',
        count: c('stuck')
      }, {
        id: 'approval',
        label: 'Needs approval',
        count: c('approval')
      }, {
        id: 'working',
        label: 'Working',
        count: c('working')
      }],
      value: f,
      onChange: setF
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 240
      }
    }, /*#__PURE__*/React.createElement(Input, {
      icon: "search",
      size: "sm",
      placeholder: "Search students"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
        gap: 12
      }
    }, shown.map(s => /*#__PURE__*/React.createElement(StudentTile, {
      key: s.id,
      name: s.name,
      status: s.status,
      minutes: s.minutes,
      topic: s.topic,
      lastMessage: s.last,
      hasNote: s.note,
      selected: selected === s.id,
      onClick: () => onSelect(s.id)
    }))));
  }
  window.ClassroomLive = ClassroomLive;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/teacher-console/ClassroomLive.jsx", error: String((e && e.message) || e) }); }

// ui_kits/teacher-console/RulesView.jsx
try { (() => {
(() => {
  const {
    RuleCard,
    Textarea,
    Select,
    Button,
    Card,
    Checkbox
  } = window.OrbitDesignSystem_5c1997;
  function RulesView({
    rules,
    setRules,
    toast
  }) {
    const [text, setText] = React.useState('');
    const [scope, setScope] = React.useState('All students');
    const add = () => {
      if (!text.trim()) return;
      setRules(r => [...r, {
        id: 'r' + Date.now(),
        kind: 'behavior',
        rule: text,
        scope
      }]);
      setText('');
      toast('Rule applied to ' + (scope === 'All students' ? '28 tutors' : scope));
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 340px',
        gap: 24,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, rules.map(r => /*#__PURE__*/React.createElement(RuleCard, {
      key: r.id,
      kind: r.kind,
      rule: r.rule,
      scope: r.scope,
      defaultEnabled: !r.off,
      onEdit: () => {}
    }))), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "New rule",
      title: "Tell the tutors how to behave"
    }, /*#__PURE__*/React.createElement(Textarea, {
      mono: true,
      rows: 3,
      value: text,
      onChange: e => setText(e.target.value),
      placeholder: "Give hints, but never reveal the final answer.",
      hint: "Write it the way you\u2019d say it to a teaching assistant."
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Applies to",
      value: scope,
      onChange: e => setScope(e.target.value),
      options: ['All students', 'Maya Kim', 'Leo Park', 'Test mode']
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Tell students about this rule",
      description: "Shown at the top of their tutor.",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement(Button, {
      full: true,
      icon: "check",
      onClick: add
    }, "Apply rule")));
  }
  window.RulesView = RulesView;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/teacher-console/RulesView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/teacher-console/SessionPanel.jsx
try { (() => {
(() => {
  const {
    Avatar,
    Badge,
    IconButton,
    Button,
    ChatMessage,
    ActionRequest,
    RuleCard,
    Textarea,
    Tabs,
    Dialog
  } = window.OrbitDesignSystem_5c1997;
  function SessionPanel({
    student,
    transcript,
    onClose,
    onUpdate,
    toast
  }) {
    const [tab, setTab] = React.useState('session');
    const [note, setNote] = React.useState('');
    const [msgs, setMsgs] = React.useState(transcript);
    const [confirm, setConfirm] = React.useState(false);
    const [req, setReq] = React.useState('pending');
    React.useEffect(() => {
      setMsgs(transcript);
      setTab('session');
      setReq('pending');
    }, [student.id]);
    const L = {
      working: 'Working',
      stuck: 'Stuck',
      approval: 'Needs approval',
      paused: 'Paused',
      offline: 'Offline'
    };
    const send = () => {
      if (!note.trim()) return;
      setMsgs(m => [...m, {
        role: 'teacher',
        time: 'now',
        text: note
      }]);
      setNote('');
      onUpdate({
        note: true
      });
      toast('Note sent to ' + student.name.split(' ')[0]);
    };
    const paused = student.status === 'paused';
    return /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 420,
        flex: 'none',
        borderLeft: '1px solid var(--border-1)',
        background: 'var(--surface-card)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '16px 18px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: student.name,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-h3)'
      }
    }, student.name), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--fg-3)'
      }
    }, student.topic)), /*#__PURE__*/React.createElement(Badge, {
      tone: student.status === 'offline' ? 'neutral' : student.status,
      dot: true
    }, L[student.status]), /*#__PURE__*/React.createElement(IconButton, {
      icon: "x",
      label: "Close",
      size: "sm",
      onClick: onClose
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, paused ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: "play",
      onClick: () => {
        onUpdate({
          status: 'working',
          topic: 'Factoring quadratics'
        });
        toast('Tutor resumed');
      }
    }, "Resume tutor") : /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "danger",
      icon: "pause",
      onClick: () => setConfirm(true)
    }, "Pause tutor"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      icon: "sliders-horizontal",
      onClick: () => setTab('rules')
    }, "Change behavior")), /*#__PURE__*/React.createElement(Tabs, {
      items: [{
        id: 'session',
        label: 'Session'
      }, {
        id: 'rules',
        label: 'Rules',
        count: 3
      }, {
        id: 'files',
        label: 'Files',
        count: 2
      }],
      value: tab,
      onChange: setTab
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: tab === 'session' ? 'var(--surface-page)' : 'var(--surface-card)'
      }
    }, tab === 'session' && /*#__PURE__*/React.createElement(React.Fragment, null, student.status === 'approval' && /*#__PURE__*/React.createElement(ActionRequest, {
      student: student.name,
      action: "run code",
      detail: 'python3 check_factors.py\n# expands (x+3)(x-2)',
      time: "1 min ago",
      state: req,
      onApprove: () => {
        setReq('approved');
        onUpdate({
          status: 'working'
        });
        toast('Approved once for ' + student.name.split(' ')[0]);
      },
      onDeny: () => {
        setReq('denied');
        onUpdate({
          status: 'working'
        });
      }
    }), msgs.map((m, i) => /*#__PURE__*/React.createElement(ChatMessage, {
      key: i,
      role: m.role,
      time: m.time,
      author: m.role === 'teacher' ? 'Ms. Ortega' : m.role === 'student' ? student.name.split(' ')[0] : undefined,
      meta: m.meta
    }, m.text)), paused && /*#__PURE__*/React.createElement(ChatMessage, {
      role: "system"
    }, "You paused this tutor.")), tab === 'rules' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--fg-3)'
      }
    }, "Rules applied to ", student.name.split(' ')[0], "\u2019s tutor right now."), /*#__PURE__*/React.createElement(RuleCard, {
      rule: "Give hints, but never reveal the final answer.",
      scope: "All students"
    }), /*#__PURE__*/React.createElement(RuleCard, {
      rule: "This student needs more scaffolding.",
      scope: student.name
    }), /*#__PURE__*/React.createElement(RuleCard, {
      kind: "permission",
      rule: "Let students read files, but don\u2019t let them run code.",
      scope: "All students"
    })), tab === 'files' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, ['worksheet-4.2.pdf', 'my-work.jpg'].map(f => /*#__PURE__*/React.createElement("div", {
      key: f,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-sm)',
        font: 'var(--type-rule)'
      }
    }, f, /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        font: 'var(--type-caption)',
        color: 'var(--fg-3)'
      }
    }, "Tutor can read"))))), tab === 'session' && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        borderTop: '1px solid var(--border-1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'var(--surface-card)'
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      rows: 2,
      value: note,
      onChange: e => setNote(e.target.value),
      placeholder: 'Leave a note for ' + student.name.split(' ')[0] + '…'
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--fg-3)'
      }
    }, "Appears in the student\u2019s session as a teacher note."), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "teacher",
      icon: "sticky-note",
      onClick: send
    }, "Send note"))), /*#__PURE__*/React.createElement(Dialog, {
      open: confirm,
      title: 'Pause ' + student.name.split(' ')[0] + '’s tutor?',
      description: student.name.split(' ')[0] + ' will see “Your teacher paused the tutor.” You can resume anytime.',
      onClose: () => setConfirm(false),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setConfirm(false)
      }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        icon: "pause",
        onClick: () => {
          setConfirm(false);
          onUpdate({
            status: 'paused',
            topic: 'Paused by you'
          });
          toast('Tutor paused');
        }
      }, "Pause tutor"))
    }));
  }
  window.SessionPanel = SessionPanel;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/teacher-console/SessionPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/teacher-console/Sidebar.jsx
try { (() => {
(() => {
  const {
    Logo,
    Icon,
    Avatar
  } = window.OrbitDesignSystem_5c1997;
  function Sidebar({
    view,
    setView,
    klass
  }) {
    const items = [['live', 'layout-grid', 'Live classroom'], ['rules', 'scroll-text', 'Tutor rules'], ['insights', 'chart-no-axes-column', 'Insights'], ['files', 'folder', 'Class files']];
    return /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 'var(--sidebar-w)',
        flex: 'none',
        background: 'var(--surface-page)',
        borderRight: '1px solid var(--border-1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 12px',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 10px'
      }
    }, /*#__PURE__*/React.createElement(Logo, {
      size: 26
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 10px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-eyebrow)',
        letterSpacing: 'var(--ls-caps)',
        textTransform: 'uppercase',
        color: 'var(--fg-3)',
        marginBottom: 6
      }
    }, "Class"), /*#__PURE__*/React.createElement("button", {
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 10px',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-card)',
        font: 'var(--type-label)',
        color: 'var(--fg-1)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        textAlign: 'left'
      }
    }, klass), /*#__PURE__*/React.createElement(Icon, {
      name: "chevrons-up-down",
      size: 14,
      color: "var(--fg-3)"
    }))), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, items.map(([id, ic, l]) => {
      const a = view === id;
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => setView(id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 34,
          padding: '0 10px',
          border: 0,
          borderRadius: 'var(--radius-sm)',
          background: a ? 'var(--plum-50)' : 'transparent',
          color: a ? 'var(--plum-700)' : 'var(--fg-2)',
          font: 'var(--type-label)',
          fontSize: 14,
          cursor: 'pointer',
          textAlign: 'left'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: ic,
        size: 16
      }), l);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Ana Ortega",
      teacher: true,
      size: 28
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)'
      }
    }, "Ana Ortega"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--fg-3)'
      }
    }, "Lincoln High"))));
  }
  window.Sidebar = Sidebar;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/teacher-console/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/teacher-console/TeacherApp.jsx
try { (() => {
(() => {
  const {
    Button,
    Switch,
    Toast,
    Badge,
    Icon
  } = window.OrbitDesignSystem_5c1997;
  function TeacherApp() {
    const D = window.ORBIT_DATA;
    const [view, setView] = React.useState('live');
    const [students, setStudents] = React.useState(D.students);
    const [sel, setSel] = React.useState(1);
    const [rules, setRules] = React.useState(D.rules);
    const [test, setTest] = React.useState(false);
    const [t, setT] = React.useState(null);
    const toast = m => {
      setT(m);
      clearTimeout(window.__tt);
      window.__tt = setTimeout(() => setT(null), 2600);
    };
    const student = students.find(s => s.id === sel);
    const upd = p => setStudents(ss => ss.map(s => s.id === sel ? {
      ...s,
      ...p
    } : s));
    const titles = {
      live: 'Live classroom',
      rules: 'Tutor rules',
      insights: 'Insights',
      files: 'Class files'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: '100%',
        background: 'var(--bg-app)'
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      view: view,
      setView: setView,
      klass: D.klass
    }), /*#__PURE__*/React.createElement("main", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("header", {
      style: {
        height: 'var(--topbar-h)',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 28px',
        borderBottom: '1px solid var(--border-1)',
        background: 'var(--surface-page)'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        font: 'var(--type-h1)',
        fontSize: 26,
        letterSpacing: 'var(--ls-display)'
      }
    }, titles[view]), view === 'live' && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        font: 'var(--type-caption)',
        color: 'var(--state-working-ink)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--state-working)'
      }
    }), "Live \xB7 26 of 28 signed in"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, test && /*#__PURE__*/React.createElement(Badge, {
      tone: "teacher"
    }, "Test mode on"), /*#__PURE__*/React.createElement(Switch, {
      checked: test,
      onChange: v => {
        setTest(v);
        toast(v ? 'Test mode on — tutors will only clarify questions' : 'Test mode off');
      },
      label: "Test mode"
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      icon: "pause"
    }, "Pause all"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minHeight: 0,
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        overflow: 'auto',
        padding: 28
      }
    }, view === 'live' && /*#__PURE__*/React.createElement(ClassroomLive, {
      students: students,
      selected: sel,
      onSelect: setSel,
      sticking: D.sticking
    }), view === 'rules' && /*#__PURE__*/React.createElement(RulesView, {
      rules: rules,
      setRules: setRules,
      toast: toast
    }), (view === 'insights' || view === 'files') && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 60,
        textAlign: 'center',
        color: 'var(--fg-3)',
        font: 'var(--type-body)'
      }
    }, "Not designed yet.")), view === 'live' && student && /*#__PURE__*/React.createElement(SessionPanel, {
      student: student,
      transcript: sel === 1 ? D.transcript : [{
        role: 'student',
        time: '10:41',
        text: student.last || '—'
      }, {
        role: 'tutor',
        time: '10:41',
        text: 'Let’s look at that together. What have you tried so far?',
        meta: 'Hint given · answer withheld'
      }],
      onClose: () => setSel(null),
      onUpdate: upd,
      toast: toast
    }))), t && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        left: 'calc(var(--sidebar-w) + 24px)',
        bottom: 24,
        zIndex: 200
      }
    }, /*#__PURE__*/React.createElement(Toast, {
      tone: "success",
      title: t
    })));
  }
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(TeacherApp, null));
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/teacher-console/TeacherApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/teacher-console/data.js
try { (() => {
window.ORBIT_DATA = {
  teacher: 'Ana Ortega',
  klass: 'Period 3 · Algebra I',
  students: [{
    id: 1,
    name: 'Maya Kim',
    status: 'stuck',
    minutes: 6,
    topic: 'Factoring quadratics',
    last: 'Why does (x+3)(x−2) not give −6x in the middle?'
  }, {
    id: 2,
    name: 'Leo Park',
    status: 'approval',
    minutes: 1,
    topic: 'Factoring quadratics',
    last: 'Can you check my work by running it?'
  }, {
    id: 3,
    name: 'Priya Shah',
    status: 'working',
    minutes: 14,
    topic: 'Factoring quadratics',
    last: 'So I need two numbers that multiply to 12 and add to 7.'
  }, {
    id: 4,
    name: 'Sam Diaz',
    status: 'working',
    minutes: 9,
    topic: 'Problem set 4.2',
    last: 'Is the leading coefficient always 1?'
  }, {
    id: 5,
    name: 'Noah Becker',
    status: 'stuck',
    minutes: 11,
    topic: 'Factoring quadratics',
    last: 'I keep getting the signs backwards.'
  }, {
    id: 6,
    name: 'Ava Thompson',
    status: 'working',
    minutes: 4,
    topic: 'Problem set 4.2',
    last: 'Got #3. Moving to #4.'
  }, {
    id: 7,
    name: 'Jonah Reyes',
    status: 'paused',
    minutes: null,
    topic: 'Paused by you',
    last: ''
  }, {
    id: 8,
    name: 'Zoe Laurent',
    status: 'working',
    minutes: 7,
    topic: 'Factoring quadratics',
    last: 'What does “GCF” stand for again?'
  }, {
    id: 9,
    name: 'Omar Haddad',
    status: 'stuck',
    minutes: 8,
    topic: 'Problem set 4.2',
    last: 'Just tell me the answer to #5.'
  }, {
    id: 10,
    name: 'Lily Chen',
    status: 'working',
    minutes: 12,
    topic: 'Problem set 4.2',
    last: 'Checking #6 against the example.'
  }, {
    id: 11,
    name: 'Ethan Brooks',
    status: 'offline',
    minutes: null,
    topic: 'Not signed in',
    last: ''
  }, {
    id: 12,
    name: 'Isla Novak',
    status: 'working',
    minutes: 3,
    topic: 'Factoring quadratics',
    last: 'Can I factor out a 2 first?'
  }],
  transcript: [{
    role: 'student',
    time: '10:38',
    text: 'How do I factor x² + x − 6?'
  }, {
    role: 'tutor',
    time: '10:38',
    text: 'Start by looking for two numbers. What should they multiply to, and what should they add to?',
    meta: 'Hint given · answer withheld'
  }, {
    role: 'student',
    time: '10:40',
    text: 'Multiply to −6 and add to 1. So 3 and −2?'
  }, {
    role: 'tutor',
    time: '10:40',
    text: 'Good. Now write it as two binomials and expand them to check.',
    meta: 'Scaffolding · rule “More scaffolding for Maya”'
  }, {
    role: 'student',
    time: '10:42',
    text: 'Why does (x+3)(x−2) not give −6x in the middle?'
  }],
  rules: [{
    id: 'r1',
    kind: 'behavior',
    rule: 'Give hints, but never reveal the final answer.',
    scope: 'All students'
  }, {
    id: 'r2',
    kind: 'permission',
    rule: 'Let students read files, but don’t let them run code.',
    scope: 'All students'
  }, {
    id: 'r3',
    kind: 'behavior',
    rule: 'This student needs more scaffolding.',
    scope: 'Maya Kim'
  }, {
    id: 'r4',
    kind: 'mode',
    rule: 'During the test, only clarify questions. Don’t solve anything.',
    scope: 'Test mode',
    off: true
  }],
  sticking: [['Sign errors with a negative constant', 6], ['Choosing the factor pair', 4], ['Checking by expanding', 2]]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/teacher-console/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.ActionRequest = __ds_scope.ActionRequest;

__ds_ns.ChatMessage = __ds_scope.ChatMessage;

__ds_ns.RuleCard = __ds_scope.RuleCard;

__ds_ns.StudentTile = __ds_scope.StudentTile;

})();
