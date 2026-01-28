<template>
  <section class="w-full p-0">
    <header class="mb-4 print:hidden">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Tracer</h2>
          <p class="text-sm text-gray-600">
            Type a function of <span class="font-mono text-gray-800">x</span> (example:
            <span class="font-mono text-gray-800">x^2 + A - C</span>)
          </p>
        </div>

        <div class="flex gap-2">
          <button
              type="button"
              class="shrink-0 rounded-lg px-3 py-2 border border-gray-300 bg-white
                 text-sm text-gray-800 hover:bg-gray-50 transition print:hidden"
              @click="resetView"
              title="Reset view"
          >
            Reset view
          </button>
          <button
              type="button"
              class="shrink-0 rounded-lg px-3 py-2 border border-gray-300 bg-white
                 text-sm text-gray-800 hover:bg-gray-50 transition print:hidden flex items-center gap-1.5"
              @click="printPlot"
              title="Print plot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print
          </button>
          <button
              type="button"
              class="shrink-0 rounded-lg px-3 py-2 border border-gray-300 bg-white
                 text-sm text-gray-800 hover:bg-gray-50 transition print:hidden flex items-center gap-1.5"
              @click="exportAsPng"
              title="Export as PNG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-col gap-6 print:gap-2 print:block">
      <div class="hidden print:block mb-2">
        <h1 class="text-2xl font-bold text-gray-900">{{ activeFunctionName || 'Plot' }}</h1>
        <div class="text-lg font-mono text-blue-600 mt-1">
          f(x) = {{ substitutedExpression }}
        </div>
      </div>

      <!-- Functions -->
      <div v-if="props.evals && props.evals.length > 0" class="flex flex-wrap gap-2 print:hidden">
        <button
            v-for="item in props.evals"
            :key="item.name"
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium border transition-colors"
            :class="activeFunctionName === item.name
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
            @click="setExpr(item.f, item.name)"
        >
          {{ item.name }}
        </button>
      </div>

    <!-- Expression input -->
      <div class="space-y-2 print:hidden">
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex-1 space-y-1">
            <div class="text-xs text-gray-600 ml-1">Name</div>
            <input
                v-model="activeFunctionName"
                class="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900
                     outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                placeholder="Function name"
                autocomplete="off"
                spellcheck="false"
            />
          </div>
          <div class="flex-[2] space-y-1">
            <div class="text-xs text-gray-600 ml-1">f(x)</div>
            <div class="flex gap-2">
              <input
                  v-model="expr"
                  class="flex-1 rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900
                       outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="x^2 + A - C"
                  autocomplete="off"
                  spellcheck="false"
              />
              <button
                  type="button"
                  class="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white
                       hover:bg-blue-700 active:scale-[0.98] transition shadow-sm disabled:opacity-50"
                  @click="saveFunction"
                  :disabled="!expr.trim()"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
          <div v-if="successMessage" class="text-xs font-medium text-green-600 ml-1">
            {{ successMessage }}
          </div>
        </transition>
      </div>

      <!-- Variables -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:hidden">
        <div
            v-for="(state, key) in vars"
            :key="key"
            class="rounded-xl border border-gray-200 bg-white p-3"
        >
          <div class="flex items-center justify-between mb-2 px-2">
            <div class="font-semibold text-gray-900">{{ key }}</div>
            <div class="text-sm font-mono text-gray-700">
              {{ state.value.toFixed(1) }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-3 px-1">
            <label class="block">
              <span class="text-[10px] text-gray-500 uppercase px-1">Min</span>
              <input 
                v-model.number="state.min" 
                type="number" 
                class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 outline-none" 
                @input="onVarBoundsChange(key as string)"
              />
            </label>
            <label class="block">
              <span class="text-[10px] text-gray-500 uppercase px-1">Max</span>
              <input 
                v-model.number="state.max" 
                type="number" 
                class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 outline-none" 
                @input="onVarBoundsChange(key as string)"
              />
            </label>
          </div>

          <input
              class="w-full"
              type="range"
              :min="state.min"
              :max="state.max"
              :step="0.1"
              v-model.number="state.value"
              @input="onVarValueInput(key)"
          />
        </div>

        <!-- Add new variable -->
        <div v-if="nextVarKey" class="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-3">
          <div class="flex items-center justify-between mb-2 px-2">
            <div class="font-semibold text-gray-500">New ({{ nextVarKey }})</div>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-2">
            <label class="block">
              <span class="text-[10px] text-gray-500 uppercase px-1">Min</span>
              <input v-model.number="newVarMin" type="number" class="w-full rounded border border-gray-200 px-2 py-1 text-xs" />
            </label>
            <label class="block">
              <span class="text-[10px] text-gray-500 uppercase px-1">Max</span>
              <input v-model.number="newVarMax" type="number" class="w-full rounded border border-gray-200 px-2 py-1 text-xs" />
            </label>
          </div>

          <button
              @click="addVariable"
              class="w-full rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition"
          >
            Add Variable {{ nextVarKey }}
          </button>
        </div>
      </div>


    </div>

    <!-- Plot -->
    <div class="space-y-1 print:hidden">
      <div class="pt-10 text-[10px] text-gray-500 ml-1 uppercase font-semibold tracking-wider">Function</div>
      <input
          :value="'f(x) = ' + substitutedExpression"
          readonly
          class="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-lg font-mono font-bold text-gray-900
                 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 cursor-text"
          title="Current substituted expression (copy-pasteable)"
          @click="($event.target as HTMLInputElement).select()"
      />
    </div>

    <div class="mt-4 rounded-xl border border-gray-200 bg-white p-2 print:border-none print:p-0 print:mt-0">
      <div ref="plotEl" class="w-full select-none h-105 print:h-200"></div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-red-600">
      {{ error }}
    </p>

    <div v-if="props.demoMode && props.evals && props.evals.length > 0" class="mt-6 print:hidden">
      <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Loaded Functions</div>
      <pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto text-xs leading-relaxed text-gray-700"><code>{{ JSON.stringify(props.evals, null, 2) }}</code></pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from "vue";
import functionPlot from "function-plot";
import type { EvalData } from "./types";

const props = withDefaults(defineProps<{
  evals?: EvalData[];
  demoMode?: boolean;
}>(), {
  evals: () => [
    {
      "name": "Function 1",
      "f": "A*Sin(B*x)"
    }
  ],
  demoMode: false
});

const emit = defineEmits<{
  (e: 'update:evals', value: EvalData[]): void;
}>();

type Bounds = { x: [number, number]; y: [number, number] };
type VarKey = string;
type VarState = { min: number; max: number; value: number };

const DEFAULT_BOUNDS: Bounds = { x: [-2, 5], y: [-5, 5] };

const STORAGE_KEY_EXPR = "tracer_expr";
const STORAGE_KEY_VARS = "tracer_vars";
const STORAGE_KEY_ACTIVE = "tracer_active_func";

// default
const savedExpr = localStorage.getItem(STORAGE_KEY_EXPR);
const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);

