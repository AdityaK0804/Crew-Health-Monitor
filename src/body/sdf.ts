// Generates the 3D body as a cloud of surface points.
// The body is described as a set of rounded shapes (capsules and ellipsoids) that are
// blended smoothly together, then points are placed on the blended surface.
// This is a body-shaped visualisation for showing WHERE a finding is. It is not an
// anatomical model: there are no organs in it.

export type Build = 'male' | 'female'
export type Vec3 = [number, number, number]

interface Prim {
  kind: 'cap' | 'ell'
  a: Vec3 // capsule start, or ellipsoid centre
  b: Vec3 // capsule end, or ellipsoid radii
  r: number // capsule radius (unused for ellipsoid)
}

const BLEND = 0.034

function shape(build: Build) {
  return build === 'male' ? { s: 1.08, w: 1.0, h: 0.96 } : { s: 0.94, w: 0.86, h: 1.08 }
}

function prims(build: Build): Prim[] {
  const { s, w, h } = shape(build)
  const cap = (a: Vec3, b: Vec3, r: number): Prim => ({ kind: 'cap', a, b, r })
  const ell = (c: Vec3, radii: Vec3): Prim => ({ kind: 'ell', a: c, b: radii, r: 0 })
  const list: Prim[] = [
    ell([0, 1.63, 0.005], [0.092, 0.118, 0.104]), // head
    cap([0, 1.44, -0.005], [0, 1.52, 0], 0.048), // neck
    cap([-0.165 * s, 1.4, -0.01], [0.165 * s, 1.4, -0.01], 0.058), // shoulder line
    ell([0, 1.29, 0], [0.158 * s, 0.165, 0.104]), // chest
    ell([0, 1.1, 0], [0.124 * w, 0.15, 0.09]), // waist
    ell([0, 0.95, -0.005], [0.166 * h, 0.125, 0.112]), // hips
  ]
  if (build === 'female') {
    list.push(ell([-0.068, 1.295, 0.082], [0.052, 0.05, 0.045]), ell([0.068, 1.295, 0.082], [0.052, 0.05, 0.045]))
  }
  for (const m of [-1, 1]) {
    list.push(
      cap([m * 0.2 * s, 1.385, -0.01], [m * 0.305 * s, 1.14, -0.02], 0.043), // upper arm
      cap([m * 0.305 * s, 1.14, -0.02], [m * 0.385 * s, 0.9, 0.03], 0.034), // forearm
      ell([m * 0.41 * s, 0.815, 0.045], [0.028, 0.07, 0.022]), // hand
      cap([m * 0.09 * h, 0.89, 0], [m * 0.108, 0.52, 0.005], 0.07), // thigh
      cap([m * 0.108, 0.52, 0.005], [m * 0.118, 0.11, -0.01], 0.046), // lower leg
      cap([m * 0.118, 0.04, -0.01], [m * 0.125, 0.035, 0.13], 0.036), // foot
    )
  }
  return list
}

function distance(x: number, y: number, z: number, list: Prim[]): number {
  let d = 1e9
  for (const p of list) {
    let di: number
    if (p.kind === 'cap') {
      const bax = p.b[0] - p.a[0], bay = p.b[1] - p.a[1], baz = p.b[2] - p.a[2]
      const pax = x - p.a[0], pay = y - p.a[1], paz = z - p.a[2]
      const t = Math.max(0, Math.min(1, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)))
      di = Math.hypot(pax - bax * t, pay - bay * t, paz - baz * t) - p.r
    } else {
      const qx = x - p.a[0], qy = y - p.a[1], qz = z - p.a[2]
      const k0 = Math.hypot(qx / p.b[0], qy / p.b[1], qz / p.b[2])
      const k1 = Math.hypot(qx / (p.b[0] * p.b[0]), qy / (p.b[1] * p.b[1]), qz / (p.b[2] * p.b[2]))
      di = k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(p.b[0], p.b[1], p.b[2])
    }
    const hh = Math.max(BLEND - Math.abs(d - di), 0) / BLEND
    d = Math.min(d, di) - hh * hh * BLEND * 0.25
  }
  return d
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface BodyPoints {
  positions: Float32Array
  normals: Float32Array
}

const cache = new Map<string, BodyPoints>()

