# Tracer Component
![Tracer Component](./src/assets/plot-function-1.png)

A Flexible function tracer for Vue 3, allowing users to plot mathematical expressions, manipulate variables in real-time, and perform calculus operations.

## Main Features

### Plot Capabilities
- **Dynamic Plotting**: Renders mathematical functions of `x` (e.g., `A*sin(B*x - C)`) using `function-plot`.
- **Real-time Variables**: Define and manipulate variables (A, B, C, etc.) via interactive sliders, with immediate plot updates.
- **Interactive Navigation**:
  - **Zoom**: Use the mouse wheel to zoom in and out of the plot.
  - **Pan**: Click and drag to navigate through different areas of the coordinate system.
- **Resizable Container**: The plot area is both vertically and horizontally resizable with a custom, highly visible handle.
- **Export to PNG**: High-quality export of the current plot, including the function expression and any calculated results (zeros, extrema, integral).
- **Responsive Design**: Adapts to different screen sizes with a clean, Tailwind-based UI.
- **Customizable Visibility**: Hide or show specific sections (Axis Bounds, Variables, Calculus, Expression Input) via component props.

### Calculus Features
- **Zero Finding**: Numerically find and highlight the zeros (roots) of the function within the visible X-axis bounds.
- **Extrema Detection**: Identify and mark local maxima and minima of the expression.
- **Numerical Integration**:
  - Approximate the definite integral between two custom bounds.
  - Visual representation of the integration interval on the plot.
- **Point Highlighting**: Clicking on calculated results (zeros or extrema) highlights the exact point on the plot for better visualization.

## Usage

```vue
<script setup>
import { ref } from 'vue'
import Tracer from '@ernestopinto/tracer'

const functions = ref({
  f: [
    { name: "Sine Wave", f: "A*sin(B*x)" }
  ],
  d: {
    axxis: true,
    vars: true,
    calc: true,
    expr: true
  }
})
</script>

<template>
  <Tracer v-model:defs="functions" />
</template>
```