const expr = ref(savedExpr || "A*sin(B*x - C)");
const activeFunctionName = ref(savedActive);
const lastActiveFunctionName = ref(savedActive);

const substitutedExpression = computed(() => substituteVars(expr.value));

const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);
const plotEl = ref<HTMLDivElement | null>(null);

// If nothing in storage, default to first eval if available
onMounted(() => {
  if (!savedExpr && !savedActive && props.evals && props.evals.length > 0) {
    const first = props.evals[0];
    if (first) {
      expr.value = first.f;
      activeFunctionName.value = first.name;
      lastActiveFunctionName.value = first.name;
      
      // Persist immediately as requested "update storage"
      localStorage.setItem(STORAGE_KEY_EXPR, first.f);
      localStorage.setItem(STORAGE_KEY_ACTIVE, first.name);
    }
    
    renderPlot();
  } else {
    renderPlot();
  }
  window.addEventListener("resize", scheduleRender);
});

const savedVars = localStorage.getItem(STORAGE_KEY_VARS);
const vars = ref<Record<string, VarState>>(savedVars ? JSON.parse(savedVars) : {
  A: { min: -1, max: 6, value: 1 },
  B: { min: -1, max: 6, value: 1 },
  C: { min: -1, max: 6, value: 1 },
});

const newVarMin = ref(-1);
const newVarMax = ref(6);

const nextVarKey = computed(() => {
  const keys = Object.keys(vars.value).sort();
  const lastKey = keys[keys.length - 1];
  if (!lastKey) return "A";
  const charCode = lastKey.charCodeAt(0);
  if (charCode >= 90) return null; // Z is 90
  return String.fromCharCode(charCode + 1);
});

function addVariable() {
  const key = nextVarKey.value;
  if (!key) return;

  vars.value[key] = {
    min: newVarMin.value,
    max: newVarMax.value,
    value: (newVarMin.value + newVarMax.value) / 2,
  };
  renderPlot();
}

// ✅ we own bounds so zoom persists across redraws
const bounds = ref<Bounds>({
  x: [...DEFAULT_BOUNDS.x],
  y: [...DEFAULT_BOUNDS.y],
});

let debounceTimer: number | null = null;

// We attach wheel directly to function-plot's overlay rect.
// Keep reference so we can clean it up between renders.
let wheelTarget: SVGRectElement | null = null;