export function sampleBody(build: Build, count: number): BodyPoints {
  const key = `${build}:${count}`
  const hit = cache.get(key)
  if (hit) return hit

  const list = prims(build)
  const rand = rng(build === 'male' ? 11 : 29)
  const areas = list.map((p) => {
    if (p.kind === 'cap') return 2 * Math.PI * p.r * (Math.hypot(p.b[0] - p.a[0], p.b[1] - p.a[1], p.b[2] - p.a[2]) + 2 * p.r)
    const [a, b, c] = p.b
    return 4 * Math.PI * Math.pow((Math.pow(a * b, 1.6) + Math.pow(a * c, 1.6) + Math.pow(b * c, 1.6)) / 3, 1 / 1.6)
  })
  const total = areas.reduce((x, y) => x + y, 0)
  const positions = new Float32Array(count * 3)
  const normals = new Float32Array(count * 3)
  const e = 0.002
  const grad = (x: number, y: number, z: number): Vec3 => {
    const gx = distance(x + e, y, z, list) - distance(x - e, y, z, list)
    const gy = distance(x, y + e, z, list) - distance(x, y - e, z, list)
    const gz = distance(x, y, z + e, list) - distance(x, y, z - e, list)
    const len = Math.hypot(gx, gy, gz) || 1
    return [gx / len, gy / len, gz / len]
  }

  let n = 0
  let guard = 0
  while (n < count && guard++ < count * 6) {
    let pick = rand() * total
    let p = list[0]
    for (let i = 0; i < list.length; i++) {
      pick -= areas[i]
      if (pick <= 0) {
        p = list[i]
        break
      }
    }
    const u = rand() * 2 - 1
    const th = rand() * Math.PI * 2
    const sr = Math.sqrt(1 - u * u)
    const dx = sr * Math.cos(th), dy = u, dz = sr * Math.sin(th)
    let x: number, y: number, z: number
    if (p.kind === 'cap') {
      const t = rand()
      x = p.a[0] + (p.b[0] - p.a[0]) * t + dx * p.r
      y = p.a[1] + (p.b[1] - p.a[1]) * t + dy * p.r
      z = p.a[2] + (p.b[2] - p.a[2]) * t + dz * p.r
    } else {
      x = p.a[0] + dx * p.b[0]
      y = p.a[1] + dy * p.b[1]
      z = p.a[2] + dz * p.b[2]
    }
    for (let i = 0; i < 3; i++) {
      const d = distance(x, y, z, list)
      const g = grad(x, y, z)
      x -= g[0] * d
      y -= g[1] * d
      z -= g[2] * d
    }
    if (Math.abs(distance(x, y, z, list)) > 0.003) continue
    const g = grad(x, y, z)
    positions.set([x, y, z], n * 3)
    normals.set(g, n * 3)
    n++
  }
  const out = { positions, normals }
  cache.set(key, out)
  return out
}

/** Where each signal sits on the body. */
export function regionOf(findingId: string, build: Build): { pos: Vec3; label: string } | null {
  const { s } = shape(build)
  switch (findingId) {
    case 'onsd':
      return { pos: [0.034, 1.645, 0.1], label: 'Eyes' }
    case 'headache':
      return { pos: [-0.03, 1.72, 0.06], label: 'Head' }
    case 'sleep':
      return { pos: [0.02, 1.7, -0.08], label: 'Brain and sleep' }
    case 'ijv':
      return { pos: [0.045, 1.49, 0.02], label: 'Neck vein' }
    case 'vitals':
      return { pos: [-0.04, 1.3, 0.105], label: 'Heart and lungs' }
    case 'immune':
      return { pos: [0, 1.42, 0.07], label: 'Immune cells' }
    case 'vitd':
      return { pos: [0.1, 0.86, 0.03], label: 'Vitamin D' }
    case 'bodymass':
      return { pos: [0, 1.05, 0.1], label: 'Body mass' }
    case 'mood':
      return { pos: [0, 1.7, 0.02], label: 'Mood' }
    case 'basics':
      return { pos: [0.1, 1.36, 0.08], label: 'Basic checks' }
    case 'urine':
      return { pos: [0.06, 1.12, -0.02], label: 'Kidneys' }
    case 'exercise':
      return { pos: [-0.1, 0.9, 0.02], label: 'Hip bone' }
    case 'hematocrit':
      return { pos: [0.305 * s, 1.14, 0.02], label: 'Blood' }
    default:
      return null
  }
}
