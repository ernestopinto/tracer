<template>
  <section class="w-full p-0">
    <header class="mb-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Tracer</h2>
          <p class="text-sm text-gray-600">
            Type a function of <span class="font-mono text-gray-800">x</span> (example:
            <span class="font-mono text-gray-800">x^2 + A - C</span>)
          </p>
        </div>

        <button
            type="button"
            class="shrink-0 rounded-lg px-3 py-2 border border-gray-300 bg-white
                 text-sm text-gray-800 hover:bg-gray-50 transition"
            @click="resetView"
            title="Reset view"
        >
          Reset view
        </button>
      </div>
    </header>

    <!-- Expression input -->
    <label class="block">
      <div class="text-xs text-gray-600 mb-1">f(x)</div>
      <input
          v-model="expr"
          class="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900
               outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="x^2 + A - C"
          autocomplete="off"
          spellcheck="false"
      />
    </label>

    <!-- Variables A / B / C -->
    <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div
          v-for="key in (['A','B','C'] as const)"
          :key="key"
          class="rounded-xl border border-gray-200 bg-white p-3"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="font-semibold text-gray-900">{{ key }}</div>
          <div class="text-sm font-mono text-gray-700">{{ vars[key].value.toFixed(1) }}</div>
        </div>

        <div class="flex items-center gap-2">
          <label class="flex-1">
            <div class="text-[11px] text-gray-500 mb-1">min</div>
            <input
                type="number"
                v-model.number="vars[key].min"
                @change="onVarBoundsChange(key)"
                class="w-full rounded-lg bg-white border border-gray-300 px-2 py-1 text-gray-900
                     outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label class="flex-1">
            <div class="text-[11px] text-gray-500 mb-1">max</div>
            <input
                type="number"
                v-model.number="vars[key].max"
                @change="onVarBoundsChange(key)"
                class="w-full rounded-lg bg-white border border-gray-300 px-2 py-1 text-gray-900
                     outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>

        <input
            class="mt-3 w-full"
            type="range"
            :min="vars[key].min"
            :max="vars[key].max"
            :step="0.1"
            v-model.number="vars[key].value"
            @input="onVarValueInput(key)"
        />
      </div>
    </div>

    <!-- Plot -->
    <div class="mt-4 rounded-xl border border-gray-200 bg-white p-2">
      <div ref="plotEl" class="w-full select-none" style="height: 420px;"></div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-red-600">
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import functionPlot from "function-plot";

type Bounds = { x: [number, number]; y: [number, number] };
type VarKey = "A" | "B" | "C";
type VarState = { min: number; max: number; value: number };

const DEFAULT_BOUNDS: Bounds = { x: [-2, 5], y: [-5, 5] };

// default
const expr = ref("A*sin(B*x - C)");

const error = ref<string | null>(null);
const plotEl = ref<HTMLDivElement | null>(null);

const vars = ref<Record<VarKey, VarState>>({
  A: { min: -1, max: 6, value: 1 },
  B: { min: -1, max: 6, value: 1 },
  C: { min: -1, max: 6, value: 1 },
});

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

  if (v.min > v.max) {
    const tmp = v.min;
    v.min = v.max;
    v.max = tmp;
  }

  v.value = clamp(v.value, v.min, v.max);
}

function substituteVars(expression: string) {
  return expression
      .replace(/\bA\b/g, `(${vars.value.A.value})`)
      .replace(/\bB\b/g, `(${vars.value.B.value})`)
      .replace(/\bC\b/g, `(${vars.value.C.value})`);
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

  try {
    functionPlot({
      target: plotEl.value,
      width: plotEl.value.clientWidth || 800,
      height: 420,
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

function onVarValueInput(key: VarKey) {
  normalizeVar(key);
  renderPlot(); // live update while sliding
}

function onVarBoundsChange(key: VarKey) {
  normalizeVar(key);
  scheduleRender(); // debounced
}

onMounted(() => {
  renderPlot();
  window.addEventListener("resize", scheduleRender);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", scheduleRender);
  if (debounceTimer) window.clearTimeout(debounceTimer);
  detachWheel();
});

// typing changes: debounced
watch(expr, () => scheduleRender());
watch(vars, () => scheduleRender(), { deep: true });
</script>