function clamp(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function normalizeVar(key: VarKey) {
  const v = vars.value[key];
  if (!v) return;

  if (v.min > v.max) {
    const tmp = v.min;
    v.min = v.max;
    v.max = tmp;
  }

  v.value = clamp(v.value, v.min, v.max);
}

function substituteVars(expression: string) {
  let res = expression;
  // Sort keys by length descending to avoid partial replacements (though A-Z are single chars)
  // For A-Z it doesn't matter much but it's good practice.
  const keys = Object.keys(vars.value).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const v = vars.value[key];
    if (!v) continue;
    const val = v.value;
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    res = res.replace(regex, `(${val})`);
  }
  return res;
}

function zoomBounds(factor: number) {
  const [x0, x1] = bounds.value.x;
  const [y0, y1] = bounds.value.y;

  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const nx = (x1 - x0) * factor;
  const ny = (y1 - y0) * factor;

  const minSpan = 1e-6;

  bounds.value = {
    x: [cx - Math.max(nx, minSpan) / 2, cx + Math.max(nx, minSpan) / 2],
    y: [cy - Math.max(ny, minSpan) / 2, cy + Math.max(ny, minSpan) / 2],
  };
}

// IMPORTANT: use a stable handler ref for add/remove
function onWheel(e: WheelEvent) {
  // Stop function-plot/d3 from swallowing the wheel
  e.preventDefault();
  e.stopPropagation();
  // stopImmediatePropagation exists on Event in browsers
  e.stopImmediatePropagation?.();

  // Normalize delta for trackpads
  const delta = Math.max(-120, Math.min(120, e.deltaY));
  const factor = delta < 0 ? 0.92 : 1.08;

  zoomBounds(factor);
  renderPlot();
}

function detachWheel() {
  if (wheelTarget) {
    wheelTarget.removeEventListener("wheel", onWheel as any, true);
    wheelTarget = null;
  }
}

async function attachWheelToPlotOverlay() {
  // Wait for DOM to be updated (SVG inserted)
  await nextTick();

  if (!plotEl.value) return;

  // function-plot uses this overlay to capture zoom/drag
  const rect = plotEl.value.querySelector("rect.zoom-and-drag") as SVGRectElement | null;
  if (!rect) return;

  // Remove any previous attachment
  detachWheel();

  wheelTarget = rect;

  // Capture phase so we intercept before any internal handlers
  rect.addEventListener("wheel", onWheel as any, { capture: true, passive: false } as any);
}

function renderPlot() {
  if (!plotEl.value) return;

  error.value = null;

  // Clean old wheel handler before clearing DOM
  detachWheel();
  plotEl.value.innerHTML = "";

  const fn = substituteVars(expr.value);

  // Determine height based on whether we are likely in a print context or just measuring
  // However, clientHeight will give us the CSS height.
  const targetHeight = plotEl.value.clientHeight || 420;

  try {
    functionPlot({
      target: plotEl.value,
      width: plotEl.value.clientWidth || 800,
      height: targetHeight,
      grid: true,

      // We zoom ourselves (bounds), so don't use built-in zoom
      disableZoom: true,

      xAxis: { domain: bounds.value.x },
      yAxis: { domain: bounds.value.y },

      data: [{ fn, sampler: "builtIn", graphType: "polyline" }],
    });

    // Re-attach wheel to the new overlay rect created by functionPlot
    attachWheelToPlotOverlay();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Could not render the expression.";
  }
}

function scheduleRender() {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => renderPlot(), 200);
}

function resetView() {
  bounds.value = { x: [...DEFAULT_BOUNDS.x], y: [...DEFAULT_BOUNDS.y] };
  renderPlot();
}

async function printPlot() {
  // Briefly zoom out and shift Y-axis for print
  const originalBounds = {
    x: [...bounds.value.x] as [number, number],
    y: [...bounds.value.y] as [number, number]
  };
  
  // 1. Zoom out factor 1.2
  const [x0, x1] = bounds.value.x;
  const [y0, y1] = bounds.value.y;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const nx = (x1 - x0) * 1.2;
  const ny = (y1 - y0) * 1.2;

  // 2. Shift domain to the right to push Y-axis (x=0) to the left
  // We'll shift it by about 20% of the new width
  const shift = nx * 0.2;

  bounds.value = {
    x: [(cx - nx / 2) + shift, (cx + nx / 2) + shift],
    y: [cy - ny / 2, cy + ny / 2],
  };

  renderPlot();
  
  // Wait for the taller height and zoom to be applied in DOM
  await nextTick();
  // Small delay to ensure function-plot finishes its async internal render if any
  await new Promise(resolve => setTimeout(resolve, 100));

  window.print();

  // Restore
  bounds.value = originalBounds;
  renderPlot();
}

async function exportAsPng() {
  if (!plotEl.value) return;

  const svg = plotEl.value.querySelector("svg");
  if (!svg) return;

  // 1. Prepare SVG for canvas (needs dimensions and proper serialization)
  const width = svg.clientWidth || svg.viewBox.baseVal.width || 800;
  const height = svg.clientHeight || svg.viewBox.baseVal.height || 420;

  // Clone SVG to avoid modifying the displayed one if we need to add styles
  const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute("width", width.toString());
  clonedSvg.setAttribute("height", height.toString());

  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  // 2. Load into Image and draw to Canvas
  const img = new Image();
  img.crossOrigin = "anonymous";
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  const headerHeight = 40; // Space for the expression text
  canvas.width = width;
  canvas.height = height + headerHeight;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Fill white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the expression text
    ctx.fillStyle = "#111827"; // text-gray-900
    ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    ctx.fillText(`f(x) = ${substitutedExpression.value}`, 10, 25);

    // Draw the plot below the text
    ctx.drawImage(img, 0, headerHeight);

    // 3. Trigger download
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const fileName = activeFunctionName.value 
      ? `plot-${activeFunctionName.value.toLowerCase().replace(/\s+/g, '-')}.png` 
      : 'plot.png';
    
    link.download = fileName;
    link.href = pngUrl;
    link.click();
  }

  // Cleanup
  URL.revokeObjectURL(url);
}

function onVarValueInput(key: VarKey) {
  normalizeVar(key);
  renderPlot(); // live update while sliding
}

function onVarBoundsChange(key: VarKey) {
  normalizeVar(key);
  scheduleRender(); // debounced
}

onBeforeUnmount(() => {
  window.removeEventListener("resize", scheduleRender);
  if (debounceTimer) window.clearTimeout(debounceTimer);
  detachWheel();
});

function setExpr(next: string, name?: string | null) {
  expr.value = next;
  if (name) {
    activeFunctionName.value = name;
    lastActiveFunctionName.value = name;
  } else {
    // If it's just a string from outside, try to find if it matches an existing one
    const found = props.evals?.find(e => e.f === next);
    const foundName = found ? found.name : null;
    activeFunctionName.value = foundName;
    lastActiveFunctionName.value = foundName;
  }
  renderPlot();
}

function showSuccess(msg: string) {
  successMessage.value = msg;
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
}

function saveFunction() {
  if (!expr.value.trim()) return;
  const newEvals = [...(props.evals || [])];
  
  if (newEvals.length === 0) return;

  const currentName = activeFunctionName.value?.trim() || null;
  const currentExpr = expr.value.trim();

  // Use lastActiveFunctionName to find what we are editing
  const originalName = lastActiveFunctionName.value;
  const index = originalName 
    ? newEvals.findIndex(i => i.name === originalName)
    : -1;

  if (index !== -1) {
    // Updating/Renaming existing
    const item = newEvals[index];
    if (item) {
      const oldName = item.name;
      const newName = currentName || oldName;
      
      newEvals[index] = {
        ...item,
        name: newName,
        f: currentExpr
      };
      
      activeFunctionName.value = newName;
      lastActiveFunctionName.value = newName;
      
      // Explicitly update localStorage for immediate persistence of current session state
      localStorage.setItem(STORAGE_KEY_ACTIVE, newName);
      localStorage.setItem(STORAGE_KEY_EXPR, currentExpr);
      
      showSuccess(`Updated ${newName}`);
    }
  } else {
    // Fallback: try to find by current name if no lastActive was set
    const existingIdx = currentName ? newEvals.findIndex(i => i.name === currentName) : -1;
    
    if (existingIdx !== -1 && currentName) {
      const item = newEvals[existingIdx];
      if (item) {
        newEvals[existingIdx] = {
          ...item,
          f: currentExpr
        };
        
        activeFunctionName.value = currentName;
        lastActiveFunctionName.value = currentName;
        
        localStorage.setItem(STORAGE_KEY_ACTIVE, currentName);
        localStorage.setItem(STORAGE_KEY_EXPR, currentExpr);
        
        showSuccess(`Updated ${currentName}`);
      }
    }
  }
  emit('update:evals', newEvals);
}

defineExpose({ setExpr });


// typing changes: debounced
watch(expr, (newVal) => {
  localStorage.setItem(STORAGE_KEY_EXPR, newVal);
  scheduleRender();
});

watch(activeFunctionName, (newVal) => {
  if (newVal) {
    localStorage.setItem(STORAGE_KEY_ACTIVE, newVal);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
  }
});
watch(vars, (newVal) => {
  localStorage.setItem(STORAGE_KEY_VARS, JSON.stringify(newVal));
  scheduleRender();
}, { deep: true });
</script>
